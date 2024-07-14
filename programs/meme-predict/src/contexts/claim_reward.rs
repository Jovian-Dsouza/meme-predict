use anchor_lang::prelude::*;
use crate::Prediction;
use crate::Market;

#[derive(Accounts)]
#[instruction(_market_id : u64)]
pub struct ClaimReward<'info> {
    #[account(
            mut,
            seeds = [
                b"prediction", 
                _market_id.to_le_bytes().as_ref(),
                user.key().as_ref(),
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
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
