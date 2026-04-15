import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FractionalPool {
  id: string;
  nft_id: string;
  creator_id: string;
  name: string;
  description: string | null;
  total_shares: number;
  shares_available: number;
  price_per_share: number;
  total_raised: number;
  status: string;
  min_shares_per_user: number;
  max_shares_per_user: number;
  created_at: string;
  updated_at: string;
  nft?: any;
  creator?: any;
  user_shares?: number;
}

export interface FractionalShare {
  id: string;
  pool_id: string;
  user_id: string;
  shares_owned: number;
  total_invested: number;
  created_at: string;
  updated_at: string;
  pool?: FractionalPool;
}

export interface CreatePoolData {
  nft_id: string;
  name: string;
  description?: string;
  total_shares: number;
  price_per_share: number;
  min_shares_per_user?: number;
  max_shares_per_user?: number;
}

export const useFractionalNFT = () => {
  const queryClient = useQueryClient();

  const { data: pools, isLoading: loadingPools } = useQuery({
    queryKey: ['fractional-pools'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('fractional_nft_pools')
        .select(`
          *,
          nft:madden_nfts(id, nft_type, metadata, rarity, level)
        `)
        .in('status', ['active', 'sold_out'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!user || !data) return (data || []) as FractionalPool[];

      const { data: myShares } = await supabase
        .from('fractional_nft_shares')
        .select('pool_id, shares_owned')
        .eq('user_id', user.id);

      const sharesMap = new Map((myShares || []).map((s: any) => [s.pool_id, s.shares_owned]));

      return (data || []).map((pool: any) => ({
        ...pool,
        user_shares: sharesMap.get(pool.id) || 0,
      })) as FractionalPool[];
    },
  });

  const { data: myShares, isLoading: loadingMyShares } = useQuery({
    queryKey: ['my-fractional-shares'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('fractional_nft_shares')
        .select(`
          *,
          pool:fractional_nft_pools(
            *,
            nft:madden_nfts(id, nft_type, metadata, rarity, level)
          )
        `)
        .eq('user_id', user.id)
        .gt('shares_owned', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FractionalShare[];
    },
  });

  const createPool = useMutation({
    mutationFn: async (poolData: CreatePoolData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('fractional_nft_pools')
        .insert({
          nft_id: poolData.nft_id,
          creator_id: user.id,
          name: poolData.name,
          description: poolData.description || null,
          total_shares: poolData.total_shares,
          shares_available: poolData.total_shares,
          price_per_share: poolData.price_per_share,
          min_shares_per_user: poolData.min_shares_per_user || 1,
          max_shares_per_user: poolData.max_shares_per_user || Math.floor(poolData.total_shares / 2),
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fractional-pools'] });
    },
  });

  const buyShares = useMutation({
    mutationFn: async ({ poolId, shares }: { poolId: string; shares: number }) => {
      const { data, error } = await supabase.rpc('buy_fractional_shares' as any, {
        p_pool_id: poolId,
        p_shares: shares,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fractional-pools'] });
      queryClient.invalidateQueries({ queryKey: ['my-fractional-shares'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  const activePools = (pools || []).filter(p => p.status === 'active');
  const soldOutPools = (pools || []).filter(p => p.status === 'sold_out');

  return {
    pools,
    activePools,
    soldOutPools,
    myShares,
    loadingPools,
    loadingMyShares,
    createPool,
    buyShares,
  };
};
