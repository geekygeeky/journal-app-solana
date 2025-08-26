// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import JournalIDL from '../target/idl/journal_app.json'
import type { JournalApp } from '../target/types/journal_app'

// Re-export the generated IDL and type
export { JournalApp, JournalIDL }

// The programId is imported from the program IDL.
export const COUNTER_PROGRAM_ID = new PublicKey(JournalIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getCounterProgram(provider: AnchorProvider, address?: PublicKey): Program<JournalApp> {
  return new Program({ ...JournalIDL, address: address ? address.toBase58() : JournalIDL.address } as JournalApp, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getCounterProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('5tDGXUeaGMTa549wnseY3uspE1UoUeTZcUpTvxE4D5ep')
    case 'mainnet-beta':
    default:
      return COUNTER_PROGRAM_ID
  }
}
