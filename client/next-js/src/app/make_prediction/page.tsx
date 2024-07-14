"use client";
import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useMemePredictProgram } from "@/hooks/useMemePredictProgram";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { Button } from "@/components/ui/button";
import { getAssetByAddress, shortenAddress } from "@/data/solanaAssests";
import Link from "next/link";

interface Market {
  id: number;
  coin: PublicKey;
  voting_time: number;
  settlement_time: number;
  initial_price: number;
  creator: PublicKey;
  result: boolean | null;
  total_up_bets: number;
  total_down_bets: number;
  fixed_voting_amount: number;
}

export default function ListMarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const { program, programId, findCounterPDA, findMarketPDA } = useMemePredictProgram();

  useEffect(() => {
    const fetchMarkets = async () => {
      if(!programId || !program){return;}
      const marketsData: Market[] = [];

      const [counterPDA] = findCounterPDA(programId);
      const counterAccount = await program.account.counter.fetch(counterPDA)
      const totalMarkets = counterAccount.count.toNumber()

      for (let i = 0; i < totalMarkets; i++) {
        const [marketPDA] = findMarketPDA(i, programId);
        const marketAccount = await program.account.market.fetch(marketPDA);
        marketsData.push({
          id: marketAccount.id.toNumber(),
          coin: marketAccount.coin,
          voting_time: marketAccount.votingTime.toNumber(),
          settlement_time: marketAccount.settlementTime.toNumber(),
          initial_price:
            marketAccount.initialPrice.toNumber() / LAMPORTS_PER_SOL,
          creator: marketAccount.creator,
          result: marketAccount.result,
          total_up_bets: marketAccount.totalUpBets.toNumber(),
          total_down_bets: marketAccount.totalDownBets.toNumber(),
          fixed_voting_amount:
            marketAccount.fixedVotingAmount.toNumber() / LAMPORTS_PER_SOL,
        });
      }

      setMarkets(marketsData);
    };

    fetchMarkets();
  }, [program, programId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <h1 className="text-2xl font-bold">Available Markets for Voting</h1>
        </div>
      </header>
      <main className="flex-1 space-y-10 max-w-screen-xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {markets.map((market) => (
            <div
              key={market.id}
              className="p-4 border border-gray-300 rounded-md"
            >
              <h2 className="text-lg font-semibold">Market ID: {market.id}</h2>
              <p>Coin: {getAssetByAddress(market.coin.toString())!.name}</p>
              <p>
                Voting Time:{" "}
                {new Date(market.voting_time * 1000).toLocaleString()}
              </p>
              <p>
                Settlement Time:{" "}
                {new Date(market.settlement_time * 1000).toLocaleString()}
              </p>
              <p>Initial Price: {market.initial_price} USD</p>
              <p>Creator: {shortenAddress(market.creator.toString())}</p>
              <p>
                Result:{" "}
                {market.result === null
                  ? "Pending"
                  : market.result
                  ? "Up"
                  : "Down"}
              </p>
              <p>Total Up Bets: {market.total_up_bets}</p>
              <p>Total Down Bets: {market.total_down_bets}</p>
              <p>Fixed Voting Amount: {market.fixed_voting_amount} SOL</p>
              <Button className="mt-2">
                <Link
                  href={`https://dial.to/?action=solana-action:https://meme-predict.vercel.app/api/actions/make_predictions?market=${market.id}`}
                  target="_blank"
                >
                  Vote Now
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
