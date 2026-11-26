use anchor_lang::prelude::*;

// Solana Playground updates this ID when the program is deployed.
declare_id!("DdgCkKAxxCm6jAy5bss4mkCq9djBw9KNHDaqxjmT7ChV");

#[program]
pub mod autotrace_registry {
    use super::*;

    /// Permanently records a salted report digest under a unique PDA.
    /// VINs, report numbers, and report contents are deliberately excluded.
    pub fn anchor_report(
        ctx: Context<AnchorReport>,
        record_id: [u8; 16],
        report_hash: [u8; 32],
    ) -> Result<()> {
        require!(report_hash != [0; 32], RegistryError::EmptyHash);

        let proof = &mut ctx.accounts.proof;
        proof.issuer = ctx.accounts.issuer.key();
        proof.record_id = record_id;
        proof.report_hash = report_hash;
        proof.created_at = Clock::get()?.unix_timestamp;
        proof.bump = ctx.bumps.proof;

        emit!(ReportAnchored {
            issuer: proof.issuer,
            record_id,
            report_hash,
            created_at: proof.created_at,
        });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(record_id: [u8; 16])]
pub struct AnchorReport<'info> {
    /// Pays rent and cryptographically identifies the report issuer.
    #[account(mut)]
    pub issuer: Signer<'info>,

    /// One immutable proof PDA per issuer and random record identifier.
    #[account(
        init,
        payer = issuer,
        space = ReportProof::SPACE,
        seeds = [b"autotrace-report", issuer.key().as_ref(), &record_id],
        bump
    )]
    pub proof: Account<'info, ReportProof>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct ReportProof {
    pub issuer: Pubkey,
    pub record_id: [u8; 16],
    pub report_hash: [u8; 32],
    pub created_at: i64,
    pub bump: u8,
}

impl ReportProof {
    pub const SPACE: usize = 8 + 32 + 16 + 32 + 8 + 1;
}

#[event]
pub struct ReportAnchored {
    pub issuer: Pubkey,
    pub record_id: [u8; 16],
    pub report_hash: [u8; 32],
    pub created_at: i64,
}

#[error_code]
pub enum RegistryError {
    #[msg("A report hash must not be empty.")]
    EmptyHash,
}
