use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Voting time must be in the future")]
    InvalidVotingTime,
    #[msg("Settlement time must be in the future")]
    InvalidSettlementTime,
    #[msg("Voting time must be less than settlement time")]
    InvalidTimes,
    #[msg("Voting time must be less than current time when making prediction")]
    VotingTimeExpired,
    #[msg("User already voted once")]
    AlreadyVoted,
    #[msg("User already claimed once")]
    AlreadyClaimed,
    #[msg("Market already settled")]
    AlreadySettled,
    #[msg("Settlement time has not been completed")]
    MarketNotSettled,
}