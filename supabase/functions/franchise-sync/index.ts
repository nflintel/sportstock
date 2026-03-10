import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FranchiseSyncRequest {
  league_id: string;
  franchise_data: {
    teams: Array<{
      id: string;
      name: string;
      wins: number;
      losses: number;
      ties: number;
      roster?: any[];
    }>;
    standings?: any;
    schedule?: any[];
    stats?: any;
  };
  version: string;
  season: number;
  week: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const syncData: FranchiseSyncRequest = await req.json();

    const { data: member } = await supabaseClient
      .from("league_members")
      .select("*")
      .eq("league_id", syncData.league_id)
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return new Response(
        JSON.stringify({ error: "You must be a member of this league" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: exportRecord, error: exportError } = await supabaseClient
      .from("franchise_exports")
      .insert({
        league_id: syncData.league_id,
        user_id: user.id,
        export_data: syncData.franchise_data,
        version: syncData.version,
        season: syncData.season,
        week: syncData.week,
      })
      .select()
      .single();

    if (exportError) throw exportError;

    const { data: league, error: leagueError } = await supabaseClient
      .from("madden_leagues")
      .update({
        franchise_data: syncData.franchise_data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", syncData.league_id)
      .select()
      .single();

    if (leagueError) throw leagueError;

    if (syncData.franchise_data.teams) {
      for (const team of syncData.franchise_data.teams) {
        await supabaseClient
          .from("league_members")
          .update({
            wins: team.wins,
            losses: team.losses,
          })
          .eq("league_id", syncData.league_id)
          .eq("team_name", team.name);
      }
    }

    const { data: standings } = await supabaseClient.rpc("get_league_standings", {
      p_league_id: syncData.league_id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        export: exportRecord,
        league,
        standings: standings || [],
        message: "Franchise data synced successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Franchise sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to sync franchise data" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
