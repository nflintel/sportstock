/*
  # Advanced Trading Features

  This migration adds three advanced trading systems:

  ## 1. Athlete Packs (Fantasy Bundles)
  - `athlete_pack_templates`: defines pack tiers (Starter, Pro, Championship)
    with pricing, share counts, and player tier weights
  - `athlete_packs`: tracks purchased packs per user (sealed or opened)
  - `pack_contents`: records each share item revealed when a pack is opened

  ## 2. Stop-Loss & Limit Orders
  - `trade_orders`: stores user-defined automated orders
    - Types: limit_buy, limit_sell, stop_loss, take_profit
    - Statuses: pending, filled, cancelled, expired
    - Includes trigger price, share amount, and expiry

  ## 3. Fractional NFT Ownership
  - `fractional_nft_pools`: an NFT fractionalized into N total shares
    at a per-share price; tracks pool status and total raised
  - `fractional_nft_shares`: ownership records per user per pool

  ## Security
  - RLS enabled on all tables with appropriate per-user policies
  - DB functions for opening packs and buying fractional shares atomically
*/

-- =============================================
-- PART 1: ATHLETE PACKS
-- =============================================

CREATE TABLE IF NOT EXISTS athlete_pack_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  tier text NOT NULL DEFAULT 'starter',
  price numeric NOT NULL DEFAULT 9.99,
  share_count integer NOT NULL DEFAULT 5,
  guaranteed_rare boolean DEFAULT false,
  image_color text DEFAULT 'blue',
  contents_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE athlete_pack_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pack templates viewable by authenticated users"
  ON athlete_pack_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS athlete_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES athlete_pack_templates(id) ON DELETE SET NULL,
  template_name text NOT NULL,
  tier text NOT NULL DEFAULT 'starter',
  price_paid numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'sealed',
  opened_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE athlete_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own packs"
  ON athlete_packs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own packs"
  ON athlete_packs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own packs"
  ON athlete_packs FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_athlete_packs_user ON athlete_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_athlete_packs_status ON athlete_packs(status);

CREATE TABLE IF NOT EXISTS pack_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid REFERENCES athlete_packs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  player_name text NOT NULL,
  player_initials text,
  player_team text,
  shares_awarded integer NOT NULL DEFAULT 1,
  share_price numeric NOT NULL DEFAULT 0,
  is_rare boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pack_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pack contents"
  ON pack_contents FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own pack contents"
  ON pack_contents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_pack_contents_pack ON pack_contents(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_contents_user ON pack_contents(user_id);

-- Seed pack templates
INSERT INTO athlete_pack_templates (name, description, tier, price, share_count, guaranteed_rare, image_color, contents_config)
VALUES
  (
    'Starter Pack',
    'A great way to begin. Contains 5 random athlete shares from across all sports.',
    'starter',
    9.99,
    5,
    false,
    'blue',
    '{"min_shares": 1, "max_shares": 3, "rare_chance": 0.10}'::jsonb
  ),
  (
    'Pro Pack',
    'Higher potential picks with 8 shares and a guaranteed uncommon athlete.',
    'pro',
    24.99,
    8,
    false,
    'emerald',
    '{"min_shares": 2, "max_shares": 5, "rare_chance": 0.25}'::jsonb
  ),
  (
    'Championship Pack',
    'Elite tier pack with 12 shares, guaranteed rare, and a chance at legendary athletes.',
    'championship',
    49.99,
    12,
    true,
    'yellow',
    '{"min_shares": 3, "max_shares": 8, "rare_chance": 0.50}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Function to purchase and open a pack atomically
CREATE OR REPLACE FUNCTION open_athlete_pack(p_template_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_template athlete_pack_templates;
  v_wallet wallets;
  v_pack athlete_packs;
  v_players players[];
  v_player players;
  v_player_ids uuid[];
  v_contents jsonb := '[]'::jsonb;
  v_item jsonb;
  v_shares integer;
  v_is_rare boolean;
  v_rare_threshold numeric;
  v_i integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO v_template FROM athlete_pack_templates WHERE id = p_template_id AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pack template not found'; END IF;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF v_wallet.balance < v_template.price THEN
    RAISE EXCEPTION 'Insufficient balance. Need $% but have $%', v_template.price, v_wallet.balance;
  END IF;

  UPDATE wallets SET balance = balance - v_template.price, updated_at = now()
  WHERE user_id = v_user_id;

  INSERT INTO athlete_packs (user_id, template_id, template_name, tier, price_paid, status, opened_at)
  VALUES (v_user_id, p_template_id, v_template.name, v_template.tier, v_template.price, 'opened', now())
  RETURNING * INTO v_pack;

  SELECT ARRAY_AGG(p) INTO v_players FROM (
    SELECT * FROM players ORDER BY random() LIMIT (v_template.share_count * 3)
  ) p;

  v_rare_threshold := (v_template.contents_config->>'rare_chance')::numeric;

  FOR v_i IN 1..v_template.share_count LOOP
    v_player := v_players[v_i];
    IF v_player IS NULL THEN CONTINUE; END IF;

    v_shares := floor(random() *
      ((v_template.contents_config->>'max_shares')::int - (v_template.contents_config->>'min_shares')::int + 1)
      + (v_template.contents_config->>'min_shares')::int);

    v_is_rare := (random() < v_rare_threshold) OR (v_template.guaranteed_rare AND v_i = 1);

    IF v_is_rare THEN v_shares := v_shares + 2; END IF;

    INSERT INTO pack_contents (pack_id, user_id, player_id, player_name, player_initials, player_team, shares_awarded, share_price, is_rare)
    VALUES (v_pack.id, v_user_id, v_player.id, v_player.name, v_player.initials, v_player.team, v_shares, v_player.price, v_is_rare);

    INSERT INTO holdings (user_id, player_id, shares, avg_buy_price)
    VALUES (v_user_id, v_player.id, v_shares, v_player.price)
    ON CONFLICT (user_id, player_id)
    DO UPDATE SET
      avg_buy_price = (holdings.avg_buy_price * holdings.shares + v_player.price * v_shares) / (holdings.shares + v_shares),
      shares = holdings.shares + v_shares,
      updated_at = now();

    INSERT INTO trades (user_id, player_id, trade_type, shares, price_per_share, total, fee)
    VALUES (v_user_id, v_player.id, 'buy', v_shares, v_player.price, v_shares * v_player.price, 0);

    v_item := jsonb_build_object(
      'player_id', v_player.id,
      'player_name', v_player.name,
      'player_initials', v_player.initials,
      'player_team', v_player.team,
      'shares', v_shares,
      'price', v_player.price,
      'is_rare', v_is_rare
    );
    v_contents := v_contents || v_item;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'pack_id', v_pack.id, 'contents', v_contents, 'cost', v_template.price);
END;
$$;

-- =============================================
-- PART 2: STOP-LOSS & LIMIT ORDERS
-- =============================================

CREATE TABLE IF NOT EXISTS trade_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  player_name text NOT NULL,
  order_type text NOT NULL,
  shares integer NOT NULL,
  trigger_price numeric NOT NULL,
  current_price_at_creation numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  filled_at timestamptz,
  filled_price numeric,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trade_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON trade_orders FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create their own orders"
  ON trade_orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own orders"
  ON trade_orders FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own orders"
  ON trade_orders FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_trade_orders_user ON trade_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_orders_player ON trade_orders(player_id);
CREATE INDEX IF NOT EXISTS idx_trade_orders_status ON trade_orders(status);
CREATE INDEX IF NOT EXISTS idx_trade_orders_type ON trade_orders(order_type);

-- =============================================
-- PART 3: FRACTIONAL NFT OWNERSHIP
-- =============================================

CREATE TABLE IF NOT EXISTS fractional_nft_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id uuid REFERENCES madden_nfts(id) ON DELETE CASCADE NOT NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  total_shares integer NOT NULL DEFAULT 100,
  shares_available integer NOT NULL DEFAULT 100,
  price_per_share numeric NOT NULL DEFAULT 1.00,
  total_raised numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  min_shares_per_user integer DEFAULT 1,
  max_shares_per_user integer DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE fractional_nft_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fractional pools viewable by all authenticated users"
  ON fractional_nft_pools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators can insert fractional pools"
  ON fractional_nft_pools FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "Creators can update their own pools"
  ON fractional_nft_pools FOR UPDATE
  TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_fractional_pools_nft ON fractional_nft_pools(nft_id);
CREATE INDEX IF NOT EXISTS idx_fractional_pools_creator ON fractional_nft_pools(creator_id);
CREATE INDEX IF NOT EXISTS idx_fractional_pools_status ON fractional_nft_pools(status);

CREATE TABLE IF NOT EXISTS fractional_nft_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES fractional_nft_pools(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shares_owned integer NOT NULL DEFAULT 0,
  total_invested numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pool_id, user_id)
);

ALTER TABLE fractional_nft_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fractional shares"
  ON fractional_nft_shares FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own fractional shares"
  ON fractional_nft_shares FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own fractional shares"
  ON fractional_nft_shares FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_fractional_shares_pool ON fractional_nft_shares(pool_id);
CREATE INDEX IF NOT EXISTS idx_fractional_shares_user ON fractional_nft_shares(user_id);

-- Function to buy fractional NFT shares atomically
CREATE OR REPLACE FUNCTION buy_fractional_shares(
  p_pool_id uuid,
  p_shares integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_pool fractional_nft_pools;
  v_wallet wallets;
  v_total_cost numeric;
  v_existing_shares fractional_nft_shares;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO v_pool FROM fractional_nft_pools WHERE id = p_pool_id AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pool not found or not active'; END IF;

  IF p_shares < v_pool.min_shares_per_user THEN
    RAISE EXCEPTION 'Minimum purchase is % shares', v_pool.min_shares_per_user;
  END IF;

  SELECT * INTO v_existing_shares FROM fractional_nft_shares
  WHERE pool_id = p_pool_id AND user_id = v_user_id;

  IF FOUND AND (v_existing_shares.shares_owned + p_shares) > v_pool.max_shares_per_user THEN
    RAISE EXCEPTION 'Maximum % shares per user. You own %, trying to buy %.',
      v_pool.max_shares_per_user, v_existing_shares.shares_owned, p_shares;
  END IF;

  IF p_shares > v_pool.shares_available THEN
    RAISE EXCEPTION 'Only % shares available', v_pool.shares_available;
  END IF;

  v_total_cost := p_shares * v_pool.price_per_share;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF v_wallet.balance < v_total_cost THEN
    RAISE EXCEPTION 'Insufficient balance. Need $% but have $%', v_total_cost, v_wallet.balance;
  END IF;

  UPDATE wallets SET balance = balance - v_total_cost, updated_at = now()
  WHERE user_id = v_user_id;

  INSERT INTO fractional_nft_shares (pool_id, user_id, shares_owned, total_invested)
  VALUES (p_pool_id, v_user_id, p_shares, v_total_cost)
  ON CONFLICT (pool_id, user_id)
  DO UPDATE SET
    shares_owned = fractional_nft_shares.shares_owned + p_shares,
    total_invested = fractional_nft_shares.total_invested + v_total_cost,
    updated_at = now();

  UPDATE fractional_nft_pools
  SET shares_available = shares_available - p_shares,
      total_raised = total_raised + v_total_cost,
      status = CASE WHEN shares_available - p_shares = 0 THEN 'sold_out' ELSE status END,
      updated_at = now()
  WHERE id = p_pool_id;

  RETURN jsonb_build_object(
    'success', true,
    'shares_bought', p_shares,
    'cost', v_total_cost,
    'price_per_share', v_pool.price_per_share
  );
END;
$$;
