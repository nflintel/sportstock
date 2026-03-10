# Quick Reference: NFT Contract Secrets

## Current Configuration Status

### Edge Function Deployed
✅ `mint-nft` Edge Function is deployed and ready to use

### Required Secrets (Not Yet Configured)

The following secrets need to be configured in your Supabase project:

1. **NFT_CONTRACT_ADDRESS** - Your deployed NFT smart contract address
2. **BLOCKCHAIN_PRIVATE_KEY** - Backend wallet private key for signing transactions
3. **RPC_ENDPOINT_URL** - Blockchain RPC endpoint (e.g., Base, Ethereum)
4. **CHAIN_ID** - Network chain ID (e.g., 8453 for Base Mainnet)
5. **IPFS_API_KEY** - API key for IPFS storage (optional)

## How to Configure Secrets

### Via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/functions
2. Click on "Edge Functions" → "Secrets"
3. Add each secret one by one

### Via Supabase CLI

```bash
# Set all required secrets
supabase secrets set NFT_CONTRACT_ADDRESS=0xYourContractAddress
supabase secrets set BLOCKCHAIN_PRIVATE_KEY=your_private_key
supabase secrets set RPC_ENDPOINT_URL=https://mainnet.base.org
supabase secrets set CHAIN_ID=8453
supabase secrets set IPFS_API_KEY=your_ipfs_key
```

### Verify Configuration

```bash
# List all secrets
supabase secrets list
```

## Testing the Setup

Once secrets are configured, test the mint-nft function:

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/mint-nft \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "nft_type": "player_card",
    "metadata": {
      "name": "Test Player",
      "description": "Test NFT",
      "image": "https://example.com/image.png",
      "attributes": [
        {"trait_type": "Sport", "value": "Football"}
      ]
    }
  }'
```

## Important Notes

- **Local Development**: Update `.env` file with test values
- **Production**: Use Supabase Dashboard or CLI to set secrets
- **Security**: Never commit private keys to version control
- **Testing**: Start with testnet (Base Sepolia) before mainnet

## Error Handling

If you see this error when minting:
```
"NFT contract not configured. Please set NFT_CONTRACT_ADDRESS in Supabase secrets."
```

It means the `NFT_CONTRACT_ADDRESS` secret is not set or is set to the default placeholder address.

## Next Steps

1. Deploy your NFT smart contract (see NFT_CONTRACT_SETUP.md)
2. Configure the secrets in Supabase
3. Test minting on testnet
4. Update to mainnet configuration when ready

## Resources

- Full setup guide: `NFT_CONTRACT_SETUP.md`
- Utility functions: `src/utils/nftConfig.ts`
- Edge function: `supabase/functions/mint-nft/index.ts`
