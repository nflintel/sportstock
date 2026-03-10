/*
  # Fix Security and Performance Issues

  This migration addresses critical security and performance issues identified in the database:

  ## 1. Add Missing Foreign Key Indexes
  - follows.following_id
  - franchise_exports.user_id
  - holdings.player_id
  - marketplace_listings.buyer_id
  - marketplace_listings.seller_id
  - trades.player_id
  - trades.user_id

  ## 2. Optimize RLS Policies
  Replace `auth.uid()` with `(select auth.uid())` in all policies to prevent
  re-evaluation on each row, improving query performance at scale.

  ## 3. Fix Function Security
  Set immutable search_path on all functions to prevent security vulnerabilities.

  ## 4. Fix Security Definer Views
  Update views to use SECURITY INVOKER instead of SECURITY DEFINER where appropriate.

  ## Security Notes
  - All changes follow PostgreSQL best practices
  - Performance improvements for large-scale operations
  - No data loss or breaking changes
*/

-- =============================================
-- PART 1: Add Missing Foreign Key Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_follows_following_id 
ON follows(following_id);

CREATE INDEX IF NOT EXISTS idx_franchise_exports_user_id 
ON franchise_exports(user_id);

CREATE INDEX IF NOT EXISTS idx_holdings_player_id 
ON holdings(player_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_buyer_id 
ON marketplace_listings(buyer_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id 
ON marketplace_listings(seller_id);

CREATE INDEX IF NOT EXISTS idx_trades_player_id 
ON trades(player_id);

CREATE INDEX IF NOT EXISTS idx_trades_user_id 
ON trades(user_id);

-- =============================================
-- PART 2: Optimize RLS Policies
-- =============================================

DROP POLICY IF EXISTS "Users can view their own wallet" ON wallets;
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own wallet" ON wallets;
CREATE POLICY "Users can update their own wallet" ON wallets
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own holdings" ON holdings;
CREATE POLICY "Users can view their own holdings" ON holdings
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own holdings" ON holdings;
CREATE POLICY "Users can insert their own holdings" ON holdings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own holdings" ON holdings;
CREATE POLICY "Users can update their own holdings" ON holdings
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own trades" ON trades;
CREATE POLICY "Users can view their own trades" ON trades
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own trades" ON trades;
CREATE POLICY "Users can insert their own trades" ON trades
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can follow" ON follows;
CREATE POLICY "Users can follow" ON follows
  FOR INSERT TO authenticated
  WITH CHECK (follower_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow" ON follows
  FOR DELETE TO authenticated
  USING (follower_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create leagues" ON madden_leagues;
CREATE POLICY "Users can create leagues" ON madden_leagues
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view public leagues" ON madden_leagues;
CREATE POLICY "Users can view public leagues" ON madden_leagues
  FOR SELECT TO authenticated
  USING (
    is_public = true 
    OR owner_id = (select auth.uid())
    OR id IN (
      SELECT league_id FROM league_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "League owners can update their leagues" ON madden_leagues;
CREATE POLICY "League owners can update their leagues" ON madden_leagues
  FOR UPDATE TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "League owners can delete their leagues" ON madden_leagues;
CREATE POLICY "League owners can delete their leagues" ON madden_leagues
  FOR DELETE TO authenticated
  USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view league members if they have access" ON league_members;
CREATE POLICY "Users can view league members if they have access" ON league_members
  FOR SELECT TO authenticated
  USING (
    league_id IN (
      SELECT id FROM madden_leagues 
      WHERE is_public = true 
      OR owner_id = (select auth.uid())
      OR id IN (
        SELECT league_id FROM league_members 
        WHERE user_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "League owners can add members" ON league_members;
CREATE POLICY "League owners can add members" ON league_members
  FOR INSERT TO authenticated
  WITH CHECK (
    league_id IN (
      SELECT id FROM madden_leagues 
      WHERE owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "League owners can update members" ON league_members;
CREATE POLICY "League owners can update members" ON league_members
  FOR UPDATE TO authenticated
  USING (
    league_id IN (
      SELECT id FROM madden_leagues 
      WHERE owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    league_id IN (
      SELECT id FROM madden_leagues 
      WHERE owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "League owners and members can leave" ON league_members;
CREATE POLICY "League owners and members can leave" ON league_members
  FOR DELETE TO authenticated
  USING (
    user_id = (select auth.uid())
    OR league_id IN (
      SELECT id FROM madden_leagues 
      WHERE owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can mint NFTs" ON madden_nfts;
CREATE POLICY "Users can mint NFTs" ON madden_nfts
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "NFT owners can update their NFTs" ON madden_nfts;
CREATE POLICY "NFT owners can update their NFTs" ON madden_nfts
  FOR UPDATE TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "NFT owners can delete their NFTs" ON madden_nfts;
CREATE POLICY "NFT owners can delete their NFTs" ON madden_nfts
  FOR DELETE TO authenticated
  USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view exports from their leagues" ON franchise_exports;
CREATE POLICY "Users can view exports from their leagues" ON franchise_exports
  FOR SELECT TO authenticated
  USING (
    league_id IN (
      SELECT id FROM madden_leagues 
      WHERE owner_id = (select auth.uid())
      OR id IN (
        SELECT league_id FROM league_members 
        WHERE user_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "League members can create exports" ON franchise_exports;
CREATE POLICY "League members can create exports" ON franchise_exports
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
    AND league_id IN (
      SELECT id FROM madden_leagues 
      WHERE owner_id = (select auth.uid())
      OR id IN (
        SELECT league_id FROM league_members 
        WHERE user_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Export creators can delete their exports" ON franchise_exports;
CREATE POLICY "Export creators can delete their exports" ON franchise_exports
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "NFT owners can create listings" ON marketplace_listings;
CREATE POLICY "NFT owners can create listings" ON marketplace_listings
  FOR INSERT TO authenticated
  WITH CHECK (
    seller_id = (select auth.uid())
    AND nft_id IN (
      SELECT id FROM madden_nfts 
      WHERE owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Sellers can update their listings" ON marketplace_listings;
CREATE POLICY "Sellers can update their listings" ON marketplace_listings
  FOR UPDATE TO authenticated
  USING (seller_id = (select auth.uid()))
  WITH CHECK (seller_id = (select auth.uid()));

DROP POLICY IF EXISTS "Sellers can delete their listings" ON marketplace_listings;
CREATE POLICY "Sellers can delete their listings" ON marketplace_listings
  FOR DELETE TO authenticated
  USING (seller_id = (select auth.uid()));

-- =============================================
-- PART 3: Fix Function Security (Search Path)
-- =============================================

DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS increment_league_members CASCADE;
CREATE OR REPLACE FUNCTION increment_league_members()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE madden_leagues
  SET current_members = current_members + 1
  WHERE id = NEW.league_id;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS decrement_league_members CASCADE;
CREATE OR REPLACE FUNCTION decrement_league_members()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE madden_leagues
  SET current_members = current_members - 1
  WHERE id = OLD.league_id;
  RETURN OLD;
END;
$$;

DROP FUNCTION IF EXISTS check_league_capacity CASCADE;
CREATE OR REPLACE FUNCTION check_league_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  league_max_members INTEGER;
  league_current_members INTEGER;
BEGIN
  SELECT max_members, current_members
  INTO league_max_members, league_current_members
  FROM madden_leagues
  WHERE id = NEW.league_id;

  IF league_current_members >= league_max_members THEN
    RAISE EXCEPTION 'League is at full capacity';
  END IF;

  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS calculate_win_percentage(INTEGER, INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION calculate_win_percentage(wins INTEGER, losses INTEGER)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (wins + losses) = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((wins::NUMERIC / (wins + losses)) * 100, 2);
END;
$$;

DROP FUNCTION IF EXISTS get_league_standings(UUID) CASCADE;
CREATE OR REPLACE FUNCTION get_league_standings(league_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  wins INTEGER,
  losses INTEGER,
  win_percentage NUMERIC,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lm.user_id,
    p.username,
    lm.wins,
    lm.losses,
    calculate_win_percentage(lm.wins, lm.losses) as win_percentage,
    RANK() OVER (ORDER BY calculate_win_percentage(lm.wins, lm.losses) DESC, lm.wins DESC) as rank
  FROM league_members lm
  JOIN profiles p ON lm.user_id = p.id
  WHERE lm.league_id = league_uuid
  ORDER BY rank;
END;
$$;

DROP FUNCTION IF EXISTS update_nft_owner_on_sale CASCADE;
CREATE OR REPLACE FUNCTION update_nft_owner_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'sold' AND OLD.status != 'sold' THEN
    UPDATE madden_nfts
    SET owner_id = NEW.buyer_id
    WHERE id = NEW.nft_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS validate_nft_ownership CASCADE;
CREATE OR REPLACE FUNCTION validate_nft_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nft_owner_id UUID;
BEGIN
  SELECT owner_id INTO nft_owner_id
  FROM madden_nfts
  WHERE id = NEW.nft_id;

  IF nft_owner_id != NEW.seller_id THEN
    RAISE EXCEPTION 'Seller does not own this NFT';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_holdings_updated_at ON holdings;
CREATE TRIGGER update_holdings_updated_at
  BEFORE UPDATE ON holdings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_madden_leagues_updated_at ON madden_leagues;
CREATE TRIGGER update_madden_leagues_updated_at
  BEFORE UPDATE ON madden_leagues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_league_members_updated_at ON league_members;
CREATE TRIGGER update_league_members_updated_at
  BEFORE UPDATE ON league_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS increment_league_members_trigger ON league_members;
CREATE TRIGGER increment_league_members_trigger
  AFTER INSERT ON league_members
  FOR EACH ROW
  EXECUTE FUNCTION increment_league_members();

DROP TRIGGER IF EXISTS decrement_league_members_trigger ON league_members;
CREATE TRIGGER decrement_league_members_trigger
  AFTER DELETE ON league_members
  FOR EACH ROW
  EXECUTE FUNCTION decrement_league_members();

DROP TRIGGER IF EXISTS check_league_capacity_trigger ON league_members;
CREATE TRIGGER check_league_capacity_trigger
  BEFORE INSERT ON league_members
  FOR EACH ROW
  EXECUTE FUNCTION check_league_capacity();

DROP TRIGGER IF EXISTS update_nft_owner_on_sale_trigger ON marketplace_listings;
CREATE TRIGGER update_nft_owner_on_sale_trigger
  AFTER UPDATE ON marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_nft_owner_on_sale();

DROP TRIGGER IF EXISTS validate_nft_ownership_trigger ON marketplace_listings;
CREATE TRIGGER validate_nft_ownership_trigger
  BEFORE INSERT ON marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION validate_nft_ownership();

-- =============================================
-- PART 4: Fix Security Definer Views
-- =============================================

DROP VIEW IF EXISTS active_marketplace_listings;
CREATE VIEW active_marketplace_listings
WITH (security_invoker = true)
AS
SELECT 
  ml.*,
  mn.metadata,
  mn.nft_type,
  p.username as seller_username
FROM marketplace_listings ml
JOIN madden_nfts mn ON ml.nft_id = mn.id
JOIN profiles p ON ml.seller_id = p.id
WHERE ml.status = 'active';

DROP VIEW IF EXISTS league_stats;
CREATE VIEW league_stats
WITH (security_invoker = true)
AS
SELECT 
  ml.id,
  ml.name,
  ml.owner_id,
  ml.current_members,
  ml.max_members,
  COUNT(DISTINCT mn.id) as total_nfts,
  COUNT(DISTINCT fe.id) as total_exports
FROM madden_leagues ml
LEFT JOIN madden_nfts mn ON ml.id = mn.league_id
LEFT JOIN franchise_exports fe ON ml.id = fe.league_id
GROUP BY ml.id, ml.name, ml.owner_id, ml.current_members, ml.max_members;

-- =============================================
-- PART 5: Additional Performance Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status_created 
ON marketplace_listings(status, created_at DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_madden_nfts_owner_tradeable 
ON madden_nfts(owner_id, is_tradeable) 
WHERE is_tradeable = true;

CREATE INDEX IF NOT EXISTS idx_league_members_user_league 
ON league_members(user_id, league_id);
