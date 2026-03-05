
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ PLAYERS ============
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'NBA',
  initials TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 1.00,
  change_24h NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  avatar_url TEXT,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players are viewable by everyone" ON public.players FOR SELECT USING (true);
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ WALLETS ============
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 500.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  followers_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + wallet on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 500.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ HOLDINGS ============
CREATE TABLE public.holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  shares INTEGER NOT NULL DEFAULT 0,
  avg_buy_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, player_id)
);

ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own holdings" ON public.holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own holdings" ON public.holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own holdings" ON public.holdings FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON public.holdings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TRADES ============
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  shares INTEGER NOT NULL,
  price_per_share NUMERIC(10,2) NOT NULL,
  fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own trades" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ FOLLOWS ============
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- ============ TRADE EXECUTION FUNCTION ============
CREATE OR REPLACE FUNCTION public.execute_trade(
  p_player_id UUID,
  p_trade_type TEXT,
  p_shares INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_player_price NUMERIC(10,2);
  v_subtotal NUMERIC(10,2);
  v_fee NUMERIC(10,2);
  v_total NUMERIC(10,2);
  v_wallet_balance NUMERIC(12,2);
  v_current_shares INTEGER;
  v_current_avg_price NUMERIC(10,2);
  v_new_avg_price NUMERIC(10,2);
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT price INTO v_player_price FROM players WHERE id = p_player_id;
  IF v_player_price IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Player not found');
  END IF;

  v_subtotal := p_shares * v_player_price;
  v_fee := ROUND(v_subtotal * 0.025, 2);
  v_total := v_subtotal + v_fee;

  IF p_trade_type = 'buy' THEN
    SELECT balance INTO v_wallet_balance FROM wallets WHERE user_id = v_user_id;
    IF v_wallet_balance < v_total THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
    END IF;

    UPDATE wallets SET balance = balance - v_total WHERE user_id = v_user_id;

    SELECT shares, avg_buy_price INTO v_current_shares, v_current_avg_price
    FROM holdings WHERE user_id = v_user_id AND player_id = p_player_id;

    IF v_current_shares IS NOT NULL THEN
      v_new_avg_price := ROUND(((v_current_shares * v_current_avg_price) + (p_shares * v_player_price)) / (v_current_shares + p_shares), 2);
      UPDATE holdings SET shares = shares + p_shares, avg_buy_price = v_new_avg_price
      WHERE user_id = v_user_id AND player_id = p_player_id;
    ELSE
      INSERT INTO holdings (user_id, player_id, shares, avg_buy_price)
      VALUES (v_user_id, p_player_id, p_shares, v_player_price);
    END IF;

  ELSIF p_trade_type = 'sell' THEN
    SELECT shares INTO v_current_shares FROM holdings WHERE user_id = v_user_id AND player_id = p_player_id;
    IF v_current_shares IS NULL OR v_current_shares < p_shares THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient shares');
    END IF;

    UPDATE wallets SET balance = balance + v_subtotal - v_fee WHERE user_id = v_user_id;
    UPDATE holdings SET shares = shares - p_shares WHERE user_id = v_user_id AND player_id = p_player_id;
    DELETE FROM holdings WHERE user_id = v_user_id AND player_id = p_player_id AND shares = 0;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid trade type');
  END IF;

  INSERT INTO trades (user_id, player_id, trade_type, shares, price_per_share, fee, total)
  VALUES (v_user_id, p_player_id, p_trade_type, p_shares, v_player_price, v_fee, v_total);

  RETURN jsonb_build_object('success', true, 'total', v_total, 'fee', v_fee, 'price', v_player_price);
END;
$$;
