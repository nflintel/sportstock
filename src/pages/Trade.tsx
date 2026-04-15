import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTradeOrders, ORDER_TYPE_CONFIG, type OrderType } from "@/hooks/useTradeOrders";
import { TrendingUp, TrendingDown, TriangleAlert as AlertTriangle, Target, ShieldAlert, Clock, X, CircleCheck as CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const upcomingGames = [
  { home: "New York Knicks", homeInitials: "NYK", away: "Phoenix Suns", awayInitials: "PHX", date: "Mar 14, 2026", time: "7:30 PM" },
  { home: "Atlanta Hawks", homeInitials: "ATL", away: "Miami Heat", awayInitials: "MIA", date: "Mar 14, 2026", time: "8:00 PM" },
  { home: "Cleveland Browns", homeInitials: "CLE", away: "Baltimore Ravens", awayInitials: "BAL", date: "Mar 15, 2026", time: "1:00 PM" },
];

const ORDER_ICONS: Record<OrderType, React.ReactNode> = {
  limit_buy: <TrendingDown className="h-4 w-4 text-emerald-400" />,
  limit_sell: <TrendingUp className="h-4 w-4 text-blue-400" />,
  stop_loss: <ShieldAlert className="h-4 w-4 text-red-400" />,
  take_profit: <Target className="h-4 w-4 text-yellow-400" />,
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  filled: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-muted text-muted-foreground border-border",
  expired: "bg-muted text-muted-foreground border-border",
};

function OrderCard({ order, onCancel, cancelling }: {
  order: any;
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  const cfg = ORDER_TYPE_CONFIG[order.order_type as OrderType];
  const isPending = order.status === 'pending';

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {ORDER_ICONS[order.order_type as OrderType]}
          <div>
            <p className="font-semibold text-sm">{cfg.label}</p>
            <p className="text-xs text-muted-foreground">{order.player_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs border ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
            {order.status}
          </Badge>
          {isPending && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onCancel(order.id)}
              disabled={cancelling}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 py-2 px-1">
          <p className="text-sm font-bold">{order.shares}</p>
          <p className="text-[10px] text-muted-foreground">Shares</p>
        </div>
        <div className="rounded-lg bg-muted/50 py-2 px-1">
          <p className={`text-sm font-bold ${cfg.color}`}>${order.trigger_price.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">Trigger</p>
        </div>
        <div className="rounded-lg bg-muted/50 py-2 px-1">
          <p className="text-sm font-bold">${(order.shares * order.trigger_price).toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">Est. Total</p>
        </div>
      </div>

      {order.status === 'filled' && order.filled_at && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Filled at ${order.filled_price?.toFixed(2)} · {formatDistanceToNow(new Date(order.filled_at), { addSuffix: true })}
        </div>
      )}

      {isPending && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Expires {formatDistanceToNow(new Date(order.expires_at), { addSuffix: true })}</span>
        </div>
      )}
    </div>
  );
}

function SetOrderForm({ playerId, playerName, currentPrice }: {
  playerId: string;
  playerName: string;
  currentPrice: number;
}) {
  const { createOrder } = useTradeOrders(playerId);
  const { toast } = useToast();
  const [orderType, setOrderType] = useState<OrderType>("limit_buy");
  const [shares, setShares] = useState(10);
  const [triggerPrice, setTriggerPrice] = useState(currentPrice);

  const cfg = ORDER_TYPE_CONFIG[orderType];
  const estimatedTotal = shares * triggerPrice;
  const priceDiff = currentPrice > 0 ? ((triggerPrice - currentPrice) / currentPrice) * 100 : 0;

  const handleSubmit = async () => {
    if (shares < 1) { toast({ title: "Must be at least 1 share", variant: "destructive" }); return; }
    if (triggerPrice <= 0) { toast({ title: "Invalid trigger price", variant: "destructive" }); return; }
    try {
      await createOrder.mutateAsync({
        player_id: playerId,
        player_name: playerName,
        order_type: orderType,
        shares,
        trigger_price: triggerPrice,
        current_price: currentPrice,
      });
      toast({ title: `${cfg.label} order set`, description: `Triggers at $${triggerPrice.toFixed(2)}` });
    } catch (err: any) {
      toast({ title: "Failed to set order", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(ORDER_TYPE_CONFIG) as [OrderType, typeof ORDER_TYPE_CONFIG[OrderType]][]).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`p-3 rounded-xl border text-left transition-all ${
              orderType === type ? "border-primary bg-primary/10" : "border-border bg-card hover:border-border/80"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {ORDER_ICONS[type]}
              <span className={`text-sm font-semibold ${orderType === type ? config.color : ""}`}>{config.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">{config.description}</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card/50 p-3 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">{cfg.description}. Your order executes automatically when the market reaches your trigger price.</p>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Shares</Label>
          <Input type="number" min={1} value={shares} onChange={e => setShares(Math.max(1, parseInt(e.target.value) || 1))} className="text-lg font-semibold" />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">
            Trigger Price
            <span className="ml-2 text-xs">(current: ${currentPrice.toFixed(2)})</span>
          </Label>
          <Input type="number" step="0.01" min={0.01} value={triggerPrice} onChange={e => setTriggerPrice(parseFloat(e.target.value) || 0)} className="text-lg font-semibold" />
          {currentPrice > 0 && triggerPrice > 0 && (
            <p className={`text-xs mt-1 ${priceDiff >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {priceDiff >= 0 ? "+" : ""}{priceDiff.toFixed(1)}% from current price
            </p>
          )}
        </div>
        <div className="flex justify-between text-sm pt-3 border-t">
          <span className="text-muted-foreground">Estimated value:</span>
          <span className="font-bold">${estimatedTotal.toFixed(2)}</span>
        </div>
        <Button className="w-full h-12 font-bold" onClick={handleSubmit} disabled={createOrder.isPending}>
          {createOrder.isPending ? "Setting..." : `Set ${cfg.label} at $${triggerPrice.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}

const Trade = () => {
  const { playerId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTradeTab, setActiveTradeTab] = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState(10);

  const { playerOrders, loadingPlayer, cancelOrder } = useTradeOrders(playerId);

  const { data: player } = useQuery({
    queryKey: ["player", playerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*").eq("id", playerId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!playerId,
  });

  const { data: holding } = useQuery({
    queryKey: ["holding", playerId],
    queryFn: async () => {
      const { data } = await supabase.from("holdings").select("*").eq("player_id", playerId!).single();
      return data;
    },
    enabled: !!playerId && !!user,
  });

  const tradeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("execute_trade", {
        p_player_id: playerId!,
        p_trade_type: activeTradeTab,
        p_shares: shares,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string; total?: number };
      if (!result.success) throw new Error(result.error || "Trade failed");
      return result;
    },
    onSuccess: (data) => {
      toast({ title: `${activeTradeTab === "buy" ? "Bought" : "Sold"} ${shares} shares!`, description: `Total: $${(data.total as number)?.toFixed(2)}` });
      queryClient.invalidateQueries({ queryKey: ["holding", playerId] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (err: Error) => {
      toast({ title: "Trade failed", description: err.message, variant: "destructive" });
    },
  });

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast({ title: "Order cancelled" });
    } catch (err: any) {
      toast({ title: "Failed to cancel", description: err.message, variant: "destructive" });
    }
  };

  const pricePerShare = player?.price ?? 0;
  const subtotal = shares * pricePerShare;
  const fee = subtotal * 0.025;
  const total = subtotal + fee;
  const userShares = holding?.shares ?? 0;
  const totalValue = userShares * pricePerShare;
  const pendingOrders = (playerOrders || []).filter(o => o.status === 'pending');
  const pastOrders = (playerOrders || []).filter(o => o.status !== 'pending');

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="rounded-xl border bg-card p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <Link to={`/player/${playerId}`}>
                  <Avatar className="h-16 w-16 border-2 border-border">
                    <AvatarFallback className="bg-secondary text-lg font-bold">{player?.initials ?? "?"}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link to={`/player/${playerId}`} className="text-xl font-bold hover:text-primary transition-colors">
                    {player?.name ?? "Loading..."}
                  </Link>
                  <p className="text-sm text-muted-foreground">{player?.team}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <div className="text-lg font-bold">${totalValue.toFixed(2)}</div>
                  <div className="text-[11px] text-muted-foreground">Total Value ({userShares} Shares)</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <div className="text-lg font-bold">${pricePerShare.toFixed(2)}</div>
                  <div className="text-[11px] text-muted-foreground">Current Price</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <div className={`text-lg font-bold ${(player?.change_24h ?? 0) >= 0 ? "text-sport-green" : "text-destructive"}`}>
                    {(player?.change_24h ?? 0) >= 0 ? "+" : ""}{(player?.change_24h ?? 0).toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-muted-foreground">24H Change</div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="trade" className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="trade">Buy / Sell</TabsTrigger>
                <TabsTrigger value="orders" className="gap-2">
                  Orders
                  {pendingOrders.length > 0 && (
                    <Badge className="h-4 text-[10px] px-1.5 bg-primary/20 text-primary border-primary/30">
                      {pendingOrders.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trade">
                <div className="rounded-xl border bg-card p-6">
                  <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
                    <button
                      onClick={() => setActiveTradeTab("buy")}
                      className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors ${activeTradeTab === "buy" ? "gradient-pink-purple text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      BUY SHARES
                    </button>
                    <button
                      onClick={() => setActiveTradeTab("sell")}
                      className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors ${activeTradeTab === "sell" ? "bg-destructive text-destructive-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      SELL SHARES
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Amount of Shares to {activeTradeTab === "buy" ? "Buy" : "Sell"}</label>
                      <Input type="number" min={1} value={shares} onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))} className="text-lg font-semibold" />
                    </div>
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{shares} Shares × ${pricePerShare.toFixed(2)}:</span>
                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">2.5% Fee:</span>
                        <span className="font-medium">${fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => tradeMutation.mutate()}
                      disabled={tradeMutation.isPending || !user}
                      className={`w-full h-12 text-sm font-bold ${activeTradeTab === "buy" ? "gradient-pink-purple border-0 text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}
                    >
                      {!user ? "LOG IN TO TRADE" : tradeMutation.isPending ? "PROCESSING..." : activeTradeTab === "buy" ? "BUY SHARES NOW" : "SELL SHARES NOW"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                {player && (
                  <div className="rounded-xl border bg-card p-6">
                    <h3 className="font-bold mb-4">Set Automated Order</h3>
                    <SetOrderForm playerId={player.id} playerName={player.name} currentPrice={player.price} />
                  </div>
                )}

                {pendingOrders.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Active Orders</h3>
                    {pendingOrders.map(order => (
                      <OrderCard key={order.id} order={order} onCancel={handleCancelOrder} cancelling={cancelOrder.isPending} />
                    ))}
                  </div>
                )}

                {pastOrders.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Order History</h3>
                    {pastOrders.map(order => (
                      <OrderCard key={order.id} order={order} onCancel={handleCancelOrder} cancelling={cancelOrder.isPending} />
                    ))}
                  </div>
                )}

                {(playerOrders || []).length === 0 && !loadingPlayer && (
                  <div className="text-center py-10 text-muted-foreground">
                    <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No orders yet</p>
                    <p className="text-sm">Set a limit order above to automate your trading</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Upcoming Games</h3>
              <Link to="/league" className="text-xs text-primary font-semibold hover:underline">VIEW ALL</Link>
            </div>
            <div className="space-y-3">
              {upcomingGames.map((game, i) => (
                <div key={i} className="p-4 rounded-xl border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">{game.homeInitials}</div>
                    <span className="text-xs font-medium">{game.home}</span>
                  </div>
                  <div className="text-center text-xs font-bold text-primary mb-3">VS</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">{game.awayInitials}</div>
                    <span className="text-xs font-medium">{game.away}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-2">
                    <span>{game.date}</span>
                    <span>{game.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {(playerOrders || []).length > 0 && (
              <div className="mt-6 rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">My Orders</h4>
                  <Badge variant="outline" className="text-xs">{pendingOrders.length} pending</Badge>
                </div>
                <div className="space-y-2">
                  {(playerOrders || []).slice(0, 3).map(order => {
                    const cfg = ORDER_TYPE_CONFIG[order.order_type as OrderType];
                    return (
                      <div key={order.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          {ORDER_ICONS[order.order_type as OrderType]}
                          <span>{cfg.label}</span>
                        </div>
                        <span className={`font-medium ${cfg.color}`}>${order.trigger_price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Trade;
