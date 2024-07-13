use anchor_lang::prelude::*;
// use anchor_lang::system_program::{self, Transfer};

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

    pub fn create_market(ctx: Context<CreateMarket>, coin: Pubkey, current_price: u64, voting_time: i64, settlement_time: i64) -> Result<()> {
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
        market.total_up_bets = 0;
        market.total_down_bets = 0;

        counter.count += 1;
        Ok(())
    }

    pub fn make_prediction(ctx: Context<MakePrediction>,  market_id: u64, prediction: bool, amount: u64) -> Result<()> {
        // let prediction_account = &mut ctx.accounts.prediction;
        // let market = &mut ctx.accounts.market;

        // prediction_account.prediction = prediction;
        // prediction_account.amount = amount;

        // if prediction {
        //     market.total_yes_bets += amount;
        //     market.up_predictions.push(*ctx.accounts.predictor.key);
        // } else {
        //     market.total_no_bets += amount;
        //     market.down_predictions.push(*ctx.accounts.predictor.key);
        // }

        // // Transfer SOL from predictor to market account
        // system_program::transfer(
        //     CpiContext::new(
        //         ctx.accounts.system_program.to_account_info(),
        //         Transfer {
        //             from: ctx.accounts.predictor.to_account_info(),
        //             to: ctx.accounts.market.to_account_info(),
        //         },
        //     ),
        //     amount,
        // )?;

        Ok(())
    }

 
}







