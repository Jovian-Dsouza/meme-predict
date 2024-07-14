"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useMemePredictProgram } from "@/hooks/useMemePredictProgram";
import { getAssetByName, getSupportedAssetList } from "@/data/solanaAssests"; // Adjust the path as needed

export default function CreateMarketPage() {
  const { walletPublicKey, wallet } = useWallet();
  const [token, setToken] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [votingAmount, setVotingAmount] = useState("");
  const [votingTimeInSecs, setVotingTimeInSecs] = useState("");
  const [settlementTimeInSecs, setSettlementTimeInSecs] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { createMarket } = useMemePredictProgram();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedAsset = getAssetByName(token);
      if (!selectedAsset) {
        throw new Error("Invalid token selected");
      }
      await createMarket(
        selectedAsset.mint,
        parseFloat(tokenPrice),
        parseFloat(votingAmount),
        parseInt(votingTimeInSecs),
        parseInt(settlementTimeInSecs),
      );

      // Clear state variables to default
      setToken("");
      setTokenPrice("");
      setVotingAmount("");
      setVotingTimeInSecs("");
      setSettlementTimeInSecs("");
    } catch (error) {
      console.error("Failed to create market", error);
    } finally {
      setLoading(false);
    }
  };

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

  async function updateLatestPrice(){
    const selectedAsset = getAssetByName(token);
    if(!selectedAsset){return}
    const latestPriceUSD: number = await getTokenPrice(selectedAsset.mint);
    setTokenPrice(latestPriceUSD.toString())
  }

  useEffect(()=>{
    updateLatestPrice();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <h1 className="text-2xl font-bold">Create New Market</h1>
          <ThemeModeToggle />
        </div>
      </header>
      <main className="flex-1 space-y-10 max-w-screen-xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Select Token</label>
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="" disabled>
                Select a token
              </option>
              {getSupportedAssetList().map((asset) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Token Price (in USD)
            </label>
            <input
              type="number"
              value={tokenPrice}
              onChange={(e) => setTokenPrice(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Voting Amount (in SOL)
            </label>
            <input
              type="number"
              value={votingAmount}
              onChange={(e) => setVotingAmount(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Voting Time (in seconds)
            </label>
            <input
              type="number"
              value={votingTimeInSecs}
              onChange={(e) => setVotingTimeInSecs(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Settlement Time (in seconds)
            </label>
            <input
              type="number"
              value={settlementTimeInSecs}
              onChange={(e) => setSettlementTimeInSecs(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Market"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
