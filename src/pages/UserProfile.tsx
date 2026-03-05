import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin } from "lucide-react";

const revenueData = [
  { month: "Jan", value: 4200 }, { month: "Feb", value: 3800 }, { month: "Mar", value: 5100 },
  { month: "Apr", value: 4600 }, { month: "May", value: 6200 }, { month: "Jun", value: 5800 },
  { month: "Jul", value: 7100 }, { month: "Aug", value: 6500 }, { month: "Sep", value: 5400 },
  { month: "Oct", value: 7800 }, { month: "Nov", value: 8200 }, { month: "Dec", value: 9100 },
];

const followers = [
  { name: "Gerard Cain", roi: "21%", initials: "GC", level: 18 },
  { name: "Eva Doyle", roi: "21%", initials: "ED", level: 28 },
  { name: "Greg Hardy", roi: "21%", initials: "GH", level: 22 },
  { name: "Horace Wise", roi: "21%", initials: "HW", level: 16 },
  { name: "Willie Boone", roi: "21%", initials: "WB", level: 13 },
  { name: "Alyssa Lloyd", roi: "21%", initials: "AL", level: 19 },
  { name: "Lionel Moody", roi: "21%", initials: "LM", level: 27 },
  { name: "Joanna Grey", roi: "21%", initials: "JG", level: 18 },
];

const friendSuggestions = [
  { name: "Kurt Shaw", initials: "KS", followers: "2,239", following: "5,339" },
  { name: "Dennis Meyer", initials: "DM", followers: "2,239", following: "5,339" },
  { name: "Lyle Reed", initials: "LR", followers: "2,239", following: "5,339" },
  { name: "Larry Chavez", initials: "LC", followers: "2,239", following: "5,339" },
];

type Tab = "about" | "followers" | "stats";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const tabs: { key: Tab; label: string }[] = [
    { key: "about", label: "About" },
    { key: "followers", label: "Followers" },
    { key: "stats", label: "Stats" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Profile header */}
        <div className="rounded-xl border bg-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarFallback className="bg-secondary text-2xl font-bold">EW</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full gradient-pink-purple flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                12
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold">Ed Walsh</h1>
                <div className="h-5 w-5 rounded-full gradient-pink-purple flex items-center justify-center">
                  <span className="text-[8px] text-primary-foreground">✓</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground justify-center sm:justify-start">
                <MapPin className="h-3 w-3" />
                <span>Poland</span>
              </div>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <div className="text-xl font-bold">2,239</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Followers</div>
              </div>
              <div>
                <div className="text-xl font-bold">5,339</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {activeTab === "about" && (
              <>
                {/* About section */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-lg font-bold mb-3">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Passionate sports investor and fantasy enthusiast. Building a diversified portfolio of athlete stocks across NBA, NFL, and MLB. Always looking for undervalued players with high upside potential.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Active trader since 2023 with a focus on emerging NBA talent
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Specializing in multi-sport portfolio diversification
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Community contributor and strategy mentor for new investors
                    </li>
                  </ul>
                </div>

                {/* Revenue Statistics */}
                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Revenue Statistics</h3>
                    <div className="flex gap-1">
                      {["1M", "6M", "1Y", "ALL"].map((period) => (
                        <button
                          key={period}
                          className="px-3 py-1 text-[11px] font-medium rounded-md text-muted-foreground hover:bg-muted transition-colors first:bg-muted first:text-foreground"
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="value" fill="hsl(var(--sport-cyan))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-2xl font-bold">$125,952</div>
                      <div className="text-xs text-muted-foreground">Income</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-2xl font-bold text-sport-green">65%</div>
                      <div className="text-xs text-muted-foreground">Return on Investment</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "followers" && (
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-lg font-bold mb-4">Followers</h3>
                <div className="space-y-3">
                  {followers.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarFallback className="bg-secondary text-xs font-bold">{f.initials}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground">
                            {f.level}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{f.name}</div>
                          <div className="text-xs text-muted-foreground">ROI {f.roi}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs h-7">Unfollow</Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">View More</Button>
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-lg font-bold mb-4">Trading Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Trades", value: "342" },
                    { label: "Win Rate", value: "68%" },
                    { label: "Avg Return", value: "+12.4%" },
                    { label: "Best Trade", value: "+145%" },
                    { label: "Portfolio Value", value: "$45,230" },
                    { label: "Active Positions", value: "18" },
                    { label: "Sports Covered", value: "3" },
                    { label: "Rank", value: "#142" },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-xl font-bold">{stat.value}</div>
                      <div className="text-[11px] text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Find Friends sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <h3 className="font-bold text-lg mb-4">Find Friends</h3>
            <div className="space-y-3">
              {friendSuggestions.map((friend, i) => (
                <div key={i} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-secondary text-xs font-bold">{friend.initials}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground">
                        18
                      </div>
                    </div>
                    <div className="text-sm font-bold uppercase">{friend.name}</div>
                  </div>
                  <div className="flex gap-4 text-center mb-3">
                    <div className="flex-1">
                      <div className="text-sm font-bold">{friend.followers}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Followers</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{friend.following}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Following</div>
                    </div>
                  </div>
                  <Button size="sm" className="w-full gradient-pink-purple border-0 text-primary-foreground text-xs">
                    FOLLOW
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
