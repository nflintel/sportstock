import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TransactionRequest {
  action: "buy" | "list" | "cancel";
  listing_id?: string;
  nft_id?: string;
  price?: number;
  currency?: string;
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

    const transactionData: TransactionRequest = await req.json();

    let result;

    switch (transactionData.action) {
      case "buy": {
        if (!transactionData.listing_id) {
          throw new Error("listing_id is required for buy action");
        }

        const { data: listing } = await supabaseClient
          .from("marketplace_listings")
          .select("*, nft:madden_nfts(*)")
          .eq("id", transactionData.listing_id)
          .eq("status", "active")
          .single();

        if (!listing) {
          throw new Error("Listing not found or not active");
        }

        if (listing.seller_id === user.id) {
          throw new Error("Cannot buy your own NFT");
        }

        const transactionHash = `0x${Math.random().toString(16).slice(2)}`;

        const { data: updatedListing, error: listingError } = await supabaseClient
          .from("marketplace_listings")
          .update({
            status: "sold",
            buyer_id: user.id,
            transaction_hash: transactionHash,
            sold_at: new Date().toISOString(),
          })
          .eq("id", transactionData.listing_id)
          .select()
          .single();

        if (listingError) throw listingError;

        const { data: updatedNFT, error: nftError } = await supabaseClient
          .from("madden_nfts")
          .update({ owner_id: user.id })
          .eq("id", listing.nft_id)
          .select()
          .single();

        if (nftError) throw nftError;

        result = {
          success: true,
          transaction: updatedListing,
          nft: updatedNFT,
          transaction_hash: transactionHash,
        };
        break;
      }

      case "list": {
        if (!transactionData.nft_id || !transactionData.price || !transactionData.currency) {
          throw new Error("nft_id, price, and currency are required for list action");
        }

        const { data: nft } = await supabaseClient
          .from("madden_nfts")
          .select("*")
          .eq("id", transactionData.nft_id)
          .eq("owner_id", user.id)
          .single();

        if (!nft) {
          throw new Error("NFT not found or you don't own it");
        }

        if (!nft.is_tradeable) {
          throw new Error("This NFT is not tradeable");
        }

        const { data: listing, error: listingError } = await supabaseClient
          .from("marketplace_listings")
          .insert({
            nft_id: transactionData.nft_id,
            seller_id: user.id,
            price: transactionData.price,
            currency: transactionData.currency,
            status: "active",
          })
          .select()
          .single();

        if (listingError) throw listingError;

        result = {
          success: true,
          listing,
        };
        break;
      }

      case "cancel": {
        if (!transactionData.listing_id) {
          throw new Error("listing_id is required for cancel action");
        }

        const { data: cancelledListing, error: cancelError } = await supabaseClient
          .from("marketplace_listings")
          .update({ status: "cancelled" })
          .eq("id", transactionData.listing_id)
          .eq("seller_id", user.id)
          .eq("status", "active")
          .select()
          .single();

        if (cancelError) throw cancelError;

        if (!cancelledListing) {
          throw new Error("Listing not found or you don't own it");
        }

        result = {
          success: true,
          listing: cancelledListing,
        };
        break;
      }

      default:
        throw new Error("Invalid action");
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Marketplace transaction error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Transaction failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
