import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MemePredict } from "../target/types/meme_predict";
import {
  findCounterPDA,
  findMarketPDA,
  findPredictionPDA,
} from "../client/utils";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { confirmTransaction } from "@solana-developers/helpers";
import { assert } from "chai";
import { setTimeout } from "timers/promises";

describe("meme-predict", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.MemePredict as Program<MemePredict>;
  const counterPDA = findCounterPDA(program.programId);
  console.log("counterPDA", counterPDA.toString());

  const coinPubKey = new anchor.web3.PublicKey(
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" //Bonk
  );
  const coinPrice = new anchor.BN(1000);
  const fixedVotingAmount = new anchor.BN(100);

  it("Should Initialize the market", async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize()
      .accounts({
        creator: provider.wallet.publicKey,
      })
      .rpc();

    let counterData = await program.account.counter.fetch(counterPDA[0]);
    assert.equal(counterData.count.toString(), "0");

    const currentSlot = await program.provider.connection.getSlot();
    const currentBlocktime = await program.provider.connection.getBlockTime(
      currentSlot
    );
    // console.log(currentBlocktime);
    await program.methods
      .createMarket(
        coinPubKey,
        coinPrice,
        fixedVotingAmount,
        new anchor.BN(currentBlocktime + 2),
        new anchor.BN(currentBlocktime + 4)
      )
      .accounts({
        counter: counterPDA[0],
        creator: provider.wallet.publicKey,
      })
      .rpc();

    counterData = await program.account.counter.fetch(counterPDA[0]);
    assert.equal(counterData.count.toString(), "1");
  });

  it("Makes a prediction (Up)", async () => {
    const marketId = 0;
    const [marketPDA] = findMarketPDA(marketId, program.programId);
    const [predictionPDA] = findPredictionPDA(
      marketId,
      provider.wallet.publicKey,
      program.programId
    );
    // const marketAccount = await program.account.market.fetch(marketPDA);
    await program.methods
      .makePrediction(new anchor.BN(marketId), true)
      .accounts({
        predictor: provider.wallet.publicKey,
      })
      .rpc();

    const marketAccount = await program.account.market.fetch(marketPDA);
    const predictionAccount = await program.account.prediction.fetch(
      predictionPDA
    );
    assert.equal(predictionAccount.done, true);
  });

  it("Settles the market", async () => {
    const marketId = 0;
    const [marketPDA] = findMarketPDA(marketId, program.programId);

    //Wait for market to end
    await setTimeout(6000);

    await program.methods
      .settleMarket(new anchor.BN(marketId), coinPrice.add(new anchor.BN(100)))
      .rpc();

    const marketAccount = await program.account.market.fetch(marketPDA);
    assert.equal(marketAccount.result, true); // Assuming finalPrice > initial_price
  });

  it("Claims reward", async () => {
    const marketId = 0;
    const [marketPDA] = findMarketPDA(marketId, program.programId);
    const [predictionPDA] = findPredictionPDA(
      marketId,
      provider.wallet.publicKey,
      program.programId
    );
    const initialBalance = await provider.connection.getBalance(
      provider.wallet.publicKey
    );
    console.log(initialBalance)

    await program.methods
      .claimReward(new anchor.BN(marketId))
      .accounts({
        user: provider.wallet.publicKey,
      })
      .rpc();

    const finalBalance = await provider.connection.getBalance(
      provider.wallet.publicKey
    );
    // assert(finalBalance > initialBalance);
    console.log(finalBalance)
    const predictionAccount = await program.account.prediction.fetch(
      predictionPDA
    );
    assert.equal(predictionAccount.claimed, true);
  });
});
