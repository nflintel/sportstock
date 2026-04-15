import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnnouncePageChange } from '@/hooks/useFocusManagement';
import { useMaddenLeagues } from '@/hooks/useMaddenLeagues';
import { useNFTs, useMarketplace } from '@/hooks/useNFT';
import { useNFTEvolution } from '@/hooks/useGovernance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import WalletConnect from '@/components/WalletConnect';
import { NFTEvolutionBadge, RarityGlowCard } from '@/components/NFTEvolutionBadge';
import { Plus, Users, TrendingUp, Gamepad2, Lock, Globe, Zap, Trophy, Vote } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const MaddenMarketplace = () => {
  useAnnouncePageChange('Madden Marketplace');
  const [selectedTab, setSelectedTab] = useState('leagues');
  const navigate = useNavigate();

  const { publicLeagues, myLeagues, loadingPublic, loadingMy } = useMaddenLeagues();
  const { myNFTs, loadingMyNFTs } = useNFTs();
  const { listings, isLoading: loadingListings } = useMarketplace();
  const { awardXP } = useNFTEvolution();

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-background">
        <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Madden Marketplace</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Create leagues, trade NFTs, and dominate the Madden universe
                </p>
              </div>
              <div className="flex justify-start sm:justify-end">
                <WalletConnect />
              </div>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                <TabsTrigger value="leagues" className="text-xs sm:text-sm">
                  <Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Leagues</span>
                  <span className="sm:hidden">All</span>
                </TabsTrigger>
                <TabsTrigger value="my-leagues" className="text-xs sm:text-sm">
                  <Gamepad2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">My Leagues</span>
                  <span className="sm:hidden">Mine</span>
                </TabsTrigger>
                <TabsTrigger value="nfts" className="text-xs sm:text-sm">
                  <TrendingUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">My NFTs</span>
                  <span className="sm:hidden">NFTs</span>
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="text-xs sm:text-sm">
                  <TrendingUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Marketplace</span>
                  <span className="sm:hidden">Market</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leagues" className="space-y-4 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold">Public Leagues</h2>
                  <Button className="gradient-ea w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Create League
                  </Button>
                </div>

                {loadingPublic ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-6 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-20 bg-muted rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {publicLeagues?.map((league) => (
                      <Card key={league.id} className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {league.name}
                                {league.is_public ? (
                                  <Globe className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Lock className="h-4 w-4 text-yellow-500" />
                                )}
                              </CardTitle>
                              <CardDescription className="mt-2">
                                {league.description || 'No description'}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Badge variant="outline">{league.platform}</Badge>
                            <Badge variant="secondary">{league.league_type}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Members: {league.current_members}/{league.max_members}
                            </span>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!loadingPublic && publicLeagues?.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Public Leagues</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Be the first to create a public Madden league
                      </p>
                      <Button className="gradient-ea">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First League
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="my-leagues" className="space-y-4 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold">My Leagues</h2>
                  <Button className="gradient-ea w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Create League
                  </Button>
                </div>

                {loadingMy ? (
                  <div className="text-center py-8">Loading your leagues...</div>
                ) : myLeagues && myLeagues.length > 0 ? (
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {myLeagues.map((league) => (
                      <Card key={league.id} className="border-primary">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            {league.name}
                            <Badge variant="default">Owner</Badge>
                          </CardTitle>
                          <CardDescription>
                            {league.description || 'No description'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Platform</span>
                              <Badge>{league.platform}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Members</span>
                              <span>{league.current_members}/{league.max_members}</span>
                            </div>
                            <Button className="w-full mt-4" variant="outline">
                              Manage League
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Gamepad2 className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Leagues Yet</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Create your first Madden league to get started
                      </p>
                      <Button className="gradient-ea">
                        <Plus className="mr-2 h-4 w-4" />
                        Create League
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="nfts" className="space-y-4 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">My NFT Collection</h2>
                    <p className="text-sm text-muted-foreground">Level up your NFTs by earning XP through league wins and trades</p>
                  </div>
                  <Button className="gradient-ea w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Mint NFT
                  </Button>
                </div>

                {loadingMyNFTs ? (
                  <div className="text-center py-8">Loading your NFTs...</div>
                ) : myNFTs && myNFTs.length > 0 ? (
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {myNFTs.map((nft: any) => (
                      <RarityGlowCard key={nft.id} rarity={nft.rarity || 'common'}>
                        <div className="overflow-hidden rounded-xl">
                          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                            <Gamepad2 className="h-16 w-16 text-primary" />
                            {nft.nft_type === 'commissioner' && (
                              <div className="absolute top-2 right-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full p-1">
                                <Trophy className="h-4 w-4 text-yellow-400" />
                              </div>
                            )}
                          </div>
                          <div className="p-3 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">{nft.metadata?.name || 'Unnamed NFT'}</p>
                                <p className="text-xs text-muted-foreground capitalize">{nft.nft_type}</p>
                              </div>
                              {nft.price > 0 && (
                                <span className="text-sm font-bold text-primary shrink-0">{nft.price} ETH</span>
                              )}
                            </div>

                            <NFTEvolutionBadge
                              nft={{
                                level: nft.level || 1,
                                xp: nft.xp || 0,
                                rarity: nft.rarity || 'common',
                                evolution_stage: nft.evolution_stage || 1,
                              }}
                            />

                            <div className="flex gap-2">
                              <Button
                                className="flex-1"
                                size="sm"
                                variant="outline"
                                onClick={() => awardXP.mutate({ nftId: nft.id, xpAmount: 25, triggerSource: 'manual' })}
                                disabled={awardXP.isPending}
                              >
                                <Zap className="mr-1.5 h-3.5 w-3.5" />
                                +25 XP
                              </Button>
                              <Button className="flex-1" size="sm" variant="outline">
                                List for Sale
                              </Button>
                            </div>
                          </div>
                        </div>
                      </RarityGlowCard>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No NFTs Yet</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Mint your first Madden NFT to start your collection
                      </p>
                      <Button className="gradient-ea">
                        <Plus className="mr-2 h-4 w-4" />
                        Mint NFT
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="marketplace" className="space-y-4 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold">NFT Marketplace</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/leaderboard')}>
                      <Trophy className="h-4 w-4" />
                      Leaderboard
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/governance')}>
                      <Vote className="h-4 w-4" />
                      Governance
                    </Button>
                  </div>
                </div>

                {loadingListings ? (
                  <div className="text-center py-8">Loading marketplace...</div>
                ) : listings && listings.length > 0 ? (
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing: any) => (
                      <RarityGlowCard key={listing.id} rarity={listing.nft?.rarity || 'common'}>
                        <div className="overflow-hidden rounded-xl">
                          <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                            <Gamepad2 className="h-12 w-12 text-accent" />
                          </div>
                          <div className="p-3 space-y-3">
                            <div>
                              <p className="font-semibold text-sm">{listing.nft?.metadata?.name || 'Unnamed NFT'}</p>
                              <p className="text-xs text-muted-foreground capitalize">{listing.nft?.nft_type}</p>
                            </div>
                            {listing.nft && (
                              <NFTEvolutionBadge
                                nft={{
                                  level: listing.nft.level || 1,
                                  xp: listing.nft.xp || 0,
                                  rarity: listing.nft.rarity || 'common',
                                  evolution_stage: listing.nft.evolution_stage || 1,
                                }}
                              />
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">{listing.price} {listing.currency}</span>
                              <Button className="gradient-ea" size="sm">
                                Buy Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </RarityGlowCard>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Listings Available</h3>
                      <p className="text-muted-foreground text-center">
                        Check back later for new NFT listings
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default MaddenMarketplace;
