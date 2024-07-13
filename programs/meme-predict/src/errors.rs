use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Voting time must be in the future")]
    InvalidVotingTime,
    #[msg("Settlement time must be in the future")]
    InvalidSettlementTime,
    #[msg("Voting time must be less than settlement time")]
    InvalidTimes,
}