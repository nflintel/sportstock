import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMaddenLeagues } from '@/hooks/useMaddenLeagues';
import { toast } from 'sonner';

interface CreateLeagueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateLeagueModal = ({ open, onOpenChange }: CreateLeagueModalProps) => {
  const { createLeague } = useMaddenLeagues();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true,
    league_type: 'franchise',
    platform: 'PS5',
    max_members: 32,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createLeague.mutateAsync(formData);
      toast.success('League created successfully!');
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        is_public: true,
        league_type: 'franchise',
        platform: 'PS5',
        max_members: 32,
      });
    } catch (error) {
      toast.error('Failed to create league');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Create Madden League</DialogTitle>
          <DialogDescription className="text-sm">
            Set up your private or public Madden league marketplace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">League Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Elite Madden 25 League"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your league rules, style, and what makes it unique..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-sm">Platform *</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PS5">PlayStation 5</SelectItem>
                  <SelectItem value="XBOX">Xbox Series X/S</SelectItem>
                  <SelectItem value="PC">PC</SelectItem>
                  <SelectItem value="CROSS">Cross-Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="league_type" className="text-sm">League Type *</Label>
              <Select
                value={formData.league_type}
                onValueChange={(value) => setFormData({ ...formData, league_type: value })}
              >
                <SelectTrigger id="league_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="franchise">Franchise Mode</SelectItem>
                  <SelectItem value="season">Season Mode</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="head2head">Head to Head</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_members">Maximum Members</Label>
            <Input
              id="max_members"
              type="number"
              min="2"
              max="32"
              value={formData.max_members}
              onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="is_public" className="text-sm sm:text-base">Public League</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Allow anyone to discover and join your league
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-ea w-full sm:w-auto"
              disabled={createLeague.isPending || !formData.name}
            >
              {createLeague.isPending ? 'Creating...' : 'Create League'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeagueModal;
