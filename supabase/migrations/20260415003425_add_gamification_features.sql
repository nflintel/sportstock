/*
  # Gamification & Community Features

  This migration adds three core gamification systems:

  ## 1. NFT Evolution System
  - Adds `level`, `xp`, `rarity`, `evolution_stage` to `madden_nfts`
  - New `nft_evolution_events` table tracks every level-up and XP gain
  - Rarity tiers: common → uncommon → rare → epic → legendary

  ## 2. Global Leaderboards
  - New `leaderboard_entries` table stores computed rankings
  - Supports multiple categories: wins, portfolio_value, nft_count, trade_volume
  - Supports time periods: weekly, monthly, all_time
  - Automated rank calculation via DB function

  ## 3. Governance Token System
  - New `governance_proposals` table for platform and league votes
  - New `governance_votes` table with weighted voting power
  - Commissioner NFT holders get 3x voting power
  - Proposals auto-expire after 7 days; pass/fail tracked

  ## Security
  - RLS enabled on all new tables
  - Optimized with (select auth.uid()) pattern
  - Proposals visible to all authenticated users
  - Votes are immutable once cast (no update policy)
*/

-- =============================================
-- PART 1: NFT Evolution Fields
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'madden_nfts' AND column_name = 'level'
  ) THEN
    ALTER TABLE madden_nfts ADD COLUMN level INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'madden_nfts' AND column_name = 'xp'
  ) THEN
    ALTER TABLE madden_nfts ADD COLUMN xp INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'madden_nfts' AND column_name = 'rarity'
  ) THEN
    ALTER TABLE madden_nfts ADD COLUMN rarity TEXT DEFAULT 'common';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'madden_nfts' AND column_name = 'evolution_stage'
  ) THEN
    ALTER TABLE madden_nfts ADD COLUMN evolution_stage INTEGER DEFAULT 1;
  END IF;
END $$;

-- NFT Evolution Events table
CREATE TABLE IF NOT EXISTS nft_evolution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id uuid REFERENCES madden_nfts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  xp_gained integer DEFAULT 0,
  old_level integer,
  new_level integer,
  old_rarity text,
  new_rarity text,
  trigger_source text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nft_evolution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own evolution events"
  ON nft_evolution_events FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own evolution events"
  ON nft_evolution_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_nft_evolution_events_nft ON nft_evolution_events(nft_id);
CREATE INDEX IF NOT EXISTS idx_nft_evolution_events_user ON nft_evolution_events(user_id);

-- =============================================
-- PART 2: Leaderboard Tables
-- =============================================

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text,
  display_name text,
  avatar_url text,
  league_id uuid REFERENCES madden_leagues(id) ON DELETE CASCADE,
  category text NOT NULL,
  score numeric DEFAULT 0,
  rank integer,
  period text DEFAULT 'all_time',
  metadata jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, period, league_id)
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard entries are viewable by all authenticated users"
  ON leaderboard_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert leaderboard entries"
  ON leaderboard_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "System can update leaderboard entries"
  ON leaderboard_entries FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_leaderboard_category_period ON leaderboard_entries(category, period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_league ON leaderboard_entries(league_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(rank, category, period);

-- =============================================
-- PART 3: Governance Tables
-- =============================================

CREATE TABLE IF NOT EXISTS governance_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  proposer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  league_id uuid REFERENCES madden_leagues(id) ON DELETE CASCADE,
  proposal_type text NOT NULL DEFAULT 'feature',
  status text DEFAULT 'active',
  votes_for integer DEFAULT 0,
  votes_against integer DEFAULT 0,
  total_votes integer DEFAULT 0,
  required_votes integer DEFAULT 5,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proposals are viewable by all authenticated users"
  ON governance_proposals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create proposals"
  ON governance_proposals FOR INSERT
  TO authenticated
  WITH CHECK (proposer_id = (select auth.uid()));

CREATE POLICY "Proposers can update their own proposals"
  ON governance_proposals FOR UPDATE
  TO authenticated
  USING (proposer_id = (select auth.uid()))
  WITH CHECK (proposer_id = (select auth.uid()));

CREATE POLICY "Proposers can delete their proposals"
  ON governance_proposals FOR DELETE
  TO authenticated
  USING (proposer_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_governance_proposals_status ON governance_proposals(status);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_league ON governance_proposals(league_id);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_proposer ON governance_proposals(proposer_id);

-- Governance Votes table
CREATE TABLE IF NOT EXISTS governance_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES governance_proposals(id) ON DELETE CASCADE NOT NULL,
  voter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote text NOT NULL,
  voting_power integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, voter_id)
);

ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are viewable by all authenticated users"
  ON governance_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can cast votes"
  ON governance_votes FOR INSERT
  TO authenticated
  WITH CHECK (voter_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_governance_votes_proposal ON governance_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_governance_votes_voter ON governance_votes(voter_id);

-- =============================================
-- PART 4: Functions for Governance and Evolution
-- =============================================

-- Function to cast a vote and update proposal tallies
CREATE OR REPLACE FUNCTION cast_governance_vote(
  p_proposal_id uuid,
  p_vote text,
  p_voting_power integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_proposal governance_proposals;
  v_existing_vote governance_votes;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_proposal FROM governance_proposals WHERE id = p_proposal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  IF v_proposal.status != 'active' THEN
    RAISE EXCEPTION 'Proposal is no longer active';
  END IF;

  IF v_proposal.expires_at < now() THEN
    UPDATE governance_proposals SET status = 'expired' WHERE id = p_proposal_id;
    RAISE EXCEPTION 'Proposal has expired';
  END IF;

  SELECT * INTO v_existing_vote FROM governance_votes
  WHERE proposal_id = p_proposal_id AND voter_id = v_user_id;

  IF FOUND THEN
    RAISE EXCEPTION 'You have already voted on this proposal';
  END IF;

  INSERT INTO governance_votes (proposal_id, voter_id, vote, voting_power)
  VALUES (p_proposal_id, v_user_id, p_vote, p_voting_power);

  IF p_vote = 'for' THEN
    UPDATE governance_proposals
    SET votes_for = votes_for + p_voting_power,
        total_votes = total_votes + p_voting_power,
        updated_at = now()
    WHERE id = p_proposal_id;
  ELSE
    UPDATE governance_proposals
    SET votes_against = votes_against + p_voting_power,
        total_votes = total_votes + p_voting_power,
        updated_at = now()
    WHERE id = p_proposal_id;
  END IF;

  SELECT * INTO v_proposal FROM governance_proposals WHERE id = p_proposal_id;
  IF v_proposal.votes_for >= v_proposal.required_votes THEN
    UPDATE governance_proposals SET status = 'passed' WHERE id = p_proposal_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'vote', p_vote);
END;
$$;

-- Function to award XP to an NFT and handle level-up logic
CREATE OR REPLACE FUNCTION award_nft_xp(
  p_nft_id uuid,
  p_xp_amount integer,
  p_trigger_source text DEFAULT 'manual'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_nft madden_nfts;
  v_new_xp integer;
  v_new_level integer;
  v_new_rarity text;
  v_leveled_up boolean := false;
  v_rarity_upgraded boolean := false;
  v_xp_per_level integer := 100;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_nft FROM madden_nfts WHERE id = p_nft_id AND owner_id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NFT not found or not owned by user';
  END IF;

  v_new_xp := v_nft.xp + p_xp_amount;
  v_new_level := GREATEST(1, FLOOR(v_new_xp / v_xp_per_level) + 1);

  IF v_new_level > v_nft.level THEN
    v_leveled_up := true;
  END IF;

  v_new_rarity := CASE
    WHEN v_new_level >= 20 THEN 'legendary'
    WHEN v_new_level >= 10 THEN 'epic'
    WHEN v_new_level >= 5 THEN 'rare'
    WHEN v_new_level >= 3 THEN 'uncommon'
    ELSE 'common'
  END;

  IF v_new_rarity != v_nft.rarity THEN
    v_rarity_upgraded := true;
  END IF;

  UPDATE madden_nfts
  SET xp = v_new_xp,
      level = v_new_level,
      rarity = v_new_rarity,
      evolution_stage = CASE
        WHEN v_new_level >= 20 THEN 5
        WHEN v_new_level >= 10 THEN 4
        WHEN v_new_level >= 5 THEN 3
        WHEN v_new_level >= 3 THEN 2
        ELSE 1
      END
  WHERE id = p_nft_id;

  INSERT INTO nft_evolution_events (
    nft_id, user_id, event_type, xp_gained,
    old_level, new_level, old_rarity, new_rarity, trigger_source
  ) VALUES (
    p_nft_id, v_user_id,
    CASE WHEN v_rarity_upgraded THEN 'rarity_upgrade'
         WHEN v_leveled_up THEN 'level_up'
         ELSE 'xp_gained' END,
    p_xp_amount,
    v_nft.level, v_new_level,
    v_nft.rarity, v_new_rarity,
    p_trigger_source
  );

  RETURN jsonb_build_object(
    'success', true,
    'old_level', v_nft.level,
    'new_level', v_new_level,
    'old_rarity', v_nft.rarity,
    'new_rarity', v_new_rarity,
    'leveled_up', v_leveled_up,
    'rarity_upgraded', v_rarity_upgraded,
    'total_xp', v_new_xp
  );
END;
$$;

-- Function to refresh leaderboard entries for win/loss category
CREATE OR REPLACE FUNCTION refresh_wins_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO leaderboard_entries (user_id, username, display_name, league_id, category, score, period, metadata)
  SELECT
    lm.user_id,
    p.username,
    p.display_name,
    lm.league_id,
    'wins',
    lm.wins,
    'all_time',
    jsonb_build_object('losses', lm.losses, 'win_pct',
      CASE WHEN (lm.wins + lm.losses) = 0 THEN 0
           ELSE ROUND((lm.wins::numeric / (lm.wins + lm.losses)) * 100, 1) END)
  FROM league_members lm
  LEFT JOIN profiles p ON p.user_id = lm.user_id
  ON CONFLICT (user_id, category, period, league_id)
  DO UPDATE SET
    score = EXCLUDED.score,
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    metadata = EXCLUDED.metadata,
    updated_at = now();

  UPDATE leaderboard_entries le
  SET rank = sub.rank
  FROM (
    SELECT id,
      RANK() OVER (PARTITION BY category, period ORDER BY score DESC) as rank
    FROM leaderboard_entries
    WHERE category = 'wins'
  ) sub
  WHERE le.id = sub.id;
END;
$$;
