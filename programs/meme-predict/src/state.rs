use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub id: u64,
    pub coin: Pubkey,
    pub voting_time: i64,
    pub settlement_time: i64,
    pub initial_price: u64,
    pub creator: Pubkey,
    pub result: Option<bool>,
    pub total_up_bets: u64,
    pub total_down_bets: u64,
    pub fixed_voting_amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Prediction {
    pub prediction: bool,
    pub done: bool,
    pub claimed: bool,
}