declare module 'viem' {
  export function parseAbi<T extends readonly string[]>(signatures: T): any;
  export function encodeFunctionData(options: any): `0x${string}`;
  export function parseEther(ether: string): bigint;
  export function formatEther(wei: bigint): string;
  export function decodeEventLog(options: any): {
    eventName: string;
    args: Record<string, unknown>;
  };
}
