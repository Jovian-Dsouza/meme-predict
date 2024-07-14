import { Program } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { useEffect, useMemo } from "react";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";

import { MemePredict } from "../contracts/types/meme_predict";
import idl from "../contracts/idl/meme_predict.json";

import { SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { web3 } from "@coral-xyz/anchor";

export function useMemePredictProgram() {
  const {
    publicKey: walletPublicKey,
    signTransaction,
    sendTransaction,
  } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const provider = useMemo(() => {
    if (wallet) {
      return new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
      });
    }
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) {
      return null;
    }
    return new Program<MemePredict>(idl as MemePredict, provider);
  }, [provider]);

  async function confirmHash(txHash: any) {
    console.log(`TRANSACTION CONFIRMED -> ${txHash}`);
    await connection.confirmTransaction(txHash);
  }

  function findMarketPDA(
    marketId: number,
    programId: web3.PublicKey,
  ): [web3.PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("market", "utf8"),
        new BN(marketId).toArrayLike(Buffer, "le", 8),
      ],
      programId,
    );
  }

  function findPredictionPDA(
    marketId: number,
    predictorPublicKey: web3.PublicKey,
    programId: web3.PublicKey,
  ): [web3.PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("prediction", "utf8"),
        new BN(marketId).toArrayLike(Buffer, "le", 8),
        predictorPublicKey.toBuffer(),
      ],
      programId,
    );
  }

  function findCounterPDA(programId: web3.PublicKey): [web3.PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("counter", "utf8")],
      programId,
    );
  }

  async function processAndSend(
    instruction: anchor.web3.TransactionInstruction,
  ) {
    const txn = new Transaction().add(instruction);
    txn.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    txn.feePayer = walletPublicKey;

    const signedTransaction = await signTransaction!(txn);
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    await connection.confirmTransaction(txid);

    // Provide Solscan link
    console.log(`View transaction on Solscan: https://solscan.io/tx/${txid}`);
  }

  async function makePrediction(marketId: number, prediction: boolean) {
    if (!program) {
      throw new Error("Program not initialized");
    }
    if (!walletPublicKey || !wallet) {
      throw new Error("Wallet not initialized");
    }
    if (!provider) {
      throw new Error("Provider not initialized");
    }
    try {
      const instruction = await program.methods
        .makePrediction(new BN(marketId), prediction)
        .accounts({
          predictor: walletPublicKey,
        })
        .instruction();

      await processAndSend(instruction);
    } catch (error) {
      console.error("Transaction failed", error);
      throw error; // Rethrow error after logging it
    }
  }

  async function createMarket(
    tokenAddress: string,
    tokenPrice: number,
    votingAmount: number,
    votingTimeInSecs: number,
    settlementTimeInSecs: number,
  ) {
    if (!program) {
      throw new Error("Program not initialized");
    }
    if (!walletPublicKey || !wallet) {
      throw new Error("Wallet not initialized");
    }
    if (!provider) {
      throw new Error("Provider not initialized");
    }
    try {
      const currentSlot = await program.provider.connection.getSlot();
      const currentBlocktime = await program.provider.connection.getBlockTime(
        currentSlot,
      );
      if (!currentBlocktime) {
        throw new Error("Couldnt get current blocktime");
      }
      const [counterPDA] = findCounterPDA(program.programId);
      const instruction = await program.methods
        .createMarket(
          new anchor.web3.PublicKey(tokenAddress),
          new anchor.BN(tokenPrice * anchor.web3.LAMPORTS_PER_SOL),
          new anchor.BN(votingAmount * anchor.web3.LAMPORTS_PER_SOL),
          new anchor.BN(currentBlocktime + votingTimeInSecs),
          new anchor.BN(currentBlocktime + settlementTimeInSecs),
        )
        .accounts({
          counter: counterPDA,
          creator: walletPublicKey,
        })
        .instruction();

      await processAndSend(instruction);
    } catch (error) {
      console.error("Transaction failed", error);
      throw error; // Rethrow error after logging it
    }
  }

  const value = useMemo(
    () => ({
      makePrediction,
      findMarketPDA,
      findPredictionPDA,
      findCounterPDA,
      createMarket,
      programId: program?.programId,
      program,
    }),
    [program],
  );

  return value;
}
