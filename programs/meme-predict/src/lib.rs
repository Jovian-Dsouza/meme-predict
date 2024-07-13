use anchor_lang::prelude::*;

declare_id!("GY8BPUoP7LvyEwGijUqN5tyWmY9zn894x9AHQKzaYocp");

#[program]
pub mod meme_predict {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
