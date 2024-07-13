use anchor_lang::prelude::*;
use crate::Prediction;
use crate::Market;

#[derive(Accounts)]
#[instruction(market_id : u64)]
pub struct MakePrediction<'info> {
    #[account(
            init, 
            payer = predictor, 
            space = 8 + Prediction::INIT_SPACE,
            seeds = [
                b"prediction", 
                market.key().as_ref(),
                predictor.key().as_ref(),
            ],
            bump,
        )]
    pub prediction: Account<'info, Prediction>,
    #[account(
        mut,
        seeds = [b"market".as_ref(), market_id.to_le_bytes().as_ref()], 
        bump
    )]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub predictor: Signer<'info>,
    pub system_program: Program<'info, System>,
}
