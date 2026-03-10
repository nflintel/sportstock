import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FranchiseExport {
  id: string;
  league_id: string;
  user_id: string;
  export_data: any;
  file_url?: string;
  version: string;
  season: number;
  week: number;
  created_at: string;
}

export interface ExportFranchiseData {
  league_id: string;
  export_data: {
    teams: Array<{
      id: string;
      name: string;
      wins: number;
      losses: number;
      ties: number;
      roster: any[];
    }>;
    standings: any;
    schedule: any[];
    stats: any;
  };
  version: string;
  season: number;
  week: number;
}

export const useFranchiseExport = (leagueId?: string) => {
  const queryClient = useQueryClient();

  const { data: exports, isLoading } = useQuery({
    queryKey: ['franchise-exports', leagueId],
    queryFn: async () => {
      if (!leagueId) return [];

      const { data, error } = await supabase
        .from('franchise_exports')
        .select('*')
        .eq('league_id', leagueId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FranchiseExport[];
    },
    enabled: !!leagueId,
  });

  const exportFranchise = useMutation({
    mutationFn: async (exportData: ExportFranchiseData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const jsonData = JSON.stringify(exportData.export_data);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const fileName = `madden-franchise-${exportData.league_id}-${Date.now()}.json`;

      const { error: uploadError } = await supabase.storage
        .from('franchise-exports')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('franchise-exports')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('franchise_exports')
        .insert({
          league_id: exportData.league_id,
          user_id: user.id,
          export_data: exportData.export_data,
          file_url: publicUrl,
          version: exportData.version,
          season: exportData.season,
          week: exportData.week,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('madden_leagues')
        .update({
          franchise_data: exportData.export_data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', exportData.league_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-exports'] });
      queryClient.invalidateQueries({ queryKey: ['madden-leagues'] });
    },
  });

  const importFranchise = useMutation({
    mutationFn: async ({ leagueId, file }: { leagueId: string; file: File }) => {
      const text = await file.text();
      const franchiseData = JSON.parse(text);

      const { data, error } = await supabase
        .from('madden_leagues')
        .update({
          franchise_data: franchiseData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leagueId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['madden-leagues'] });
    },
  });

  const deleteExport = useMutation({
    mutationFn: async (exportId: string) => {
      const { data: exportData } = await supabase
        .from('franchise_exports')
        .select('file_url')
        .eq('id', exportId)
        .single();

      if (exportData?.file_url) {
        const fileName = exportData.file_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('franchise-exports')
            .remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('franchise_exports')
        .delete()
        .eq('id', exportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-exports'] });
    },
  });

  const downloadExport = async (exportData: FranchiseExport) => {
    const jsonString = JSON.stringify(exportData.export_data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `madden-franchise-${exportData.league_id}-week${exportData.week}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    exports,
    isLoading,
    exportFranchise,
    importFranchise,
    deleteExport,
    downloadExport,
  };
};
