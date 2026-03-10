# Madden Marketplace - Web3 League Platform

Complete Web3-enabled marketplace for Madden leagues with NFT minting, franchise import/export, and blockchain integration.

## Overview

The Madden Marketplace allows users to:
- Create public or private Madden leagues
- Import/export franchise data
- Mint NFTs for achievements, player cards, and team badges
- Trade NFTs on the marketplace
- Connect crypto wallets for blockchain transactions
- Manage league members and standings

## Features

### 1. League Management
- **Create Leagues**: Public or private leagues with custom settings
- **League Types**: Franchise, Season, Tournament, Head-to-Head
- **Platform Support**: PS5, Xbox, PC, Cross-platform
- **Member Management**: Add/remove members, assign roles
- **Franchise Data**: Store complete franchise information

### 2. NFT System
- **Mint NFTs**: Create unique digital assets
- **NFT Types**:
  - Player Cards
  - Team Badges
  - Achievement Trophies
  - Historic Moments
  - Championship Rings
- **Blockchain Integration**: Real token minting on Ethereum, Polygon, etc.
- **Metadata Support**: Custom attributes and traits

### 3. Marketplace
- **Buy/Sell NFTs**: Trade digital assets
- **Multiple Currencies**: ETH, MATIC, and more
- **Transaction History**: Track all sales
- **Listing Management**: Create, cancel, and update listings

### 4. Franchise Import/Export
- **Export Data**: Download franchise data as JSON
- **Import Data**: Upload existing franchise files
- **Cloud Storage**: Automatic backup to Supabase Storage
- **Version Tracking**: Track season and week progression

### 5. Web3 Integration
- **Wallet Connection**: RainbowKit integration
- **Multi-Chain Support**: Ethereum, Polygon, Optimism, Arbitrum, Base
- **Smart Contract Ready**: Prepared for contract deployment
- **Transaction Signing**: Secure blockchain transactions

## Database Schema

### Tables

#### `madden_leagues`
```sql
- id (uuid)
- name (text)
- description (text)
- owner_id (uuid) → auth.users
- is_public (boolean)
- league_type (text)
- platform (text)
- max_members (integer)
- current_members (integer)
- franchise_data (jsonb)
- settings (jsonb)
- image_url (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `league_members`
```sql
- id (uuid)
- league_id (uuid) → madden_leagues
- user_id (uuid) → auth.users
- team_name (text)
- role (text) - owner, commissioner, member
- wins (integer)
- losses (integer)
- joined_at (timestamptz)
```

#### `madden_nfts`
```sql
- id (uuid)
- token_id (text)
- contract_address (text)
- owner_id (uuid) → auth.users
- league_id (uuid) → madden_leagues
- nft_type (text)
- metadata (jsonb)
- mint_transaction (text)
- is_tradeable (boolean)
- price (numeric)
- created_at (timestamptz)
```

#### `franchise_exports`
```sql
- id (uuid)
- league_id (uuid) → madden_leagues
- user_id (uuid) → auth.users
- export_data (jsonb)
- file_url (text)
- version (text)
- season (integer)
- week (integer)
- created_at (timestamptz)
```

#### `marketplace_listings`
```sql
- id (uuid)
- nft_id (uuid) → madden_nfts
- seller_id (uuid) → auth.users
- price (numeric)
- currency (text)
- status (text) - active, sold, cancelled
- buyer_id (uuid) → auth.users
- transaction_hash (text)
- created_at (timestamptz)
- sold_at (timestamptz)
```

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```bash
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. Update Wagmi Config

Edit `src/lib/wagmi.ts` and replace the project ID:

```typescript
export const config = getDefaultConfig({
  appName: 'SportStock Madden Marketplace',
  projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false,
});
```

### 3. Create Storage Bucket

In Supabase Dashboard:
1. Go to Storage
2. Create new bucket: `franchise-exports`
3. Set to Public
4. Enable RLS policies

## Usage Guide

### Creating a League

```typescript
import { useMaddenLeagues } from '@/hooks/useMaddenLeagues';

const { createLeague } = useMaddenLeagues();

const handleCreateLeague = async () => {
  await createLeague.mutateAsync({
    name: "Elite Madden 25 League",
    description: "Competitive franchise league",
    is_public: true,
    league_type: "franchise",
    platform: "PS5",
    max_members: 32,
    settings: {
      difficulty: "All-Pro",
      quarter_length: 6,
    },
  });
};
```

### Minting an NFT

```typescript
import { useNFTs } from '@/hooks/useNFT';
import { useWeb3 } from '@/hooks/useWeb3';

const { mintNFT } = useNFTs();
const { address } = useWeb3();

const handleMintNFT = async () => {
  await mintNFT.mutateAsync({
    nftData: {
      nft_type: "player_card",
      metadata: {
        name: "MVP Season 2024",
        description: "League MVP achievement",
        image: "https://example.com/mvp.png",
        attributes: [
          { trait_type: "Overall", value: "99" },
          { trait_type: "Season", value: "2024" },
          { trait_type: "Rarity", value: "Legendary" },
        ],
      },
      league_id: "league-uuid",
    },
    walletAddress: address,
  });
};
```

### Exporting Franchise Data

```typescript
import { useFranchiseExport } from '@/hooks/useFranchiseExport';

const { exportFranchise } = useFranchiseExport();

const handleExport = async () => {
  await exportFranchise.mutateAsync({
    league_id: "league-uuid",
    export_data: {
      teams: [
        {
          id: "team-1",
          name: "Chiefs",
          wins: 12,
          losses: 5,
          ties: 0,
          roster: [],
        },
      ],
      standings: {},
      schedule: [],
      stats: {},
    },
    version: "Madden 25",
    season: 2024,
    week: 17,
  });
};
```

### Connecting Wallet

```typescript
import WalletConnect from '@/components/WalletConnect';

// Simply add the component to your page
<WalletConnect />
```

### Using Web3 Context

```typescript
import { useWeb3 } from '@/hooks/useWeb3';

const MyComponent = () => {
  const { address, isConnected, chainId, disconnect } = useWeb3();

  if (!isConnected) {
    return <p>Please connect your wallet</p>;
  }

  return (
    <div>
      <p>Connected: {address}</p>
      <p>Chain ID: {chainId}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
};
```

## Component Reference

### WalletConnect
Wallet connection button with RainbowKit integration.

**Props:** None

**Usage:**
```tsx
<WalletConnect />
```

### CreateLeagueModal
Modal dialog for creating new leagues.

**Props:**
- `open: boolean` - Control modal visibility
- `onOpenChange: (open: boolean) => void` - Handle visibility changes

**Usage:**
```tsx
const [isOpen, setIsOpen] = useState(false);

<CreateLeagueModal
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

### MintNFTModal
Modal dialog for minting NFTs.

**Props:**
- `open: boolean` - Control modal visibility
- `onOpenChange: (open: boolean) => void` - Handle visibility changes
- `leagueId?: string` - Optional league association

**Usage:**
```tsx
<MintNFTModal
  open={isOpen}
  onOpenChange={setIsOpen}
  leagueId="league-uuid"
/>
```

## API Hooks

### useMaddenLeagues()

**Returns:**
- `publicLeagues` - All public leagues
- `myLeagues` - Current user's leagues
- `loadingPublic` - Loading state for public leagues
- `loadingMy` - Loading state for user leagues
- `createLeague` - Mutation to create league
- `updateLeague` - Mutation to update league
- `deleteLeague` - Mutation to delete league

### useLeagueMembers(leagueId)

**Returns:**
- `members` - League members list
- `isLoading` - Loading state
- `joinLeague` - Mutation to join league
- `leaveLeague` - Mutation to leave league

### useNFTs()

**Returns:**
- `myNFTs` - Current user's NFTs
- `allNFTs` - All NFTs in system
- `loadingMyNFTs` - Loading state for user NFTs
- `loadingAllNFTs` - Loading state for all NFTs
- `mintNFT` - Mutation to mint new NFT
- `updateNFTPrice` - Mutation to update price
- `transferNFT` - Mutation to transfer ownership

### useMarketplace()

**Returns:**
- `listings` - Active marketplace listings
- `isLoading` - Loading state
- `createListing` - Mutation to create listing
- `cancelListing` - Mutation to cancel listing
- `buyNFT` - Mutation to purchase NFT

### useFranchiseExport(leagueId)

**Returns:**
- `exports` - League franchise exports
- `isLoading` - Loading state
- `exportFranchise` - Mutation to export data
- `importFranchise` - Mutation to import data
- `deleteExport` - Mutation to delete export
- `downloadExport` - Function to download file

### useWeb3()

**Returns:**
- `address` - Connected wallet address
- `isConnected` - Connection status
- `isConnecting` - Connecting status
- `openConnectModal` - Function to open wallet modal
- `disconnect` - Function to disconnect wallet
- `chainId` - Current chain ID

## Security

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

**Leagues:**
- Users can create their own leagues
- Public leagues visible to all
- Private leagues only to owner and members
- Only owners can update/delete leagues

**NFTs:**
- All NFTs publicly visible
- Only owners can update/transfer/delete
- Minting requires authentication

**Marketplace:**
- All active listings visible
- Only sellers can update/cancel
- Only NFT owners can create listings

**Franchise Exports:**
- Only league members can view exports
- Only members can create exports
- Only creators can delete exports

## Smart Contract Integration

### Contract Deployment

When you're ready to deploy smart contracts:

1. **Install Hardhat/Foundry**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. **Create NFT Contract**
```solidity
// contracts/MaddenNFT.sol
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MaddenNFT is ERC721, Ownable {
    uint256 private _tokenIds;

    constructor() ERC721("MaddenNFT", "MDNFT") Ownable(msg.sender) {}

    function mint(address to, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(to, newTokenId);
        return newTokenId;
    }
}
```

3. **Deploy Script**
```typescript
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const MaddenNFT = await ethers.getContractFactory("MaddenNFT");
  const nft = await MaddenNFT.deploy();
  await nft.deployed();

  console.log("MaddenNFT deployed to:", nft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

4. **Update Contract Address**
```typescript
// src/lib/contracts.ts
export const MADDEN_NFT_ADDRESS = "0x..."; // Your deployed address
```

## Franchise Data Format

### Export Format

```json
{
  "teams": [
    {
      "id": "team-1",
      "name": "Kansas City Chiefs",
      "wins": 12,
      "losses": 5,
      "ties": 0,
      "roster": [
        {
          "player_id": "p1",
          "name": "Patrick Mahomes",
          "position": "QB",
          "overall": 99,
          "stats": {
            "passing_yards": 4183,
            "touchdowns": 26,
            "interceptions": 7
          }
        }
      ]
    }
  ],
  "standings": {
    "AFC West": [
      { "team": "Chiefs", "wins": 12, "losses": 5 }
    ]
  },
  "schedule": [
    {
      "week": 1,
      "home": "Chiefs",
      "away": "Ravens",
      "score": { "home": 27, "away": 20 }
    }
  ],
  "stats": {
    "leaders": {
      "passing": { "player": "Patrick Mahomes", "yards": 4183 },
      "rushing": { "player": "Christian McCaffrey", "yards": 1459 }
    }
  }
}
```

## Troubleshooting

### Wallet Connection Issues

**Problem:** Wallet won't connect
**Solution:**
1. Ensure WalletConnect project ID is set
2. Check browser wallet extension is installed
3. Clear browser cache and try again
4. Try different wallet provider

### NFT Minting Fails

**Problem:** NFT minting transaction fails
**Solution:**
1. Ensure wallet is connected
2. Check sufficient gas fees
3. Verify network selection
4. Check console for specific error

### Franchise Export Error

**Problem:** Export fails to save
**Solution:**
1. Check Supabase storage bucket exists
2. Verify bucket permissions (public read)
3. Check file size limits
4. Ensure user is league member

## Roadmap

### Phase 1 (Current)
- ✅ League creation and management
- ✅ NFT minting system
- ✅ Marketplace functionality
- ✅ Franchise import/export
- ✅ Wallet integration

### Phase 2 (Next)
- Smart contract deployment
- Real blockchain minting
- Advanced trading features
- League tournaments
- Leaderboards

### Phase 3 (Future)
- Cross-league competitions
- Advanced analytics
- Mobile app
- Live draft system
- Integration with EA Sports API

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check the Supabase logs
4. Review browser console errors

## License

This Madden Marketplace implementation is part of the SportStock platform.
