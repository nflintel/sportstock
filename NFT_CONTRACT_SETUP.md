# NFT Contract Setup Guide

This guide explains how to configure your NFT smart contract secrets for the Madden Marketplace application.

## Required Secrets

### 1. NFT_CONTRACT_ADDRESS
Your deployed NFT smart contract address on the blockchain.

**Example:** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### 2. BLOCKCHAIN_PRIVATE_KEY
Private key for signing blockchain transactions (backend wallet).

**Security Note:** This should be a dedicated wallet with minimal funds, only used for backend operations.

### 3. RPC_ENDPOINT_URL
Blockchain RPC endpoint for interacting with the network.

**Examples:**
- Base Mainnet: `https://mainnet.base.org`
- Base Sepolia (Testnet): `https://sepolia.base.org`
- With Infura: `https://base-mainnet.infura.io/v3/YOUR_INFURA_KEY`
- With Alchemy: `https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY`

### 4. CHAIN_ID
Network chain ID for the blockchain you're using.

**Common Chain IDs:**
- Ethereum Mainnet: `1`
- Base Mainnet: `8453`
- Base Sepolia (Testnet): `84532`
- Polygon: `137`
- Arbitrum: `42161`

### 5. IPFS_API_KEY (Optional)
API key for storing NFT metadata on IPFS.

**Providers:**
- Pinata: https://pinata.cloud
- NFT.Storage: https://nft.storage
- Web3.Storage: https://web3.storage

## Setup Instructions

### Local Development

1. Edit your `.env` file in the project root:
```bash
NFT_CONTRACT_ADDRESS=0xYourContractAddress
BLOCKCHAIN_PRIVATE_KEY=your_private_key
RPC_ENDPOINT_URL=https://sepolia.base.org
CHAIN_ID=84532
IPFS_API_KEY=your_ipfs_key
```

### Production (Supabase Edge Functions)

You need to set these secrets in your Supabase project:

#### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Edge Functions** → **Secrets**
4. Click **Add Secret** for each variable:
   - `NFT_CONTRACT_ADDRESS`
   - `BLOCKCHAIN_PRIVATE_KEY`
   - `RPC_ENDPOINT_URL`
   - `CHAIN_ID`
   - `IPFS_API_KEY`

#### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set NFT_CONTRACT_ADDRESS=0xYourContractAddress
supabase secrets set BLOCKCHAIN_PRIVATE_KEY=your_private_key
supabase secrets set RPC_ENDPOINT_URL=https://mainnet.base.org
supabase secrets set CHAIN_ID=8453
supabase secrets set IPFS_API_KEY=your_ipfs_key
```

#### Verify Secrets

```bash
# List all configured secrets
supabase secrets list
```

## Smart Contract Deployment

If you haven't deployed your NFT contract yet, here's a quick guide:

### Using Hardhat

1. **Install Hardhat:**
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
```

2. **Create NFT Contract (ERC-721):**
```solidity
// contracts/MaddenNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MaddenNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    constructor() ERC721("Madden Marketplace NFT", "MADDEN") Ownable(msg.sender) {}

    function safeMint(address to, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

3. **Deploy Script:**
```javascript
// scripts/deploy.js
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

4. **Deploy to Base:**
```bash
npx hardhat run scripts/deploy.js --network base
```

### Using Remix IDE

1. Go to https://remix.ethereum.org
2. Create a new file with your contract code
3. Compile the contract
4. Connect your wallet (MetaMask)
5. Select "Injected Provider - MetaMask"
6. Deploy to Base network
7. Copy the deployed contract address

## Security Best Practices

### 1. Separate Wallets
- **Development:** Use testnet wallets with test ETH
- **Production:** Use a dedicated backend wallet with minimal funds

### 2. Key Management
- Never commit private keys to Git
- Use environment variables for all secrets
- Rotate keys regularly (every 3-6 months)
- Consider using a hardware wallet for high-value operations

### 3. Network Configuration
- Start on testnet (Base Sepolia) before mainnet
- Test all transactions thoroughly
- Monitor gas prices and set appropriate limits

### 4. Contract Security
- Audit your smart contract before deployment
- Use OpenZeppelin contracts for standard functionality
- Implement access controls (Ownable, Role-based)
- Consider using a multisig wallet for contract ownership

## Testing

### Test on Base Sepolia First

1. Get testnet ETH from Base Sepolia faucet:
   - https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

2. Update your `.env` with testnet configuration:
```bash
NFT_CONTRACT_ADDRESS=0xYourTestnetContract
RPC_ENDPOINT_URL=https://sepolia.base.org
CHAIN_ID=84532
```

3. Test minting NFTs through your application

4. Verify transactions on Base Sepolia explorer:
   - https://sepolia.basescan.org

## Troubleshooting

### "Insufficient funds" error
- Ensure your backend wallet has enough ETH for gas fees
- Check current gas prices on the network

### "Invalid contract address" error
- Verify the contract is deployed to the correct network
- Check that CHAIN_ID matches your RPC_ENDPOINT_URL

### "Transaction failed" error
- Check contract permissions (is your backend wallet authorized?)
- Verify the contract ABI matches your implementation
- Review transaction logs on block explorer

## Resources

- **Base Documentation:** https://docs.base.org
- **OpenZeppelin:** https://docs.openzeppelin.com
- **Hardhat:** https://hardhat.org/docs
- **IPFS Pinata:** https://docs.pinata.cloud
- **Base Sepolia Faucet:** https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Base Explorer:** https://basescan.org

## Support

For issues with:
- **Smart Contracts:** Check Base Discord or Stack Exchange
- **Supabase Secrets:** Supabase Discord or Documentation
- **This Application:** Create an issue in the project repository
