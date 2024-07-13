use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
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
    pub fixed_voting_amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Prediction {
    pub done: bool,
}