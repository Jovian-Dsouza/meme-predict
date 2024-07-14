// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.
import { Program } from "@coral-xyz/anchor";
import { MemePredict } from "../target/types/meme_predict";
import { findCounterPDA } from "../client/utils";
const anchor = require("@coral-xyz/anchor");

async function getTokenPrice(tokenAddress: string): Promise<number> {
  const url = `https://price.jup.ag/v6/price?ids=${tokenAddress}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching price: ${response.statusText}`);
    }

    const priceResponse: any = await response.json();
    return priceResponse.data[tokenAddress].price;
  } catch (error) {
    console.error("Error fetching token price:", error);
    throw error;
  }
}

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  const program = anchor.workspace.MemePredict as Program<MemePredict>;

  // Initialize market
  await program.methods
    .initialize()
    .accounts({
      creator: provider.wallet.publicKey,
    })
    .rpc();

  // Create a test market
  const coinPubKey = new anchor.web3.PublicKey(
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" // Bonk
  );

  const fixedVotingAmount = new anchor.BN(0.01 * anchor.web3.LAMPORTS_PER_SOL);
  const votingTimeInSecs = 3600 * 24; //1day
  const settlementTimeInSecs = 2 * 3600 * 24; //2day

  const tokenPrice = await getTokenPrice(coinPubKey.toString());
  console.log("Current token price: ", tokenPrice);
  const coinPrice = new anchor.BN(tokenPrice * anchor.web3.LAMPORTS_PER_SOL);
  console.log("Current token price (lamports): ", coinPrice.toString())
  const currentSlot = await program.provider.connection.getSlot();
  const currentBlocktime = await program.provider.connection.getBlockTime(
    currentSlot
  );
  const counterPDA = findCounterPDA(program.programId);
  await program.methods
    .createMarket(
      coinPubKey,
      coinPrice,
      fixedVotingAmount,
      new anchor.BN(currentBlocktime + votingTimeInSecs),
      new anchor.BN(currentBlocktime + settlementTimeInSecs)
    )
    .accounts({
      counter: counterPDA[0],
      creator: provider.wallet.publicKey,
    })
    .rpc();

  const counterData = await program.account.counter.fetch(counterPDA[0]);
  console.log("number of markets", counterData.count.toString())
};
