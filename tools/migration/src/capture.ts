import { parseModel, report, type Model } from './evidence.js';

export const MAX_PACKETS = 25000;
const KNOWN_HOSTS = new Set(['ota.awair.is', 'messaging.awair.is', 'timeserver.awair.is']);
const FIELDS = new Set([
  'ip.src', 'ip.dst', 'ipv6.src', 'ipv6.dst', 'dns.flags.response', 'dns.qry.name',
  'tls.handshake.extensions_server_name', 'tls.alert_message.desc', 'http.host'
]);
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function normalizeIp(value: string): string {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    const parts = value.split('.');
    if (parts.every(p => Number(p) <= 255 && (p.length === 1 || !p.startsWith('0')))) return value;
  } else if (/^[0-9a-fA-F:]+$/.test(value) && value.includes(':')) {
    try { return new URL(`http://[${value}]/`).hostname.slice(1, -1).toLowerCase(); } catch { /* reject */ }
  }
  throw new Error('Specify a literal IPv4 or IPv6 IP address without a port, brackets or zone.');
}

function fieldsFrom(value: unknown): Map<string, string[]> {
  const fields = new Map<string, string[]>();
  let nodes = 0;
  const visit = (item: unknown, depth: number) => {
    if (++nodes > 10000) throw new Error('TShark packet dissection exceeds the node limit.');
    if (depth > 20) throw new Error('TShark packet dissection exceeds the depth limit.');
    if (Array.isArray(item)) { for (const child of item) visit(child, depth + 1); return; }
    if (!object(item)) return;
    for (const [key, child] of Object.entries(item)) {
      if (FIELDS.has(key)) {
        const values = Array.isArray(child) ? child : [child];
        for (const entry of values) {
          if (typeof entry === 'string') {
            const list = fields.get(key) ?? [];
            list.push(entry); fields.set(key, list);
          }
        }
      } else if (typeof child === 'object') visit(child, depth + 1);
    }
  };
  visit(value, 0);
  return fields;
}

function normalizeHost(input: string): string | null {
  if (input.length > 260) return null;
  const value = input.toLowerCase().replace(/:\d{1,5}$/, '').replace(/\.$/, '');
  if (value.length > 253 || !value.includes('.')) return null;
  return value.split('.').every(part => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(part)) ? value : null;
}

/** Consumes `tshark -r capture.pcapng -T json`; no capture or network action occurs. */
export function summarizeCapture(input: unknown, deviceIp: string, model: Model) {
  parseModel(model);
  const target = normalizeIp(deviceIp);
  if (!Array.isArray(input)) throw new Error('Expected a TShark -T json packet array.');
  if (input.length > MAX_PACKETS) throw new Error('TShark input exceeds the 25000-packet limit.');
  const hosts = new Map<string, Set<string>>();
  const omitted = new Set<string>();
  const alerts = new Set<string>();
  let targetPackets = 0, outboundPackets = 0, inboundPackets = 0;
  let dnsQueries = 0, tlsPackets = 0, plaintextHttpPackets = 0;
  const recordHosts = (values: string[], via: string) => {
    for (const raw of values) {
      const hostname = normalizeHost(raw);
      if (!hostname) continue;
      if (!KNOWN_HOSTS.has(hostname)) { omitted.add(hostname); continue; }
      const seen = hosts.get(hostname) ?? new Set<string>();
      seen.add(via); hosts.set(hostname, seen);
    }
  };
  const matches = (values: string[]) => values.some(value => {
    try { return normalizeIp(value) === target; } catch { return false; }
  });
  for (const packet of input) {
    if (!object(packet) || !object(packet._source) || !object(packet._source.layers)) {
      throw new Error('Malformed TShark packet: expected _source.layers.');
    }
    const layers = packet._source.layers;
    const fields = fieldsFrom(layers);
    const get = (name: string) => fields.get(name) ?? [];
    const outbound = matches([...get('ip.src'), ...get('ipv6.src')]);
    const inbound = matches([...get('ip.dst'), ...get('ipv6.dst')]);
    if (!outbound && !inbound) continue;
    targetPackets++;
    if (outbound) outboundPackets++; else inboundPackets++;
    if (Object.hasOwn(layers, 'tls')) tlsPackets++;
    if (Object.hasOwn(layers, 'http')) plaintextHttpPackets++;
    for (const code of get('tls.alert_message.desc')) {
      if (/^\d{1,3}$/.test(code) && Number(code) <= 255) alerts.add(code);
    }
    if (!outbound) continue;
    if (get('dns.flags.response').includes('0')) {
      dnsQueries++; recordHosts(get('dns.qry.name'), 'dns');
    }
    recordHosts(get('tls.handshake.extensions_server_name'), 'tls-sni');
    recordHosts(get('http.host'), 'http-host');
  }
  return report('network-observations', model, {
    inputPackets: input.length, targetPackets, outboundPackets, inboundPackets,
    dnsQueries, tlsPackets, plaintextHttpPackets,
    knownHosts: [...hosts.entries()].sort(([a], [b]) => a.localeCompare(b))
      .map(([hostname, via]) => ({ hostname, via: [...via].sort() })),
    omittedHostnameCount: omitted.size, tlsAlertCodes: [...alerts].sort()
  }, [
    'Counts describe captured packets, not unique requests, sessions, or a complete device history.',
    'TLS/SNI or alert presence does not establish certificate validation, pinning or image acceptance.',
    'Only ota.awair.is, messaging.awair.is and timeserver.awair.is hostnames are exported.',
    'Unknown hosts, all IP addresses, request paths, credentials and packet payloads are omitted.',
    'No matching packets can mean a capture-position/filter problem; it does not establish device behavior.',
    'The analyzer relies on TShark dissection/reassembly; it does not decrypt TLS or analyze firmware payloads.'
  ]);
}
