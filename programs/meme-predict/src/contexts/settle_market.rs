use anchor_lang::prelude::*;
use crate::Market;
use crate::Prediction;

#[derive(Accounts)]
#[instruction(_market_id : u64)]
pub struct SettleMarket<'info> {
    #[account(
            mut,
            seeds = [
                b"prediction", 
                _market_id.to_le_bytes().as_ref(),
                predictor.key().as_ref(),
            ],
            bump,
        )]
    pub prediction: Account<'info, Prediction>,

    #[account(
        mut,
        seeds = [b"market".as_ref(), _market_id.to_le_bytes().as_ref()], 
        bump
    )]
    pub market: Account<'info, Market>,
    pub system_program: Program<'info, System>,
}