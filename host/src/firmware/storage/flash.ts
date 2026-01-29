export interface FlashStore {
  read(key: string): string | undefined;
  write(key: string, value: string): void;
}

export class InMemoryFlashStore implements FlashStore {
  private readonly data = new Map<string, string>();

  public read(key: string): string | undefined {
    return this.data.get(key);
  }

  public write(key: string, value: string): void {
    this.data.set(key, value);
  }
}
