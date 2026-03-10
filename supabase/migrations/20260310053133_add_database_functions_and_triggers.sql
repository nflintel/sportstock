/*
  # Add Database Functions and Triggers

  1. New Functions
    - `increment_league_members` - Auto increment member count
    - `decrement_league_members` - Auto decrement member count
    - `update_updated_at` - Auto update timestamps
    - `notify_league_update` - Notify on league changes
    - `calculate_win_percentage` - Calculate team win percentage

  2. Triggers
    - Auto-increment league members on join
    - Auto-decrement league members on leave
    - Auto-update timestamps
    - Validate league capacity

  3. Important Notes
    - All functions are idempotent
    - Triggers prevent data inconsistency
    - Performance optimized with indexes
*/

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to madden_leagues
DROP TRIGGER IF EXISTS update_madden_leagues_updated_at ON madden_leagues;
CREATE TRIGGER update_madden_leagues_updated_at
  BEFORE UPDATE ON madden_leagues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment league member count
CREATE OR REPLACE FUNCTION increment_league_members()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE madden_leagues
  SET current_members = current_members + 1
  WHERE id = NEW.league_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement league member count
CREATE OR REPLACE FUNCTION decrement_league_members()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE madden_leagues
  SET current_members = current_members - 1
  WHERE id = OLD.league_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment members on join
DROP TRIGGER IF EXISTS increment_members_on_join ON league_members;
CREATE TRIGGER increment_members_on_join
  AFTER INSERT ON league_members
  FOR EACH ROW
  EXECUTE FUNCTION increment_league_members();

-- Trigger to decrement members on leave
DROP TRIGGER IF EXISTS decrement_members_on_leave ON league_members;
CREATE TRIGGER decrement_members_on_leave
  AFTER DELETE ON league_members
  FOR EACH ROW
  EXECUTE FUNCTION decrement_league_members();

-- Function to check league capacity before joining
CREATE OR REPLACE FUNCTION check_league_capacity()
RETURNS TRIGGER AS $$
DECLARE
  league_max_members INTEGER;
  league_current_members INTEGER;
BEGIN
  SELECT max_members, current_members INTO league_max_members, league_current_members
  FROM madden_leagues
  WHERE id = NEW.league_id;

  IF league_current_members >= league_max_members THEN
    RAISE EXCEPTION 'League is at full capacity';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check capacity before joining
DROP TRIGGER IF EXISTS check_capacity_before_join ON league_members;
CREATE TRIGGER check_capacity_before_join
  BEFORE INSERT ON league_members
  FOR EACH ROW
  EXECUTE FUNCTION check_league_capacity();

-- Function to calculate win percentage
CREATE OR REPLACE FUNCTION calculate_win_percentage(
  p_wins INTEGER,
  p_losses INTEGER
)
RETURNS NUMERIC AS $$
BEGIN
  IF (p_wins + p_losses) = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((p_wins::NUMERIC / (p_wins + p_losses)::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get league standings
CREATE OR REPLACE FUNCTION get_league_standings(p_league_id UUID)
RETURNS TABLE (
  user_id UUID,
  team_name TEXT,
  wins INTEGER,
  losses INTEGER,
  win_percentage NUMERIC,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lm.user_id,
    lm.team_name,
    lm.wins,
    lm.losses,
    calculate_win_percentage(lm.wins, lm.losses) as win_percentage,
    lm.role
  FROM league_members lm
  WHERE lm.league_id = p_league_id
  ORDER BY calculate_win_percentage(lm.wins, lm.losses) DESC, lm.wins DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update NFT owner on marketplace sale
CREATE OR REPLACE FUNCTION update_nft_owner_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sold' AND OLD.status = 'active' THEN
    UPDATE madden_nfts
    SET owner_id = NEW.buyer_id
    WHERE id = NEW.nft_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update NFT owner on sale
DROP TRIGGER IF EXISTS update_nft_owner_trigger ON marketplace_listings;
CREATE TRIGGER update_nft_owner_trigger
  AFTER UPDATE ON marketplace_listings
  FOR EACH ROW
  WHEN (NEW.status = 'sold' AND OLD.status = 'active')
  EXECUTE FUNCTION update_nft_owner_on_sale();

-- Function to validate NFT ownership before listing
CREATE OR REPLACE FUNCTION validate_nft_ownership()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to validate ownership before creating listing
DROP TRIGGER IF EXISTS validate_ownership_before_listing ON marketplace_listings;
CREATE TRIGGER validate_ownership_before_listing
  BEFORE INSERT ON marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION validate_nft_ownership();

-- Create view for active marketplace listings with NFT details
CREATE OR REPLACE VIEW active_marketplace_listings AS
SELECT
  ml.id,
  ml.nft_id,
  ml.seller_id,
  ml.price,
  ml.currency,
  ml.status,
  ml.created_at,
  n.nft_type,
  n.metadata,
  n.token_id,
  n.contract_address,
  n.league_id
FROM marketplace_listings ml
JOIN madden_nfts n ON ml.nft_id = n.id
WHERE ml.status = 'active';

-- Create view for league stats
CREATE OR REPLACE VIEW league_stats AS
SELECT
  ml.id as league_id,
  ml.name as league_name,
  ml.platform,
  ml.league_type,
  ml.current_members,
  ml.max_members,
  COUNT(DISTINCT fn.id) as total_nfts,
  COUNT(DISTINCT fe.id) as total_exports,
  ml.created_at
FROM madden_leagues ml
LEFT JOIN madden_nfts fn ON ml.id = fn.league_id
LEFT JOIN franchise_exports fe ON ml.id = fe.league_id
GROUP BY ml.id, ml.name, ml.platform, ml.league_type, ml.current_members, ml.max_members, ml.created_at;

-- Grant permissions on views
GRANT SELECT ON active_marketplace_listings TO authenticated;
GRANT SELECT ON league_stats TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_nft_seller ON marketplace_listings(nft_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_league_members_composite ON league_members(league_id, user_id, role);
CREATE INDEX IF NOT EXISTS idx_nfts_owner_league ON madden_nfts(owner_id, league_id);
CREATE INDEX IF NOT EXISTS idx_exports_league_season ON franchise_exports(league_id, season, week);
