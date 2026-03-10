/*
  # Madden League Marketplace and NFT System

  1. New Tables
    - `madden_leagues`
      - `id` (uuid, primary key)
      - `name` (text) - League name
      - `description` (text) - League description
      - `owner_id` (uuid) - References auth.users
      - `is_public` (boolean) - Public or private league
      - `league_type` (text) - Franchise, Season, Tournament
      - `platform` (text) - PS5, Xbox, PC
      - `max_members` (integer) - Maximum league members
      - `current_members` (integer) - Current member count
      - `franchise_data` (jsonb) - Imported franchise data
      - `settings` (jsonb) - League settings and rules
      - `image_url` (text) - League banner image
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `league_members`
      - `id` (uuid, primary key)
      - `league_id` (uuid) - References madden_leagues
      - `user_id` (uuid) - References auth.users
      - `team_name` (text)
      - `role` (text) - owner, commissioner, member
      - `wins` (integer)
      - `losses` (integer)
      - `joined_at` (timestamptz)

    - `madden_nfts`
      - `id` (uuid, primary key)
      - `token_id` (text) - Blockchain token ID
      - `contract_address` (text) - Smart contract address
      - `owner_id` (uuid) - References auth.users
      - `league_id` (uuid) - References madden_leagues (nullable)
      - `nft_type` (text) - player_card, team_badge, achievement, moment
      - `metadata` (jsonb) - NFT metadata (name, image, attributes)
      - `mint_transaction` (text) - Transaction hash
      - `is_tradeable` (boolean)
      - `price` (numeric) - Listing price if for sale
      - `created_at` (timestamptz)

    - `franchise_exports`
      - `id` (uuid, primary key)
      - `league_id` (uuid) - References madden_leagues
      - `user_id` (uuid) - References auth.users
      - `export_data` (jsonb) - Full franchise export data
      - `file_url` (text) - Storage URL for export file
      - `version` (text) - Madden game version
      - `season` (integer)
      - `week` (integer)
      - `created_at` (timestamptz)

    - `marketplace_listings`
      - `id` (uuid, primary key)
      - `nft_id` (uuid) - References madden_nfts
      - `seller_id` (uuid) - References auth.users
      - `price` (numeric)
      - `currency` (text) - ETH, MATIC, etc.
      - `status` (text) - active, sold, cancelled
      - `buyer_id` (uuid) - References auth.users (nullable)
      - `transaction_hash` (text)
      - `created_at` (timestamptz)
      - `sold_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can create and manage their own leagues
    - Public leagues visible to all, private leagues only to members
    - NFT owners can list/delist their NFTs
    - League owners can manage members and settings
*/

-- Create madden_leagues table
CREATE TABLE IF NOT EXISTS madden_leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_public boolean DEFAULT true,
  league_type text DEFAULT 'franchise',
  platform text DEFAULT 'PS5',
  max_members integer DEFAULT 32,
  current_members integer DEFAULT 1,
  franchise_data jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create league_members table
CREATE TABLE IF NOT EXISTS league_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid REFERENCES madden_leagues(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_name text,
  role text DEFAULT 'member',
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(league_id, user_id)
);

-- Create madden_nfts table
CREATE TABLE IF NOT EXISTS madden_nfts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id text,
  contract_address text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  league_id uuid REFERENCES madden_leagues(id) ON DELETE SET NULL,
  nft_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  mint_transaction text,
  is_tradeable boolean DEFAULT true,
  price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create franchise_exports table
CREATE TABLE IF NOT EXISTS franchise_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid REFERENCES madden_leagues(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  export_data jsonb DEFAULT '{}'::jsonb,
  file_url text,
  version text,
  season integer,
  week integer,
  created_at timestamptz DEFAULT now()
);

-- Create marketplace_listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id uuid REFERENCES madden_nfts(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price numeric NOT NULL,
  currency text DEFAULT 'ETH',
  status text DEFAULT 'active',
  buyer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_hash text,
  created_at timestamptz DEFAULT now(),
  sold_at timestamptz
);

-- Enable RLS
ALTER TABLE madden_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE madden_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Madden Leagues Policies
CREATE POLICY "Users can create leagues"
  ON madden_leagues FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view public leagues"
  ON madden_leagues FOR SELECT
  TO authenticated
  USING (is_public = true OR owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM league_members
    WHERE league_members.league_id = madden_leagues.id
    AND league_members.user_id = auth.uid()
  ));

CREATE POLICY "League owners can update their leagues"
  ON madden_leagues FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "League owners can delete their leagues"
  ON madden_leagues FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- League Members Policies
CREATE POLICY "Users can view league members if they have access"
  ON league_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM madden_leagues
      WHERE madden_leagues.id = league_members.league_id
      AND (madden_leagues.is_public = true OR madden_leagues.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM league_members lm
        WHERE lm.league_id = madden_leagues.id AND lm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "League owners can add members"
  ON league_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM madden_leagues
      WHERE madden_leagues.id = league_members.league_id
      AND madden_leagues.owner_id = auth.uid()
    )
  );

CREATE POLICY "League owners can update members"
  ON league_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM madden_leagues
      WHERE madden_leagues.id = league_members.league_id
      AND madden_leagues.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM madden_leagues
      WHERE madden_leagues.id = league_members.league_id
      AND madden_leagues.owner_id = auth.uid()
    )
  );

CREATE POLICY "League owners and members can leave"
  ON league_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM madden_leagues
      WHERE madden_leagues.id = league_members.league_id
      AND madden_leagues.owner_id = auth.uid()
    )
  );

-- Madden NFTs Policies
CREATE POLICY "Users can view all NFTs"
  ON madden_nfts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can mint NFTs"
  ON madden_nfts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "NFT owners can update their NFTs"
  ON madden_nfts FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "NFT owners can delete their NFTs"
  ON madden_nfts FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Franchise Exports Policies
CREATE POLICY "Users can view exports from their leagues"
  ON franchise_exports FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM madden_leagues
      WHERE madden_leagues.id = franchise_exports.league_id
      AND (madden_leagues.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM league_members
        WHERE league_members.league_id = madden_leagues.id
        AND league_members.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "League members can create exports"
  ON franchise_exports FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = franchise_exports.league_id
      AND league_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Export creators can delete their exports"
  ON franchise_exports FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Marketplace Listings Policies
CREATE POLICY "Users can view all active listings"
  ON marketplace_listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "NFT owners can create listings"
  ON marketplace_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (
      SELECT 1 FROM madden_nfts
      WHERE madden_nfts.id = marketplace_listings.nft_id
      AND madden_nfts.owner_id = auth.uid()
      AND madden_nfts.is_tradeable = true
    )
  );

CREATE POLICY "Sellers can update their listings"
  ON marketplace_listings FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can delete their listings"
  ON marketplace_listings FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_madden_leagues_owner ON madden_leagues(owner_id);
CREATE INDEX IF NOT EXISTS idx_madden_leagues_public ON madden_leagues(is_public);
CREATE INDEX IF NOT EXISTS idx_league_members_league ON league_members(league_id);
CREATE INDEX IF NOT EXISTS idx_league_members_user ON league_members(user_id);
CREATE INDEX IF NOT EXISTS idx_madden_nfts_owner ON madden_nfts(owner_id);
CREATE INDEX IF NOT EXISTS idx_madden_nfts_league ON madden_nfts(league_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_franchise_exports_league ON franchise_exports(league_id);
