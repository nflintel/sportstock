import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PackTemplate {
  id: string;
  name: string;
  description: string | null;
  tier: string;
  price: number;
  share_count: number;
  guaranteed_rare: boolean;
  image_color: string;
  contents_config: any;
  is_active: boolean;
  created_at: string;
}

export interface AthletePack {
  id: string;
  user_id: string;
  template_id: string | null;
  template_name: string;
  tier: string;
  price_paid: number;
  status: string;
  opened_at: string | null;
  created_at: string;
}

export interface PackContent {
  id: string;
  pack_id: string;
  player_id: string | null;
  player_name: string;
  player_initials: string | null;
  player_team: string | null;
  shares_awarded: number;
  share_price: number;
  is_rare: boolean;
  created_at: string;
}

export interface OpenPackResult {
  success: boolean;
  pack_id: string;
  contents: PackContent[];
  cost: number;
}

export const useAthletePacks = () => {
  const queryClient = useQueryClient();

  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['pack-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('athlete_pack_templates')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      if (error) throw error;
      return data as PackTemplate[];
    },
  });

  const { data: myPacks, isLoading: loadingMyPacks } = useQuery({
    queryKey: ['my-packs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('athlete_packs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AthletePack[];
    },
  });

  const { data: packHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['pack-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('athlete_packs')
        .select(`
          *,
          contents:pack_contents(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'opened')
        .order('opened_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const openPack = useMutation({
    mutationFn: async (templateId: string): Promise<OpenPackResult> => {
      const { data, error } = await supabase.rpc('open_athlete_pack' as any, {
        p_template_id: templateId,
      });
      if (error) throw error;
      return data as OpenPackResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-packs'] });
      queryClient.invalidateQueries({ queryKey: ['pack-history'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['my-holdings'] });
      queryClient.invalidateQueries({ queryKey: ['my-trades-full'] });
    },
  });

  const sealedPacks = (myPacks || []).filter(p => p.status === 'sealed');
  const openedPacks = (myPacks || []).filter(p => p.status === 'opened');

  return {
    templates,
    myPacks,
    sealedPacks,
    openedPacks,
    packHistory,
    loadingTemplates,
    loadingMyPacks,
    loadingHistory,
    openPack,
  };
};
