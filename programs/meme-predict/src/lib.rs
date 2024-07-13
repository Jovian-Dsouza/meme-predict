use anchor_lang::prelude::*;
// use anchor_lang::system_program::{self, Transfer};

declare_id!("GY8BPUoP7LvyEwGijUqN5tyWmY9zn894x9AHQKzaYocp");

#[program]
pub mod meme_predict {
    use super::*;

    pub fn initialize_counter(ctx: Context<InitializeCounter>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        Ok(())
    }

    pub fn create_market(ctx: Context<CreateMarket>, coin: Pubkey, voting_time: i64, settlement_time: i64, current_price: u64) -> Result<()> {
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

        // Increment the counter
        counter.count += 1;

        Ok(())
    }

    // pub fn make_prediction(ctx: Context<MakePrediction>, prediction: bool, amount: u64) -> Result<()> {
    //     let prediction_account = &mut ctx.accounts.prediction;
    //     let market = &mut ctx.accounts.market;

    //     prediction_account.market = ctx.accounts.market.key();
    //     prediction_account.predictor = *ctx.accounts.predictor.key;
    //     prediction_account.prediction = prediction;
    //     prediction_account.amount = amount;

    //     if prediction {
    //         market.total_yes_bets += amount;
    //         market.yes_predictions.push(*ctx.accounts.predictor.key);
    //     } else {
    //         market.total_no_bets += amount;
    //         market.no_predictions.push(*ctx.accounts.predictor.key);
    //     }

    //     // Transfer SOL from predictor to market account
    //     system_program::transfer(
    //         CpiContext::new(
    //             ctx.accounts.system_program.to_account_info(),
    //             Transfer {
    //                 from: ctx.accounts.predictor.to_account_info(),
    //                 to: ctx.accounts.market.to_account_info(),
    //             },
    //         ),
    //         amount,
    //     )?;

    //     Ok(())
    // }

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

#[derive(Accounts)]
pub struct InitializeCounter<'info> {
    #[account(init, seeds = [b"counter"], bump, payer = creator, space = 8 + 8 + 1)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    #[account(
        init,
        seeds = [b"market".as_ref(), &counter.count.to_le_bytes()],
        bump,
        payer = creator,
        space = 8 + 8 + 32 + 8 + 8 + 8 + 32 + 1 + 8 + 8 + (32 * 100)
    )]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakePrediction<'info> {
    #[account(init, payer = predictor, space = 8 + 32 + 32 + 1 + 8)]
    pub prediction: Account<'info, Prediction>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub predictor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Counter {
    pub count: u64,
}

#[account]
pub struct Market {
    pub id: u64,
    pub coin: Pubkey,
    pub voting_time: i64,
    pub settlement_time: i64,
    pub current_price: u64,
    pub creator: Pubkey,
    pub result: Option<bool>,
    pub up_predictions: Vec<Pubkey>,
    pub down_predictions: Vec<Pubkey>,
}

#[account]
pub struct Prediction {
    pub market: Pubkey,
    pub predictor: Pubkey,
    pub prediction: bool,
    pub amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Voting time must be in the future")]
    InvalidVotingTime,
    #[msg("Settlement time must be in the future")]
    InvalidSettlementTime,
    #[msg("Voting time must be less than settlement time")]
    InvalidTimes,
}