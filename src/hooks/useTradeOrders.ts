import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type OrderType = 'limit_buy' | 'limit_sell' | 'stop_loss' | 'take_profit';
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'expired';

export interface TradeOrder {
  id: string;
  user_id: string;
  player_id: string;
  player_name: string;
  order_type: OrderType;
  shares: number;
  trigger_price: number;
  current_price_at_creation: number;
  status: OrderStatus;
  filled_at: string | null;
  filled_price: number | null;
  expires_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  player_id: string;
  player_name: string;
  order_type: OrderType;
  shares: number;
  trigger_price: number;
  current_price: number;
  notes?: string;
  expires_days?: number;
}

export const ORDER_TYPE_CONFIG: Record<OrderType, { label: string; description: string; color: string; actionLabel: string }> = {
  limit_buy: {
    label: 'Limit Buy',
    description: 'Buy when price drops to target',
    color: 'text-emerald-400',
    actionLabel: 'Buy at',
  },
  limit_sell: {
    label: 'Limit Sell',
    description: 'Sell when price rises to target',
    color: 'text-blue-400',
    actionLabel: 'Sell at',
  },
  stop_loss: {
    label: 'Stop-Loss',
    description: 'Auto-sell to limit downside losses',
    color: 'text-red-400',
    actionLabel: 'Stop at',
  },
  take_profit: {
    label: 'Take Profit',
    description: 'Auto-sell when profit target is hit',
    color: 'text-yellow-400',
    actionLabel: 'Take profit at',
  },
};

export const useTradeOrders = (playerId?: string) => {
  const queryClient = useQueryClient();

  const { data: allOrders, isLoading: loadingAll } = useQuery({
    queryKey: ['trade-orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('trade_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TradeOrder[];
    },
  });

  const { data: playerOrders, isLoading: loadingPlayer } = useQuery({
    queryKey: ['trade-orders', 'player', playerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !playerId) return [];
      const { data, error } = await supabase
        .from('trade_orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TradeOrder[];
    },
    enabled: !!playerId,
  });

  const pendingOrders = (allOrders || []).filter(o => o.status === 'pending');
  const filledOrders = (allOrders || []).filter(o => o.status === 'filled');
  const cancelledOrders = (allOrders || []).filter(o => o.status === 'cancelled' || o.status === 'expired');

  const createOrder = useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (orderData.expires_days || 30));

      const { data, error } = await supabase
        .from('trade_orders')
        .insert({
          user_id: user.id,
          player_id: orderData.player_id,
          player_name: orderData.player_name,
          order_type: orderData.order_type,
          shares: orderData.shares,
          trigger_price: orderData.trigger_price,
          current_price_at_creation: orderData.current_price,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          notes: orderData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-orders'] });
    },
  });

  const cancelOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase
        .from('trade_orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-orders'] });
    },
  });

  const simulateFill = useMutation({
    mutationFn: async (orderId: string) => {
      const order = (allOrders || []).find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      const { data, error } = await supabase
        .from('trade_orders')
        .update({
          status: 'filled',
          filled_at: new Date().toISOString(),
          filled_price: order.trigger_price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-orders'] });
    },
  });

  return {
    allOrders,
    playerOrders,
    pendingOrders,
    filledOrders,
    cancelledOrders,
    loadingAll,
    loadingPlayer,
    createOrder,
    cancelOrder,
    simulateFill,
  };
};
