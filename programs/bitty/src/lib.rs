use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, mint_to, spl_token, Mint, MintTo, Token, Burn, TokenAccount};
use anchor_spl::metadata::{
    create_master_edition_v3, create_metadata_accounts_v3, CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata, set_and_verify_sized_collection_item,
    SetAndVerifySizedCollectionItem 
};
use mpl_token_metadata::{
    types::{CollectionDetails, Creator, DataV2},
    ID as MPL_TOKEN_METADATA_ID,
};
use anchor_lang::solana_program::{
    program::invoke_signed,
    system_instruction,
    program_pack::Pack,
};
use spl_associated_token_account::instruction as ata_ix;
use anchor_lang::solana_program::keccak;

declare_id!("14RbRGDM1TEyVQA2jB6LZ9L5bpiz3J9yRKw5fN6AehGK");


// -----------------------------
// PDA Seeds
// -----------------------------

pub const SEED_AUTH: &[u8] = b"auth";

pub const SEED_BITTY_MINT: &[u8] = b"bitty_mint";

pub const SEED_CONFIG: &[u8] = b"config";

pub const SEED_COLLECTIONS: &[u8] = b"collections";

// -----------------------------
// Accounts
// -----------------------------
#[account]
pub struct Config {
    pub bump: u8,
    pub auth_bump: u8,
    pub counter: u32,
}

#[program]
pub mod bitty {
    use super::*;

   /// Create a single collection NFT (mint, metadata, master edition).
    /// Call it 3 times (once for each of Boxes / Eggs / Babies).
    /// 1 : box, 2 : egg, 3 : baby
    pub fn create_collection_nft(ctx: Context<CreateCollectionNft>, name: String, symbol: String, uri: String) -> Result<()> {
        // get config account
        let cfg = &mut ctx.accounts.config;
        require!(cfg.counter < 3, ErrCode::NoCollectionMint);

        // creating seeds
        let binding = cfg.key();

        let seeds = &[
            SEED_AUTH,
            binding.as_ref(),
            &[cfg.auth_bump],
        ];

        // mint collection NFT
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    authority: ctx.accounts.authority_pda.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    mint: ctx.accounts.collection_mint.to_account_info(),
                },
                &[&seeds[..]],
            ),
            1, // 1 token
        )?;

        // create metadata accounts
        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                ctx.accounts.metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    payer: ctx.accounts.payer.to_account_info(),
                    mint: ctx.accounts.collection_mint.to_account_info(),
                    metadata: ctx.accounts.collection_metadata.to_account_info(),
                    mint_authority: ctx.accounts.authority_pda.to_account_info(),
                    update_authority: ctx.accounts.authority_pda.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                &[&seeds[..]],
            ),
            DataV2 {
                name,
                symbol,
                uri,
                seller_fee_basis_points: 0,
                creators: Some(vec![Creator {
                    address: ctx.accounts.authority_pda.key(),
                    verified: true,
                    share: 100,
                }]),
                collection: None,
                uses: None,
            },
            true,
            true,
            Some(CollectionDetails::V1 { size: 0 }),
        )?;

        // create master edition
        create_master_edition_v3(
            CpiContext::new_with_signer(
                ctx.accounts.metadata_program.to_account_info(),
                CreateMasterEditionV3 {
                    edition: ctx.accounts.master_edition.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    mint: ctx.accounts.collection_mint.to_account_info(),
                    metadata: ctx.accounts.collection_metadata.to_account_info(),
                    mint_authority: ctx.accounts.authority_pda.to_account_info(),
                    update_authority: ctx.accounts.authority_pda.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                &[&seeds[..]],
            ),
            Some(0),
        )?;

        Ok(())
    }

    pub fn mint_bitty(ctx: Context<MintBitty>, id: u32, name: String, symbol: String, uri: String) -> Result<()> {
        // get config account
        let cfg = &mut ctx.accounts.config;

        // get seeds
        let binding = cfg.key();

        let seeds = &[
            SEED_AUTH.as_ref(),
            binding.as_ref(),
            &[cfg.auth_bump],
        ];

        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    authority: ctx.accounts.authority_pda.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
                &[&seeds[..]],
            ),
            1,
        )?;

        // create metadata accounts
        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                ctx.accounts.metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    payer: ctx.accounts.payer.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    metadata: ctx.accounts.nft_metadata.to_account_info(),
                    mint_authority: ctx.accounts.authority_pda.to_account_info(),
                    update_authority: ctx.accounts.authority_pda.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                &[&seeds[..]],
            ),
            DataV2 {
                name,
                symbol,
                uri,
                seller_fee_basis_points: 0,
                creators: Some(vec![Creator {
                    address: ctx.accounts.authority_pda.key(),
                    verified: true,
                    share: 100,
                }]),
                collection: Some(mpl_token_metadata::types::Collection{
                    verified: false,
                    key: ctx.accounts.collection_mint.key(),
                }),
                uses: None,
            },
            true,
            true,
            None,
        )?;

        // create master edition
        create_master_edition_v3(
            CpiContext::new_with_signer(
                ctx.accounts.metadata_program.to_account_info(),
                CreateMasterEditionV3 {
                    edition: ctx.accounts.master_edition.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    metadata: ctx.accounts.nft_metadata.to_account_info(),
                    mint_authority: ctx.accounts.authority_pda.to_account_info(),
                    update_authority: ctx.accounts.authority_pda.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                &[&seeds[..]],
            ),
            Some(1),
        )?;

        Ok(())
    }
}


// -----------------------------
// Accounts
// -----------------------------
#[derive(Accounts)]
pub struct CreateCollectionNft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [SEED_CONFIG],
        bump
    )]
    pub config: Account<'info, Config>,
    
    /// CHECK: program-derived; signs CPIs via seeds
    #[account(
        seeds = [SEED_AUTH, config.key().as_ref()],
        bump
    )]
    pub authority_pda: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        seeds = [
            SEED_COLLECTIONS, 
            config.key().as_ref(),
            &config.counter.to_le_bytes()
        ],
        bump,
        mint::decimals = 0,
        mint::authority = authority_pda,
        mint::freeze_authority = authority_pda,
    )]
    pub collection_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = collection_mint,
        associated_token::authority = authority_pda,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA by Metaplex
    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key(),
    )]
    pub collection_metadata: UncheckedAccount<'info>,

    /// CHECK: PDA by Metaplex
    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
            b"edition",
        ],
        bump,
        seeds::program = metadata_program.key(),
    )]
    pub master_edition: UncheckedAccount<'info>,

    /// CHECK: Metaplex program
    #[account(address = MPL_TOKEN_METADATA_ID)]
    pub metadata_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,

    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(id: u32)]
pub struct MintBitty<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [SEED_CONFIG],
        bump,
    )]
    pub config: Account<'info, Config>,

    ///CHECK: program-derived; signs CPIs via seeds
    #[account(
        seeds = [SEED_AUTH, config.key().as_ref()],
        bump = config.auth_bump
    )]
    pub authority_pda: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = authority_pda,
        mint::freeze_authority = authority_pda,
        seeds = [
            SEED_BITTY_MINT, 
            config.key().as_ref(),
            payer.key().as_ref(),
            &id.to_le_bytes(),
        ],
        bump,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA by Metaplex
    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    pub nft_metadata: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
            b"edition"
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    /// CHECK:
    pub master_edition: UncheckedAccount<'info>,

    // ─────────────── BOX COLLECTION (parent) ───────────────
    #[account(
        mut,
        seeds = [
            SEED_COLLECTIONS,
            config.key().as_ref(),
            &0_u32.to_le_bytes(),
        ],
        bump,
    )]
    pub collection_mint: Account<'info, Mint>,

    /// CHECK: PDA by Metaplex
    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    pub collection_metadata: UncheckedAccount<'info>,

    /// CHECK: PDA by Metaplex
    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
            b"edition",
        ],
        bump,
        seeds::program = metadata_program.key(),
    )]
    pub collection_master_edition: UncheckedAccount<'info>,

    /// CHECK: Metaplex program
    #[account(address = MPL_TOKEN_METADATA_ID)]
    pub metadata_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,

    pub rent: Sysvar<'info, Rent>,
}


// -----------------------------
// Errors
// -----------------------------

#[error_code]
pub enum ErrCode {
    #[msg("Index out of bounds")]
    IndexOutOfBounds,
    #[msg("No collection mint")]
    NoCollectionMint,
}