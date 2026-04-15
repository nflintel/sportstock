import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string | null;
  proposer_id: string;
  league_id: string | null;
  proposal_type: string;
  status: string;
  votes_for: number;
  votes_against: number;
  total_votes: number;
  required_votes: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  proposer?: {
    username: string | null;
    display_name: string | null;
  };
  user_vote?: string | null;
}

export interface GovernanceVote {
  id: string;
  proposal_id: string;
  voter_id: string;
  vote: string;
  voting_power: number;
  created_at: string;
}

export interface CreateProposalData {
  title: string;
  description: string;
  proposal_type: string;
  league_id?: string;
  required_votes?: number;
}

export const useGovernance = (leagueId?: string) => {
  const queryClient = useQueryClient();

  const { data: proposals, isLoading: loadingProposals } = useQuery({
    queryKey: ['governance-proposals', leagueId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('governance_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (leagueId) {
        query = query.eq('league_id', leagueId);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) return [];

      const proposerIds = [...new Set(data.map((p: any) => p.proposer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .in('user_id', proposerIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      let voteMap = new Map<string, string>();
      if (user) {
        const { data: votes } = await supabase
          .from('governance_votes')
          .select('proposal_id, vote')
          .eq('voter_id', user.id)
          .in('proposal_id', data.map((p: any) => p.id));

        (votes || []).forEach((v: any) => voteMap.set(v.proposal_id, v.vote));
      }

      return data.map((proposal: any) => ({
        ...proposal,
        proposer: profileMap.get(proposal.proposer_id) || null,
        user_vote: voteMap.get(proposal.id) || null,
      })) as GovernanceProposal[];
    },
  });

  const { data: myProposals, isLoading: loadingMyProposals } = useQuery({
    queryKey: ['governance-proposals-mine'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('governance_proposals')
        .select('*')
        .eq('proposer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GovernanceProposal[];
    },
  });

  const { data: commissionerNFTs } = useQuery({
    queryKey: ['commissioner-nfts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('madden_nfts')
        .select('*')
        .eq('owner_id', user.id)
        .eq('nft_type', 'commissioner');

      if (error) throw error;
      return data || [];
    },
  });

  const createProposal = useMutation({
    mutationFn: async (proposalData: CreateProposalData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('governance_proposals')
        .insert({
          title: proposalData.title,
          description: proposalData.description,
          proposal_type: proposalData.proposal_type,
          league_id: proposalData.league_id || null,
          proposer_id: user.id,
          required_votes: proposalData.required_votes || 5,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['governance-proposals-mine'] });
    },
  });

  const castVote = useMutation({
    mutationFn: async ({ proposalId, vote }: { proposalId: string; vote: 'for' | 'against' }) => {
      const isCommissioner = (commissionerNFTs || []).length > 0;
      const votingPower = isCommissioner ? 3 : 1;

      const { data, error } = await supabase.rpc('cast_governance_vote' as any, {
        p_proposal_id: proposalId,
        p_vote: vote,
        p_voting_power: votingPower,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
    },
  });

  const deleteProposal = useMutation({
    mutationFn: async (proposalId: string) => {
      const { error } = await supabase
        .from('governance_proposals')
        .delete()
        .eq('id', proposalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['governance-proposals-mine'] });
    },
  });

  const isCommissioner = (commissionerNFTs || []).length > 0;

  return {
    proposals,
    myProposals,
    loadingProposals,
    loadingMyProposals,
    isCommissioner,
    commissionerNFTs,
    createProposal,
    castVote,
    deleteProposal,
  };
};

export const useNFTEvolution = () => {
  const queryClient = useQueryClient();

  const { data: evolutionHistory, isLoading } = useQuery({
    queryKey: ['nft-evolution-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('nft_evolution_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const awardXP = useMutation({
    mutationFn: async ({ nftId, xpAmount, triggerSource }: {
      nftId: string;
      xpAmount: number;
      triggerSource?: string;
    }) => {
      const { data, error } = await supabase.rpc('award_nft_xp' as any, {
        p_nft_id: nftId,
        p_xp_amount: xpAmount,
        p_trigger_source: triggerSource || 'manual',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['madden-nfts'] });
      queryClient.invalidateQueries({ queryKey: ['nft-evolution-history'] });
    },
  });

  return {
    evolutionHistory,
    isLoading,
    awardXP,
  };
};
