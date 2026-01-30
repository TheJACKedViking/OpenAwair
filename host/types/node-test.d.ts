declare module 'node:test' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
}

declare module 'node:assert/strict' {
  interface Assert {
    strictEqual(actual: unknown, expected: unknown): void;
    ok(value: unknown): void;
    deepStrictEqual(actual: unknown, expected: unknown): void;
  }

  const assert: Assert;
  export default assert;
}
