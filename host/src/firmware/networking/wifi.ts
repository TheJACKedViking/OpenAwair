export type WifiProvisioningState =
  | { status: 'idle' }
  | { status: 'provisioning'; ssid: string }
  | { status: 'connected'; ssid: string; ip: string }
  | { status: 'error'; reason: string };

export class WifiManager {
  private state: WifiProvisioningState = { status: 'idle' };

  public getState(): WifiProvisioningState {
    return this.state;
  }

  public startProvisioning(ssid: string): void {
    this.state = { status: 'provisioning', ssid };
  }

  public completeProvisioning(ssid: string, ip: string): void {
    this.state = { status: 'connected', ssid, ip };
  }

  public failProvisioning(reason: string): void {
    this.state = { status: 'error', reason };
  }
}
