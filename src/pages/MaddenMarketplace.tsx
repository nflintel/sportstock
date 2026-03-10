import { useState } from 'react';
import { useAnnouncePageChange } from '@/hooks/useFocusManagement';
import { useMaddenLeagues } from '@/hooks/useMaddenLeagues';
import { useNFTs, useMarketplace } from '@/hooks/useNFT';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import WalletConnect from '@/components/WalletConnect';
import { Plus, Users, TrendingUp, Gamepad2, Lock, Globe } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const MaddenMarketplace = () => {
  useAnnouncePageChange('Madden Marketplace');
  const [selectedTab, setSelectedTab] = useState('leagues');

  const { publicLeagues, myLeagues, loadingPublic, loadingMy } = useMaddenLeagues();
  const { myNFTs, loadingMyNFTs } = useNFTs();
  const { listings, isLoading: loadingListings } = useMarketplace();

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Madden Marketplace</h1>
                <p className="text-muted-foreground">
                  Create leagues, trade NFTs, and dominate the Madden universe
                </p>
              </div>
              <WalletConnect />
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="leagues">
                  <Users className="mr-2 h-4 w-4" />
                  Leagues
                </TabsTrigger>
                <TabsTrigger value="my-leagues">
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  My Leagues
                </TabsTrigger>
                <TabsTrigger value="nfts">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  My NFTs
                </TabsTrigger>
                <TabsTrigger value="marketplace">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Marketplace
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leagues" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Public Leagues</h2>
                  <Button className="gradient-ea">
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
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {publicLeagues?.map((league) => (
                      <Card key={league.id} className="hover:border-primary transition-colors">
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

              <TabsContent value="my-leagues" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Leagues</h2>
                  <Button className="gradient-ea">
                    <Plus className="mr-2 h-4 w-4" />
                    Create League
                  </Button>
                </div>

                {loadingMy ? (
                  <div>Loading your leagues...</div>
                ) : myLeagues && myLeagues.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

              <TabsContent value="nfts" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My NFT Collection</h2>
                  <Button className="gradient-ea">
                    <Plus className="mr-2 h-4 w-4" />
                    Mint NFT
                  </Button>
                </div>

                {loadingMyNFTs ? (
                  <div>Loading your NFTs...</div>
                ) : myNFTs && myNFTs.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {myNFTs.map((nft) => (
                      <Card key={nft.id} className="overflow-hidden">
                        <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Gamepad2 className="h-16 w-16 text-primary" />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            {nft.metadata?.name || 'Unnamed NFT'}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {nft.nft_type}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {nft.price > 0 && (
                            <div className="text-lg font-bold text-primary">
                              {nft.price} ETH
                            </div>
                          )}
                          <Button className="w-full mt-2" size="sm" variant="outline">
                            List for Sale
                          </Button>
                        </CardContent>
                      </Card>
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

              <TabsContent value="marketplace" className="space-y-4 mt-6">
                <h2 className="text-2xl font-bold">NFT Marketplace</h2>

                {loadingListings ? (
                  <div>Loading marketplace...</div>
                ) : listings && listings.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {listings.map((listing: any) => (
                      <Card key={listing.id} className="overflow-hidden">
                        <div className="aspect-square bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                          <Gamepad2 className="h-16 w-16 text-accent" />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            {listing.nft?.metadata?.name || 'Unnamed NFT'}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {listing.nft?.nft_type}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold text-primary mb-2">
                            {listing.price} {listing.currency}
                          </div>
                          <Button className="w-full gradient-ea" size="sm">
                            Buy Now
                          </Button>
                        </CardContent>
                      </Card>
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
