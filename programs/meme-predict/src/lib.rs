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
        market.initial_price = current_price;
        market.creator = *ctx.accounts.creator.key;
        market.result = None;
        market.total_up_bets = 0;
        market.total_down_bets = 0;
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
        prediction_account.prediction = prediction;
        prediction_account.done = true;
        if prediction {
            market.total_up_bets += 1;
        } else {
            market.total_down_bets += 1;
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

    pub fn settle_market(ctx: Context<SettleMarket>, _market_id: u64, final_price: u64) -> Result<()> {
        let market = &mut ctx.accounts.market;

        if market.result != None {
            return Err(ErrorCode::AlreadySettled.into());
        }
        if Clock::get()?.unix_timestamp < market.settlement_time {
            return Err(ErrorCode::MarketNotSettled.into());
        }
        let result = final_price > market.initial_price;
        market.result = Some(result);
    
        Ok(())
    }

    pub fn claim_reward(ctx: Context<ClaimReward>, _market_id: u64) -> Result<()> {
        let prediction_account = &mut ctx.accounts.prediction;
        let market = &mut ctx.accounts.market;

        if prediction_account.claimed == true {
            return Err(ErrorCode::AlreadyClaimed.into());
        }

        if market.result == None {
            return Err(ErrorCode::MarketNotSettled.into());
        }

        let total_pool = (market.total_up_bets + market.total_down_bets) * market.fixed_voting_amount;

        let winning_amount = if market.result == Some(true) {
            (total_pool as f64 * (1.0 / market.total_up_bets as f64)) as u64
        } else {
            (total_pool as f64 * (1.0 / market.total_down_bets as f64)) as u64
        };

        if market.result == Some(prediction_account.prediction) {
            **market.to_account_info().try_borrow_mut_lamports()? -= winning_amount;
            **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += winning_amount;
        }

        prediction_account.claimed = true;
    
        Ok(())
    }
}







