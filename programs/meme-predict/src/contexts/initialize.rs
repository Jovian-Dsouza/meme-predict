use anchor_lang::prelude::*;
use crate::Counter;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, seeds = [b"counter"], bump, payer = creator, space = 8 + Counter::INIT_SPACE)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}
