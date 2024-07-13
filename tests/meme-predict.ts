import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MemePredict } from "../target/types/meme_predict";
import { findCounterPDA, findMarketPDA, findPredictionPDA } from "../client/utils";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { confirmTransaction } from "@solana-developers/helpers";
import { assert } from "chai";

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

  it("Should Initialize the market", async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize()
      .accounts({
        creator: provider.wallet.publicKey,
      })
      .rpc();

    const counterData = await program.account.counter.fetch(counterPDA[0]);
    console.log(counterData);

    const currentSlot = await program.provider.connection.getSlot();
    const currentBlocktime = await program.provider.connection.getBlockTime(
      currentSlot
    );

    await program.methods
      .createMarket(
        coinPubKey,
        coinPrice,
        new anchor.BN(currentBlocktime + 3600),
        new anchor.BN(currentBlocktime + 3600 * 24)
      )
      .accounts({
        counter: counterPDA[0],
        creator: provider.wallet.publicKey,
      })
      .rpc();

    const counterData2 = await program.account.counter.fetch(counterPDA[0]);
    console.log(counterData2);
  });

  it("Makes a prediction (Up)", async () => {
    const marketId = 0;
    const amount = 1000; //In sol lamports
    const [marketPDA] = findMarketPDA(marketId, program.programId);
    const [predictionPDA] = findPredictionPDA(marketId, provider.wallet.publicKey, program.programId);
    // const marketAccount = await program.account.market.fetch(marketPDA);
    await program.methods
      .makePrediction(new anchor.BN(marketId), true, new anchor.BN(amount))
      .accounts({
        predictor: provider.wallet.publicKey,
      })
      .rpc();

    const marketAccount = await program.account.market.fetch(
      marketPDA
    );
    const predictionAccount = await program.account.prediction.fetch(
      predictionPDA
    );
    assert.equal(predictionAccount.prediction, true);
    assert.equal(predictionAccount.amount.toString(), amount.toString());
    assert.equal(marketAccount.totalUpBets.toString(), amount.toString());
    
  });
});
