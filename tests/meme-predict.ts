import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MemePredict } from "../target/types/meme_predict";
import { findCounterPDA } from "../client/utils";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { confirmTransaction } from "@solana-developers/helpers";

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

  it("Is initialized!", async () => {
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
        new anchor.BN(currentBlocktime + 60),
        new anchor.BN(currentBlocktime + 120),
      )
      .accounts({
        counter: counterPDA[0],
        creator: provider.wallet.publicKey,
      })
      .rpc();;

      const counterData2 = await program.account.counter.fetch(counterPDA[0]);
      console.log(counterData2);
  });
});
