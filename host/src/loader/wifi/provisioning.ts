export interface WifiCredentials {
  readonly ssid: string;
  readonly password: string;
}

export interface WifiProvisioner {
  sendCredentials(credentials: WifiCredentials): Promise<void>;
}

export class ProvisioningFlow {
  private readonly provisioner: WifiProvisioner;

  public constructor(provisioner: WifiProvisioner) {
    this.provisioner = provisioner;
  }

  public async provision(credentials: WifiCredentials): Promise<void> {
    if (!credentials.ssid) {
      throw new Error('SSID is required');
    }
    await this.provisioner.sendCredentials(credentials);
  }
}
