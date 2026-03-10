import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNFTs } from '@/hooks/useNFT';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';

interface MintNFTModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leagueId?: string;
}

const MintNFTModal = ({ open, onOpenChange, leagueId }: MintNFTModalProps) => {
  const { mintNFT } = useNFTs();
  const { address, isConnected } = useWeb3();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    nft_type: 'player_card',
    image: '',
    attributes: [] as Array<{ trait_type: string; value: string }>,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      await mintNFT.mutateAsync({
        nftData: {
          nft_type: formData.nft_type,
          metadata: {
            name: formData.name,
            description: formData.description,
            image: formData.image,
            attributes: formData.attributes,
          },
          league_id: leagueId,
        },
        walletAddress: address,
      });

      toast.success('NFT minted successfully!');
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        nft_type: 'player_card',
        image: '',
        attributes: [],
      });
    } catch (error) {
      toast.error('Failed to mint NFT');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Mint Madden NFT
          </DialogTitle>
          <DialogDescription>
            Create a unique NFT for your Madden achievements, player cards, or team badges
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nft_type">NFT Type *</Label>
            <Select
              value={formData.nft_type}
              onValueChange={(value) => setFormData({ ...formData, nft_type: value })}
            >
              <SelectTrigger id="nft_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player_card">Player Card</SelectItem>
                <SelectItem value="team_badge">Team Badge</SelectItem>
                <SelectItem value="achievement">Achievement Trophy</SelectItem>
                <SelectItem value="moment">Historic Moment</SelectItem>
                <SelectItem value="championship">Championship Ring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">NFT Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., MVP Season 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this NFT, its significance, and any special attributes..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.png"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Provide a URL to your NFT image
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">NFT Attributes (Optional)</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Add custom attributes like stats, rarity, or special traits
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData({
                  ...formData,
                  attributes: [...formData.attributes, { trait_type: '', value: '' }],
                });
              }}
            >
              Add Attribute
            </Button>

            {formData.attributes.map((attr, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  placeholder="Trait (e.g., Overall)"
                  value={attr.trait_type}
                  onChange={(e) => {
                    const newAttrs = [...formData.attributes];
                    newAttrs[index].trait_type = e.target.value;
                    setFormData({ ...formData, attributes: newAttrs });
                  }}
                />
                <Input
                  placeholder="Value (e.g., 99)"
                  value={attr.value}
                  onChange={(e) => {
                    const newAttrs = [...formData.attributes];
                    newAttrs[index].value = e.target.value;
                    setFormData({ ...formData, attributes: newAttrs });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newAttrs = formData.attributes.filter((_, i) => i !== index);
                    setFormData({ ...formData, attributes: newAttrs });
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {!isConnected && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Connect your wallet to mint NFTs on the blockchain
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-ea"
              disabled={mintNFT.isPending || !formData.name || !isConnected}
            >
              <Zap className="mr-2 h-4 w-4" />
              {mintNFT.isPending ? 'Minting...' : 'Mint NFT'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MintNFTModal;
