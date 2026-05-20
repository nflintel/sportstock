import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Trophy, Medal, Crown, TrendingUp, Wallet, Layers } from "lucide-react";

const RANK_STYLES: Record<number, { bg: string; text: string; icon: React.ReactNode }> = {
  1: {
    bg: "bg-yellow-500/10 border border-yellow-500/30",
    text: "text-yellow-400",
    icon: <Crown className="h-4 w-4 text-yellow-400" />,
  },
  2: {
    bg: "bg-slate-400/10 border border-slate-400/30",
    text: "text-slate-300",
    icon: <Medal className="h-4 w-4 text-slate-300" />,
  },
  3: {
    bg: "bg-amber-700/10 border border-amber-700/30",
    text: "text-amber-600",
    icon: <Medal className="h-4 w-4 text-amber-600" />,
  },
};

function PodiumCard({ entry, rank }: { entry: any; rank: number }) {
  const style = RANK_STYLES[rank];
  const initials = (entry.display_name || entry.username || "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`rounded-xl p-5 flex flex-col items-center gap-2 ${style.bg}`}>
      <div className="flex items-center gap-1 mb-1">{style.icon}<span className={`text-sm font-bold ${style.text}`}>#{rank}</span></div>
      <Avatar className="h-14 w-14">
        <AvatarFallback className="bg-muted text-lg font-bold">{initials}</AvatarFallback>
      </Avatar>
      <span className="font-semibold text-sm text-center truncate w-full text-center">{entry.display_name || entry.username}</span>
    </div>
  );
}

function LeaderboardRow({ entry, rank, valueLabel, value }: {
  entry: any;
  rank: number;
  valueLabel: string;
  value: string | number;
}) {
  const style = RANK_STYLES[rank];
  const initials = (entry.display_name || entry.username || "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg ${rank <= 3 ? style.bg : "hover:bg-muted/50"} transition-colors`}>
      <div className={`w-8 text-center font-bold text-sm ${rank <= 3 ? style.text : "text-muted-foreground"}`}>
        {rank <= 3 ? style.icon : <span>#{rank}</span>}
      </div>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-muted text-xs font-semibold">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{entry.display_name || entry.username || "Unknown"}</p>
        {entry.username && entry.display_name && (
          <p className="text-xs text-muted-foreground truncate">@{entry.username}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{valueLabel}</p>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("wins");
  const { globalWinsLeaderboard, loadingGlobalWins, portfolioLeaderboard, loadingPortfolio, nftLeaderboard, loadingNFT } = useLeaderboard();

  const topWins = (globalWinsLeaderboard || []).slice(0, 3);
  const restWins = (globalWinsLeaderboard || []).slice(3);

  const topPortfolio = (portfolioLeaderboard || []).slice(0, 3);
  const restPortfolio = (portfolioLeaderboard || []).slice(3);

  const topNFT = (nftLeaderboard || []).slice(0, 3);
  const restNFT = (nftLeaderboard || []).slice(3);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10 shrink-0">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Global Leaderboards</h1>
            <p className="text-sm text-muted-foreground">Rankings across all leagues and platforms</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="wins" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Trophy className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline">Win </span>Leaders
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Wallet className="h-3.5 w-3.5 shrink-0" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="nfts" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Layers className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline">NFT </span>Collectors
            </TabsTrigger>
          </TabsList>

          {/* WIN LEADERS */}
          <TabsContent value="wins" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Ranked by total wins across all Madden leagues</span>
            </div>

            {loadingGlobalWins ? (
              <SkeletonRows />
            ) : !globalWinsLeaderboard?.length ? (
              <div className="text-center py-16 text-muted-foreground">
                <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No records yet</p>
                <p className="text-sm">Join a league and start winning to appear here</p>
              </div>
            ) : (
              <>
                {topWins.length >= 3 && (
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <PodiumCard entry={topWins[1]} rank={2} />
                    <PodiumCard entry={topWins[0]} rank={1} />
                    <PodiumCard entry={topWins[2]} rank={3} />
                  </div>
                )}
                <div className="space-y-1">
                  {(globalWinsLeaderboard || []).map((entry) => (
                    <LeaderboardRow
                      key={`${entry.user_id}-${entry.league_id}`}
                      entry={entry}
                      rank={entry.rank}
                      value={`${entry.wins}W - ${entry.losses}L`}
                      valueLabel={`${entry.win_pct}% win rate`}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* PORTFOLIO LEADERS */}
          <TabsContent value="portfolio" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span>Ranked by current wallet balance and portfolio value</span>
            </div>

            {loadingPortfolio ? (
              <SkeletonRows />
            ) : !portfolioLeaderboard?.length ? (
              <div className="text-center py-16 text-muted-foreground">
                <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No portfolio data yet</p>
                <p className="text-sm">Start trading to build your portfolio</p>
              </div>
            ) : (
              <>
                {topPortfolio.length >= 3 && (
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <PodiumCard entry={topPortfolio[1]} rank={2} />
                    <PodiumCard entry={topPortfolio[0]} rank={1} />
                    <PodiumCard entry={topPortfolio[2]} rank={3} />
                  </div>
                )}
                <div className="space-y-1">
                  {(portfolioLeaderboard || []).map((entry) => (
                    <LeaderboardRow
                      key={entry.user_id}
                      entry={entry}
                      rank={entry.rank}
                      value={`$${Number(entry.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      valueLabel="wallet balance"
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* NFT COLLECTORS */}
          <TabsContent value="nfts" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>Ranked by total Madden NFTs collected</span>
            </div>

            {loadingNFT ? (
              <SkeletonRows />
            ) : !nftLeaderboard?.length ? (
              <div className="text-center py-16 text-muted-foreground">
                <Layers className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No NFT collectors yet</p>
                <p className="text-sm">Mint your first NFT to appear here</p>
              </div>
            ) : (
              <>
                {topNFT.length >= 3 && (
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <PodiumCard entry={topNFT[1]} rank={2} />
                    <PodiumCard entry={topNFT[0]} rank={1} />
                    <PodiumCard entry={topNFT[2]} rank={3} />
                  </div>
                )}
                <div className="space-y-1">
                  {(nftLeaderboard || []).map((entry) => (
                    <LeaderboardRow
                      key={entry.user_id}
                      entry={entry}
                      rank={entry.rank}
                      value={`${entry.nft_count} NFTs`}
                      valueLabel="total collected"
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground text-center pb-4">
          Rankings update in real time based on platform activity
        </div>
      </div>
    </DashboardLayout>
  );
}
