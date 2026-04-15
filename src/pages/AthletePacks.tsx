import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAthletePacks, type PackTemplate, type OpenPackResult } from "@/hooks/useAthletePacks";
import { useToast } from "@/hooks/use-toast";
import { Package, Star, Zap, Trophy, ChevronRight, Clock, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TIER_CONFIG: Record<string, {
  gradient: string;
  border: string;
  glow: string;
  badge: string;
  badgeText: string;
  icon: React.ReactNode;
}> = {
  starter: {
    gradient: "from-blue-900/60 to-blue-700/30",
    border: "border-blue-500/40",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    badgeText: "Starter",
    icon: <Package className="h-10 w-10 text-blue-400" />,
  },
  pro: {
    gradient: "from-emerald-900/60 to-emerald-700/30",
    border: "border-emerald-500/40",
    glow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    badgeText: "Pro",
    icon: <Zap className="h-10 w-10 text-emerald-400" />,
  },
  championship: {
    gradient: "from-yellow-900/60 to-amber-700/30",
    border: "border-yellow-500/40",
    glow: "shadow-[0_0_24px_rgba(234,179,8,0.25)]",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    badgeText: "Championship",
    icon: <Trophy className="h-10 w-10 text-yellow-400" />,
  },
};

function PackCard({ template, onOpen, isLoading }: {
  template: PackTemplate;
  onOpen: (id: string) => void;
  isLoading: boolean;
}) {
  const cfg = TIER_CONFIG[template.tier] || TIER_CONFIG.starter;
  const rareChance = Math.round((template.contents_config?.rare_chance || 0.1) * 100);

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${cfg.gradient} ${cfg.border} ${cfg.glow} p-6 flex flex-col gap-5 transition-all hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-xl bg-black/20">{cfg.icon}</div>
        <Badge className={`border text-xs font-semibold ${cfg.badge}`}>{cfg.badgeText}</Badge>
      </div>

      <div>
        <h3 className="text-xl font-bold">{template.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-black/20 py-2 px-1">
          <p className="text-lg font-bold">{template.share_count}</p>
          <p className="text-[10px] text-muted-foreground">Shares</p>
        </div>
        <div className="rounded-lg bg-black/20 py-2 px-1">
          <p className="text-lg font-bold">{rareChance}%</p>
          <p className="text-[10px] text-muted-foreground">Rare Chance</p>
        </div>
        <div className="rounded-lg bg-black/20 py-2 px-1">
          <p className="text-lg font-bold">{template.guaranteed_rare ? "Yes" : "No"}</p>
          <p className="text-[10px] text-muted-foreground">Guaranteed</p>
        </div>
      </div>

      {template.guaranteed_rare && (
        <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 rounded-lg px-3 py-2">
          <Star className="h-3.5 w-3.5 shrink-0" />
          Guaranteed rare athlete included
        </div>
      )}

      <Button
        className="w-full font-bold text-base h-12"
        onClick={() => onOpen(template.id)}
        disabled={isLoading}
        style={{ background: template.tier === 'championship' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : undefined }}
      >
        {isLoading ? "Opening..." : `Open Pack — $${template.price.toFixed(2)}`}
      </Button>
    </div>
  );
}

function PackRevealModal({ result, onClose }: { result: OpenPackResult | null; onClose: () => void }) {
  if (!result) return null;

  return (
    <Dialog open={!!result} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5 text-primary" />
            Pack Opened!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            You received {result.contents?.length || 0} athletes for ${result.cost?.toFixed(2)}
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {(result.contents || []).map((item: any, i: number) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
                  item.is_rare
                    ? "bg-yellow-500/10 border-yellow-500/40"
                    : "bg-muted/40 border-border"
                }`}
              >
                <Avatar className="h-10 w-10 border border-border shrink-0">
                  <AvatarFallback className="bg-secondary text-xs font-bold">
                    {item.player_initials || item.player_name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{item.player_name}</p>
                    {item.is_rare && <Star className="h-3.5 w-3.5 text-yellow-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.player_team}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm text-primary">+{item.shares} shares</p>
                  <p className="text-xs text-muted-foreground">${item.price?.toFixed(2)} ea</p>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full" onClick={onClose}>
            Collect Rewards
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HistoryEntry({ pack }: { pack: any }) {
  const cfg = TIER_CONFIG[pack.tier] || TIER_CONFIG.starter;
  const contents = pack.contents || [];
  const rareCount = contents.filter((c: any) => c.is_rare).length;

  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${cfg.gradient} ${cfg.border}`}>
        {cfg.icon && <div className="scale-75">{cfg.icon}</div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-sm">{pack.template_name}</p>
          {rareCount > 0 && (
            <Badge className="text-[10px] border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
              {rareCount} Rare{rareCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{contents.length} athletes</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {pack.opened_at ? formatDistanceToNow(new Date(pack.opened_at), { addSuffix: true }) : "—"}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-sm">${pack.price_paid?.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">spent</p>
      </div>
    </div>
  );
}

export default function AthletePacks() {
  const { templates, packHistory, loadingTemplates, loadingHistory, openPack } = useAthletePacks();
  const { toast } = useToast();
  const [revealResult, setRevealResult] = useState<OpenPackResult | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const handleOpenPack = async (templateId: string) => {
    setOpeningId(templateId);
    try {
      const result = await openPack.mutateAsync(templateId);
      setRevealResult(result);
    } catch (err: any) {
      toast({
        title: "Failed to open pack",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Athlete Packs</h1>
            <p className="text-sm text-muted-foreground">Open packs to discover random athlete shares across all sports</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card/50 px-5 py-4 flex items-center gap-4">
          <TrendingUp className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            Each pack awards real athlete shares added directly to your portfolio. Rare picks give bonus shares. Championship packs guarantee at least one rare athlete.
          </p>
        </div>

        <Tabs defaultValue="shop">
          <TabsList className="grid grid-cols-2 w-full max-w-xs">
            <TabsTrigger value="shop">Shop</TabsTrigger>
            <TabsTrigger value="history">
              History {(packHistory || []).length > 0 && `(${packHistory!.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="mt-6">
            {loadingTemplates ? (
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {(templates || []).map((template) => (
                  <PackCard
                    key={template.id}
                    template={template}
                    onOpen={handleOpenPack}
                    isLoading={openingId === template.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6 space-y-3">
            {loadingHistory ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : (packHistory || []).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No packs opened yet</p>
                <p className="text-sm">Open your first pack from the Shop tab</p>
              </div>
            ) : (
              (packHistory || []).map((pack: any) => (
                <HistoryEntry key={pack.id} pack={pack} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <PackRevealModal result={revealResult} onClose={() => setRevealResult(null)} />
    </DashboardLayout>
  );
}
