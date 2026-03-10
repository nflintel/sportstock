import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MaddenLeague {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  is_public: boolean;
  league_type: string;
  platform: string;
  max_members: number;
  current_members: number;
  franchise_data: any;
  settings: any;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeagueData {
  name: string;
  description?: string;
  is_public: boolean;
  league_type: string;
  platform: string;
  max_members?: number;
  settings?: any;
  image_url?: string;
}

export const useMaddenLeagues = () => {
  const queryClient = useQueryClient();

  const { data: publicLeagues, isLoading: loadingPublic } = useQuery({
    queryKey: ['madden-leagues', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('madden_leagues')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MaddenLeague[];
    },
  });

  const { data: myLeagues, isLoading: loadingMy } = useQuery({
    queryKey: ['madden-leagues', 'my'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('madden_leagues')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MaddenLeague[];
    },
  });

  const createLeague = useMutation({
    mutationFn: async (leagueData: CreateLeagueData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to create league');

      const { data, error } = await supabase
        .from('madden_leagues')
        .insert({
          ...leagueData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('league_members').insert({
        league_id: data.id,
        user_id: user.id,
        role: 'owner',
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['madden-leagues'] });
    },
  });

  const updateLeague = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaddenLeague> }) => {
      const { data, error } = await supabase
        .from('madden_leagues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['madden-leagues'] });
    },
  });

  const deleteLeague = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('madden_leagues')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['madden-leagues'] });
    },
  });

  return {
    publicLeagues,
    myLeagues,
    loadingPublic,
    loadingMy,
    createLeague,
    updateLeague,
    deleteLeague,
  };
};

export const useLeagueMembers = (leagueId: string) => {
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ['league-members', leagueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('league_members')
        .select('*')
        .eq('league_id', leagueId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!leagueId,
  });

  const joinLeague = useMutation({
    mutationFn: async ({ leagueId, teamName }: { leagueId: string; teamName?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('league_members')
        .insert({
          league_id: leagueId,
          user_id: user.id,
          team_name: teamName,
          role: 'member',
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.rpc('increment', {
        table_name: 'madden_leagues',
        row_id: leagueId,
        column_name: 'current_members',
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['league-members'] });
      queryClient.invalidateQueries({ queryKey: ['madden-leagues'] });
    },
  });

  const leaveLeague = useMutation({
    mutationFn: async (leagueId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('league_members')
        .delete()
        .eq('league_id', leagueId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['league-members'] });
      queryClient.invalidateQueries({ queryKey: ['madden-leagues'] });
    },
  });

  return {
    members,
    isLoading,
    joinLeague,
    leaveLeague,
  };
};
