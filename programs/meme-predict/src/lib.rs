use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

pub mod contexts;
use contexts::*;

pub mod state;
pub use state::*;

pub mod errors;
pub use errors::ErrorCode;


declare_id!("GY8BPUoP7LvyEwGijUqN5tyWmY9zn894x9AHQKzaYocp");

#[program]
pub mod meme_predict {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        Ok(())
    }

    pub fn create_market(
            ctx: Context<CreateMarket>, 
            coin: Pubkey, 
            current_price: u64, 
            fixed_voting_amount: u64,
            voting_time: i64, 
            settlement_time: i64
        ) -> Result<()> {
        let current_timestamp = Clock::get()?.unix_timestamp;
        require!(voting_time > current_timestamp, ErrorCode::InvalidVotingTime);
        require!(settlement_time > current_timestamp, ErrorCode::InvalidSettlementTime);
        require!(voting_time < settlement_time, ErrorCode::InvalidTimes);

        let counter = &mut ctx.accounts.counter;
        let market_id = counter.count;

        let market = &mut ctx.accounts.market;
        market.id = market_id;
        market.coin = coin;
        market.voting_time = voting_time;
        market.settlement_time = settlement_time;
        market.current_price = current_price;
        market.creator = *ctx.accounts.creator.key;
        market.result = None;
        market.up_predictions = vec![];
        market.down_predictions = vec![];
        market.fixed_voting_amount = fixed_voting_amount;

        counter.count += 1;
        Ok(())
    }

    pub fn make_prediction(
        ctx: Context<MakePrediction>,  
        _market_id: u64, 
        prediction: bool, 
    ) -> Result<()> {
        let prediction_account = &mut ctx.accounts.prediction;
        let market = &mut ctx.accounts.market;

        let clock: Clock = Clock::get()?;
        if market.voting_time < clock.unix_timestamp {
            return Err(ErrorCode::VotingTimeExpired.into());
        }

        if prediction_account.done == true {
            return Err(ErrorCode::AlreadyVoted.into());
        }
        prediction_account.done = true;
        if prediction {
            market.up_predictions.push(*ctx.accounts.predictor.key);
        } else {
            market.down_predictions.push(*ctx.accounts.predictor.key);
        }

        // Transfer SOL from predictor to market account
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.predictor.to_account_info(),
                    to: market.to_account_info(),
                },
            ),
            market.fixed_voting_amount,
        )?;

        Ok(())
    }

    // pub fn settle_market(ctx: Context<SettleMarket>, result: bool) -> Result<()> {
    //     let market = &mut ctx.accounts.market;
    //     if Clock::get()?.unix_timestamp > market.end_time {
    //         market.result = Some(result);

    //         // Calculate payouts
    //         let total_pool = market.total_yes_bets + market.total_no_bets;
    //         let winning_pool = if result {
    //             market.total_yes_bets
    //         } else {
    //             market.total_no_bets
    //         };

    //         let winning_accounts = if result {
    //             &market.yes_predictions
    //         } else {
    //             &market.no_predictions
    //         };

    //         for (i, winning_account) in winning_accounts.iter().enumerate() {
    //             let payout_amount = (total_pool as f64 * (1.0 / winning_accounts.len() as f64)) as u64;
    //             system_program::transfer(
    //                 CpiContext::new(
    //                     ctx.accounts.system_program.to_account_info(),
    //                     Transfer {
    //                         from: ctx.accounts.market.to_account_info(),
    //                         to: ctx.remaining_accounts[i].to_account_info(),
    //                     },
    //                 ),
    //                 payout_amount,
    //             )?;
    //         }
    //     }
    //     Ok(())
    // }
}







