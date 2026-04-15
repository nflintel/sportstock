import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, Star } from "lucide-react";

export interface NFTEvolutionData {
  level: number;
  xp: number;
  rarity: string;
  evolution_stage: number;
}

const RARITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  common: { label: "Common", color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/30" },
  uncommon: { label: "Uncommon", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  rare: { label: "Rare", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
  epic: { label: "Epic", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/30" },
  legendary: { label: "Legendary", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" },
};

const XP_PER_LEVEL = 100;

function getXpProgress(xp: number, level: number) {
  const levelStartXp = (level - 1) * XP_PER_LEVEL;
  const levelEndXp = level * XP_PER_LEVEL;
  const progress = ((xp - levelStartXp) / (levelEndXp - levelStartXp)) * 100;
  return Math.min(100, Math.max(0, progress));
}

function getNextRarity(rarity: string) {
  const tiers = ["common", "uncommon", "rare", "epic", "legendary"];
  const idx = tiers.indexOf(rarity);
  return idx < tiers.length - 1 ? tiers[idx + 1] : null;
}

function getLevelForNextRarity(rarity: string): number {
  const map: Record<string, number> = { common: 3, uncommon: 5, rare: 10, epic: 20, legendary: Infinity };
  return map[rarity] ?? Infinity;
}

interface NFTEvolutionBadgeProps {
  nft: NFTEvolutionData;
  compact?: boolean;
}

export function NFTEvolutionBadge({ nft, compact = false }: NFTEvolutionBadgeProps) {
  const rarity = RARITY_CONFIG[nft.rarity] || RARITY_CONFIG.common;
  const xpProgress = getXpProgress(nft.xp, nft.level);
  const nextRarity = getNextRarity(nft.rarity);
  const nextRarityLevel = getLevelForNextRarity(nft.rarity);
  const levelsToNextRarity = nextRarityLevel - nft.level;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border ${rarity.bg} ${rarity.border} ${rarity.color} cursor-default`}>
            <Star className="h-3 w-3" />
            Lv.{nft.level}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            <p className="font-semibold">{rarity.label} &bull; Level {nft.level}</p>
            <p>{nft.xp} XP total</p>
            {nextRarity && <p className="text-muted-foreground">{levelsToNextRarity} levels until {RARITY_CONFIG[nextRarity]?.label}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={`rounded-lg border p-3 space-y-2 ${rarity.bg} ${rarity.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className={`h-4 w-4 ${rarity.color}`} />
          <span className={`text-sm font-semibold ${rarity.color}`}>{rarity.label}</span>
        </div>
        <Badge variant="outline" className={`text-xs ${rarity.color} border-current`}>
          Level {nft.level}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Zap className="h-3 w-3" />
            <span>{nft.xp} XP</span>
          </div>
          <span className="text-muted-foreground">{Math.round(xpProgress)}% to Lv.{nft.level + 1}</span>
        </div>
        <Progress value={xpProgress} className="h-1.5" />
      </div>

      {nextRarity && (
        <p className="text-xs text-muted-foreground">
          {levelsToNextRarity > 0
            ? `${levelsToNextRarity} levels until ${RARITY_CONFIG[nextRarity]?.label}`
            : `Upgrading to ${RARITY_CONFIG[nextRarity]?.label}!`}
        </p>
      )}
    </div>
  );
}

interface RarityGlowCardProps {
  rarity: string;
  children: React.ReactNode;
  className?: string;
}

export function RarityGlowCard({ rarity, children, className = "" }: RarityGlowCardProps) {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;

  const glowMap: Record<string, string> = {
    common: "",
    uncommon: "shadow-[0_0_12px_rgba(52,211,153,0.15)]",
    rare: "shadow-[0_0_12px_rgba(96,165,250,0.2)]",
    epic: "shadow-[0_0_16px_rgba(167,139,250,0.25)]",
    legendary: "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
  };

  return (
    <div className={`rounded-xl border ${config.border} ${glowMap[rarity] || ""} transition-all ${className}`}>
      {children}
    </div>
  );
}
