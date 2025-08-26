#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("5tDGXUeaGMTa549wnseY3uspE1UoUeTZcUpTvxE4D5ep");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod journal_app {
    use super::*;


    pub fn create_journal_entry(ctx: Context<CreateEntry>, id: Vec<u8>, title: String, message: String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.id = id; 
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;

        Ok(())
    }

    pub fn update_journal_entry(ctx: Context<UpdateEntry>, _id: Vec<u8>, title: String, message: String) -> Result<()>{
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.title = title;
        journal_entry.message = message;

        Ok(())
        
    }

    pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, _id: Vec<u8>) -> Result<()>{
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(id: Vec<u8>)]
pub struct CreateEntry<'info> {
    #[account(
        init,
        payer = owner,
        space = ANCHOR_DISCRIMINATOR_SIZE + JournalEntryState::INIT_SPACE, 
        seeds = [&id, owner.key().as_ref()], 
        bump, 
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account[mut]]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: Vec<u8>)]
pub struct UpdateEntry<'info> {

    #[account(
        mut,
        realloc = ANCHOR_DISCRIMINATOR_SIZE + JournalEntryState::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true,
        seeds = [&id, owner.key().as_ref()],
        bump,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account[mut]]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,

}

#[derive(Accounts)]
#[instruction(id: Vec<u8>)]
pub struct DeleteEntry<'info> {

    #[account(
        mut,
        close = owner,
        seeds = [&id, owner.key().as_ref()],
        bump,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>

}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,

    #[max_len(16)]
    pub id: Vec<u8>,

    #[max_len(50)]
    pub title: String,

    #[max_len(1000)]
    pub message: String,
}
