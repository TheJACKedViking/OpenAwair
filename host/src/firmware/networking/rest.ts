import type { DeviceMetrics } from '../../shared/telemetry';

export interface RestEndpoint {
  readonly path: string;
  readonly method: 'GET' | 'POST';
  handle(): Promise<string>;
}

export const createMetricsEndpoint = (metrics: DeviceMetrics): RestEndpoint => {
  return {
    path: '/api/v1/metrics',
    method: 'GET',
    async handle() {
      return JSON.stringify(metrics);
    }
  };
};

export const createRelayEndpoint = (getState: () => boolean, toggle: () => void): RestEndpoint => {
  return {
    path: '/api/v1/relay',
    method: 'POST',
    async handle() {
      toggle();
      return JSON.stringify({ enabled: getState() });
    }
  };
};
