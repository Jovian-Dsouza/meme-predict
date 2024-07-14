import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MemePredict } from "../target/types/meme_predict";
import {
  findCounterPDA,
  findMarketPDA,
  findPredictionPDA,
} from "../client/utils";
import { assert } from "chai";
import { setTimeout } from "timers/promises";

describe("meme-predict", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.MemePredict as Program<MemePredict>;
  const counterPDA = findCounterPDA(program.programId);
  const coinPubKey = new anchor.web3.PublicKey(
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" // Bonk
  );
  const coinPrice = new anchor.BN(1000);
  const fixedVotingAmount = new anchor.BN(0.01 * anchor.web3.LAMPORTS_PER_SOL);
  const marketId = 0;
  let secondUser = anchor.web3.Keypair.generate();

  before(async () => {
    console.log("Counter PDA:", counterPDA.toString());

    // Airdrop SOL to the second user account
    const airdropSig = await provider.connection.requestAirdrop(
      secondUser.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);
  });

  it("Should initialize the market", async () => {
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
    const [marketPDA] = findMarketPDA(marketId, program.programId);
    const [predictionPDA] = findPredictionPDA(
      marketId,
      provider.wallet.publicKey,
      program.programId
    );

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
    assert.isTrue(predictionAccount.done);
    assert.equal(marketAccount.totalUpBets.toString(), "1");
  });

  it("Makes a prediction (Down) with a different account", async () => {
    const [marketPDA] = findMarketPDA(marketId, program.programId);
    const [predictionPDA] = findPredictionPDA(
      marketId,
      secondUser.publicKey,
      program.programId
    );

    await program.methods
      .makePrediction(new anchor.BN(marketId), false)
      .accounts({
        predictor: secondUser.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([secondUser])
      .rpc();

    const marketAccount = await program.account.market.fetch(marketPDA);
    const predictionAccount = await program.account.prediction.fetch(
      predictionPDA
    );
    assert.isTrue(predictionAccount.done);
    assert.equal(marketAccount.totalDownBets.toString(), "1");
  });

  it("Settles the market", async () => {
    const [marketPDA] = findMarketPDA(marketId, program.programId);

    // Wait for market to end
    await setTimeout(6000);

    await program.methods
      .settleMarket(new anchor.BN(marketId), coinPrice.add(new anchor.BN(100)))
      .rpc();

    const marketAccount = await program.account.market.fetch(marketPDA);
    assert.isTrue(marketAccount.result); // Assuming finalPrice > initial_price
  });

  it("Claims reward", async () => {
    const [marketPDA] = findMarketPDA(marketId, program.programId);
    const [predictionPDA] = findPredictionPDA(
      marketId,
      provider.wallet.publicKey,
      program.programId
    );

    const initialBalance = await provider.connection.getBalance(
      provider.wallet.publicKey
    );

    await program.methods
      .claimReward(new anchor.BN(marketId))
      .accounts({
        user: provider.wallet.publicKey,
      })
      .rpc();

    const finalBalance = await provider.connection.getBalance(
      provider.wallet.publicKey
    );
    // console.log("Amount Claimed after fees", (finalBalance-initialBalance)/anchor.web3.LAMPORTS_PER_SOL)
    assert.isTrue(finalBalance > initialBalance);

    const predictionAccount = await program.account.prediction.fetch(
      predictionPDA
    );
    assert.isTrue(predictionAccount.claimed);
  });
});
