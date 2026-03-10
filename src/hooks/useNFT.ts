import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ethers } from 'ethers';
import { getExplorerUrl } from '@/utils/nftConfig';

export interface MaddenNFT {
  id: string;
  token_id?: string;
  contract_address?: string;
  owner_id: string;
  league_id?: string;
  nft_type: string;
  metadata: any;
  mint_transaction?: string;
  is_tradeable: boolean;
  price: number;
  created_at: string;
}

export interface MintNFTData {
  nft_type: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
  };
  league_id?: string;
}

export const useNFTs = () => {
  const queryClient = useQueryClient();

  const { data: myNFTs, isLoading: loadingMyNFTs } = useQuery({
    queryKey: ['madden-nfts', 'my'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('madden_nfts')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MaddenNFT[];
    },
  });

  const { data: allNFTs, isLoading: loadingAllNFTs } = useQuery({
    queryKey: ['madden-nfts', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('madden_nfts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as MaddenNFT[];
    },
  });

  const mintNFT = useMutation({
    mutationFn: async ({ nftData, walletAddress }: { nftData: MintNFTData; walletAddress?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Must be logged in');

      const response = await supabase.functions.invoke('mint-nft', {
        body: {
          ...nftData,
          wallet_address: walletAddress,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to mint NFT');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['madden-nfts'] });
    },
  });

  const updateNFTPrice = useMutation({
    mutationFn: async ({ nftId, price }: { nftId: string; price: number }) => {
      const { data, error } = await supabase
        .from('madden_nfts')
        .update({ price })
        .eq('id', nftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['madden-nfts'] });
    },
  });

  const transferNFT = useMutation({
    mutationFn: async ({ nftId, newOwnerId }: { nftId: string; newOwnerId: string }) => {
      const { data, error } = await supabase
        .from('madden_nfts')
        .update({ owner_id: newOwnerId })
        .eq('id', nftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['madden-nfts'] });
    },
  });

  return {
    myNFTs,
    allNFTs,
    loadingMyNFTs,
    loadingAllNFTs,
    mintNFT,
    updateNFTPrice,
    transferNFT,
  };
};

export const useMarketplace = () => {
  const queryClient = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          nft:madden_nfts(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createListing = useMutation({
    mutationFn: async ({ nftId, price, currency }: { nftId: string; price: number; currency: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert({
          nft_id: nftId,
          seller_id: user.id,
          price,
          currency,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
    },
  });

  const cancelListing = useMutation({
    mutationFn: async (listingId: string) => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .update({ status: 'cancelled' })
        .eq('id', listingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
    },
  });

  const buyNFT = useMutation({
    mutationFn: async ({ listingId, nftId, sellerId }: { listingId: string; nftId: string; sellerId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const transactionHash = `0x${Math.random().toString(16).slice(2)}`;

      await supabase
        .from('marketplace_listings')
        .update({
          status: 'sold',
          buyer_id: user.id,
          transaction_hash: transactionHash,
          sold_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      const { data, error } = await supabase
        .from('madden_nfts')
        .update({ owner_id: user.id })
        .eq('id', nftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['madden-nfts'] });
    },
  });

  return {
    listings,
    isLoading,
    createListing,
    cancelListing,
    buyNFT,
  };
};
