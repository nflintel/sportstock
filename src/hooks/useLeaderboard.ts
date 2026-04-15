import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  league_id: string | null;
  category: string;
  score: number;
  rank: number | null;
  period: string;
  metadata: any;
  updated_at: string;
}

export type LeaderboardCategory = 'wins' | 'portfolio_value' | 'nft_count' | 'trade_volume';
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

export const useLeaderboard = (
  category: LeaderboardCategory = 'wins',
  period: LeaderboardPeriod = 'all_time',
  leagueId?: string
) => {
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['leaderboard', category, period, leagueId],
    queryFn: async () => {
      let query = supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('category', category)
        .eq('period', period)
        .order('score', { ascending: false })
        .limit(100);

      if (leagueId) {
        query = query.eq('league_id', leagueId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });

  const { data: globalWinsLeaderboard, isLoading: loadingGlobalWins } = useQuery({
    queryKey: ['leaderboard-global-wins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('league_members')
        .select(`
          user_id,
          wins,
          losses,
          league_id,
          profiles!inner(username, display_name, avatar_url)
        `)
        .order('wins', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((item: any, index: number) => ({
        rank: index + 1,
        user_id: item.user_id,
        username: item.profiles?.username || 'Unknown',
        display_name: item.profiles?.display_name || item.profiles?.username || 'Unknown',
        avatar_url: item.profiles?.avatar_url,
        league_id: item.league_id,
        wins: item.wins,
        losses: item.losses,
        win_pct: (item.wins + item.losses) > 0
          ? Math.round((item.wins / (item.wins + item.losses)) * 100)
          : 0,
      }));
    },
  });

  const { data: portfolioLeaderboard, isLoading: loadingPortfolio } = useQuery({
    queryKey: ['leaderboard-portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select(`
          user_id,
          balance,
          profiles!inner(username, display_name, avatar_url)
        `)
        .order('balance', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((item: any, index: number) => ({
        rank: index + 1,
        user_id: item.user_id,
        username: item.profiles?.username || 'Unknown',
        display_name: item.profiles?.display_name || item.profiles?.username || 'Unknown',
        avatar_url: item.profiles?.avatar_url,
        balance: item.balance,
      }));
    },
  });

  const { data: nftLeaderboard, isLoading: loadingNFT } = useQuery({
    queryKey: ['leaderboard-nft'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('madden_nfts')
        .select('owner_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const countMap = new Map<string, number>();
      (data || []).forEach((nft: any) => {
        countMap.set(nft.owner_id, (countMap.get(nft.owner_id) || 0) + 1);
      });

      const sorted = Array.from(countMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

      if (sorted.length === 0) return [];

      const userIds = sorted.map(([uid]) => uid);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      return sorted.map(([uid, count], index) => {
        const profile = profileMap.get(uid) as any;
        return {
          rank: index + 1,
          user_id: uid,
          username: profile?.username || 'Unknown',
          display_name: profile?.display_name || profile?.username || 'Unknown',
          avatar_url: profile?.avatar_url,
          nft_count: count,
        };
      });
    },
  });

  const refreshLeaderboard = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('refresh_wins_leaderboard' as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });

  return {
    entries,
    isLoading,
    globalWinsLeaderboard,
    loadingGlobalWins,
    portfolioLeaderboard,
    loadingPortfolio,
    nftLeaderboard,
    loadingNFT,
    refreshLeaderboard,
  };
};
