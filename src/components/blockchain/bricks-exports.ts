// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import type { Bricks } from './types/bricks';
import BricksIDL from './idl/bricks.json';
// Re-export the generated IDL and type
export { Bricks };

// The programId is imported from the program IDL.
export const BRICKS_PROGRAM_ID = new PublicKey(BricksIDL.address);

// This is a helper function to get the Bricks Anchor program.
export function getBricksProgram(provider: AnchorProvider) {
  return new Program(BricksIDL as Bricks, provider);
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getBricksProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet': 
      return new PublicKey("DdoHZCPsMoQmRu7LtkvrVfu6TDR9PYJafKxps5cuh4uU");
    case 'testnet': 
      return new PublicKey("DdoHZCPsMoQmRu7LtkvrVfu6TDR9PYJafKxps5cuh4uU");
    case 'mainnet-beta': 
      return new PublicKey("DdoHZCPsMoQmRu7LtkvrVfu6TDR9PYJafKxps5cuh4uU");
    default:
      return BRICKS_PROGRAM_ID;
  }
}

export const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // circle DEVNET - USDC

export const PROTOCOL = PublicKey.findProgramAddressSync([Buffer.from("protocol")], BRICKS_PROGRAM_ID)[0];
export const MANAGER = PublicKey.findProgramAddressSync([Buffer.from("manager")], BRICKS_PROGRAM_ID)[0];

export const mplCoreProgram = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
