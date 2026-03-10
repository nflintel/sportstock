import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MintRequest {
  nft_type: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
  };
  league_id?: string;
  wallet_address?: string;
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

    const mintData: MintRequest = await req.json();

    const tokenId = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
    const contractAddress = Deno.env.get("NFT_CONTRACT_ADDRESS") || "0x0000000000000000000000000000000000000000";
    const mintTransaction = `0x${Math.random().toString(16).slice(2)}`;

    const { data: nft, error: nftError } = await supabaseClient
      .from("madden_nfts")
      .insert({
        owner_id: user.id,
        nft_type: mintData.nft_type,
        metadata: mintData.metadata,
        league_id: mintData.league_id || null,
        token_id: tokenId,
        contract_address: contractAddress,
        mint_transaction: mintTransaction,
        is_tradeable: true,
        price: 0,
      })
      .select()
      .single();

    if (nftError) {
      throw nftError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        nft,
        blockchain: {
          token_id: tokenId,
          contract_address: contractAddress,
          transaction_hash: mintTransaction,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error minting NFT:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to mint NFT" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
