/**
 * Solana Actions Example
 */

import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  MEMO_PROGRAM_ID,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { NextResponse } from "next/server";
import * as anchor from "@coral-xyz/anchor";
import { MemePredict } from "@/contracts/types/meme_predict";
import IDL from "@/contracts/idl/meme_predict.json";

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    title: "Make Prediction",
    icon: new URL("/solana_devs.jpg", new URL(req.url).origin).toString(),
    description: "Will this token at this price go up or down ?",
    label: "Make prediction",
    links: {
      actions: [
        {
          label: "UP",
          href: "/api/actions/make_prediction?prediction=UP",
        },
        {
          label: "DOWN",
          href: "/api/actions/make_prediction?prediction=DOWN",
        },
      ],
    },
  };

  return NextResponse.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    const marketId = 0; //TODO get this dynamically
    const query = req.url.split("?");
    const prediction = query[1].split("prediction=")[1];

    if (!prediction || (prediction != "UP" && prediction != "DOWN")) {
      return new Response("Missing or Invalid prediction parameter", {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    const connection = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("devnet"),
    );
    const wallet = new anchor.Wallet(anchor.web3.Keypair.generate());
    const provider = new anchor.AnchorProvider(connection, wallet);

    const program = new anchor.Program(
      IDL as MemePredict,
      provider,
    ) as unknown as anchor.Program<MemePredict>;

    const instruction = await program.methods
      .makePrediction(
        new anchor.BN(marketId),
        prediction === "UP" ? true : false,
      )
      .instruction();

    instruction.keys.push({
      pubkey: new PublicKey(account),
      isSigner: true,
      isWritable: false,
    });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 15000,
    });

    const { blockhash } = await connection.getLatestBlockhash({
      commitment: "max",
    });

    const messageV0 = new anchor.web3.TransactionMessage({
      payerKey: new anchor.web3.PublicKey(account),
      recentBlockhash: blockhash,
      instructions: [addPriorityFee, instruction],
    }).compileToV0Message();

    const versionedTransaction = new anchor.web3.VersionedTransaction(
      messageV0,
    );

    const serializedTransaction = Buffer.from(
      versionedTransaction.serialize(),
    ).toString("base64");

    return NextResponse.json(
      {
        transaction: serializedTransaction,
        message: "Prediction Made!",
      },
      {
        headers: ACTIONS_CORS_HEADERS,
      },
    );
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new NextResponse(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};
