use anchor_lang::prelude::*;
use crate::Counter;
use crate::Market;

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