import {  confirmTransaction } from "@solana-developers/helpers";
import * as anchor from "@coral-xyz/anchor";
import { web3, BN } from "@coral-xyz/anchor";

export async function airdropSOL(provider, publicKey, amount) {
  const signature = await provider.connection.requestAirdrop(publicKey, amount);
  await confirmTransaction(provider.connection, signature);
}

export async function getBalance(
  connection: web3.Connection,
  publicKey: web3.PublicKey
): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / web3.LAMPORTS_PER_SOL;
}

// export async function confirmTransaction(
//   connection: web3.Connection,
//   txHash: string
// ) {
//   await connection.confirmTransaction(txHash);
//   console.log(`TRANSACTION CONFIRMED -> ${txHash}`);
// }

export function toSol(amount: number): number {
  return amount / web3.LAMPORTS_PER_SOL;
}

export function findCounterPDA(
  programId: web3.PublicKey,
): [web3.PublicKey, number] {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("counter", "utf8")],
    programId
  );
}

export function findMarketPDA(
  marketId: number,
  programId: web3.PublicKey
): [web3.PublicKey, number] {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("market", "utf8"),
      new BN(marketId).toArrayLike(Buffer, "le", 8),
    ],
    programId
  );
}

export function findPredictionPDA(
  marketId: number,
  predictorPublicKey: web3.PublicKey,
  programId: web3.PublicKey
): [web3.PublicKey, number] {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("prediction", "utf8"),
      new BN(marketId).toArrayLike(Buffer, "le", 8),
      predictorPublicKey.toBuffer(),
    ],
    programId
  );
}