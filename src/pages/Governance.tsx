import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGovernance, type GovernanceProposal } from "@/hooks/useGovernance";
import { useToast } from "@/hooks/use-toast";
import { Vote, Shield, Plus, CircleCheck as CheckCircle2, Circle as XCircle, Clock, Flame, Crown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  active: { label: "Active", variant: "default", icon: <Flame className="h-3 w-3" /> },
  passed: { label: "Passed", variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: "Rejected", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  expired: { label: "Expired", variant: "outline", icon: <Clock className="h-3 w-3" /> },
};

const PROPOSAL_TYPES = [
  { value: "feature", label: "Platform Feature" },
  { value: "rule_change", label: "Rule Change" },
  { value: "league_rule", label: "League Rule" },
  { value: "governance", label: "Governance" },
];

function ProposalCard({ proposal, isCommissioner }: { proposal: GovernanceProposal; isCommissioner: boolean }) {
  const { castVote } = useGovernance();
  const { toast } = useToast();
  const statusCfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.active;
  const forPct = proposal.total_votes > 0 ? Math.round((proposal.votes_for / proposal.total_votes) * 100) : 0;
  const progressToPass = Math.min(100, Math.round((proposal.votes_for / proposal.required_votes) * 100));
  const isExpired = new Date(proposal.expires_at) < new Date();
  const canVote = proposal.status === "active" && !isExpired && !proposal.user_vote;

  const handleVote = async (vote: "for" | "against") => {
    try {
      await castVote.mutateAsync({ proposalId: proposal.id, vote });
      toast({ title: `Vote cast: ${vote === "for" ? "For" : "Against"}`, description: isCommissioner ? "Your commissioner vote counts 3x" : undefined });
    } catch (err: any) {
      toast({ title: "Vote failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant={statusCfg.variant} className="gap-1 text-xs">
              {statusCfg.icon}{statusCfg.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {PROPOSAL_TYPES.find(t => t.value === proposal.proposal_type)?.label || proposal.proposal_type}
            </Badge>
            {proposal.league_id && <Badge variant="outline" className="text-xs">League</Badge>}
          </div>
          <h3 className="font-semibold text-base leading-tight">{proposal.title}</h3>
          {proposal.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{proposal.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{proposal.votes_for} for &bull; {proposal.votes_against} against</span>
          <span>{proposal.votes_for}/{proposal.required_votes} needed to pass</span>
        </div>
        <Progress value={progressToPass} className="h-2" />
        <div className="flex justify-between text-xs">
          <span className="text-emerald-500 font-medium">{forPct}% in favor</span>
          <span className="text-muted-foreground">
            {!isExpired && proposal.status === "active"
              ? `Expires ${formatDistanceToNow(new Date(proposal.expires_at), { addSuffix: true })}`
              : `Ended ${formatDistanceToNow(new Date(proposal.expires_at), { addSuffix: true })}`}
          </span>
        </div>
      </div>

      {proposal.user_vote ? (
        <div className={`flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 ${proposal.user_vote === "for" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
          {proposal.user_vote === "for" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          You voted {proposal.user_vote === "for" ? "for" : "against"} this proposal
          {isCommissioner && <span className="ml-auto text-xs opacity-70">(3x power)</span>}
        </div>
      ) : canVote ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
            onClick={() => handleVote("for")}
            disabled={castVote.isPending}
          >
            <CheckCircle2 className="h-4 w-4" />
            Vote For{isCommissioner && " (3x)"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 border-red-500/40 text-red-500 hover:bg-red-500/10"
            onClick={() => handleVote("against")}
            disabled={castVote.isPending}
          >
            <XCircle className="h-4 w-4" />
            Vote Against
          </Button>
        </div>
      ) : null}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
        <span>Proposed by @{proposal.proposer?.username || "unknown"}</span>
        <span>{formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}</span>
      </div>
    </div>
  );
}

function CreateProposalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createProposal } = useGovernance();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", description: "", proposal_type: "feature", required_votes: "5" });

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    try {
      await createProposal.mutateAsync({
        title: form.title,
        description: form.description,
        proposal_type: form.proposal_type,
        required_votes: parseInt(form.required_votes) || 5,
      });
      toast({ title: "Proposal created!", description: "Community members can now vote on your proposal." });
      onClose();
      setForm({ title: "", description: "", proposal_type: "feature", required_votes: "5" });
    } catch (err: any) {
      toast({ title: "Failed to create proposal", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Governance Proposal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input placeholder="Proposal title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea placeholder="Describe your proposal in detail..." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.proposal_type} onValueChange={v => setForm(f => ({ ...f, proposal_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPOSAL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Votes Required</Label>
              <Input type="number" min="1" max="100" value={form.required_votes} onChange={e => setForm(f => ({ ...f, required_votes: e.target.value }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createProposal.isPending}>
            {createProposal.isPending ? "Creating..." : "Create Proposal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-5 space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Governance() {
  const [createOpen, setCreateOpen] = useState(false);
  const { proposals, myProposals, loadingProposals, loadingMyProposals, isCommissioner } = useGovernance();

  const activeProposals = (proposals || []).filter(p => p.status === "active");
  const closedProposals = (proposals || []).filter(p => p.status !== "active");

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Vote className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Governance</h1>
              <p className="text-sm text-muted-foreground">Vote on platform features and league rules</p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Proposal
          </Button>
        </div>

        {isCommissioner && (
          <div className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
            <Crown className="h-5 w-5 text-yellow-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-300">Commissioner Status Active</p>
              <p className="text-xs text-muted-foreground">Your votes carry 3x weight on all proposals</p>
            </div>
            <Badge variant="outline" className="ml-auto border-yellow-500/40 text-yellow-400">3x Power</Badge>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{activeProposals.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active Proposals</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{(proposals || []).filter(p => p.status === "passed").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Passed</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{(myProposals || []).length}</p>
            <p className="text-xs text-muted-foreground mt-1">My Proposals</p>
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="active">Active ({activeProposals.length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({closedProposals.length})</TabsTrigger>
            <TabsTrigger value="mine">Mine ({(myProposals || []).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {loadingProposals ? (
              <SkeletonCards />
            ) : activeProposals.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Vote className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No active proposals</p>
                <p className="text-sm">Be the first to submit a proposal for the community</p>
                <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
                  Create Proposal
                </Button>
              </div>
            ) : (
              activeProposals.map(p => <ProposalCard key={p.id} proposal={p} isCommissioner={isCommissioner} />)
            )}
          </TabsContent>

          <TabsContent value="closed" className="space-y-4 mt-4">
            {loadingProposals ? (
              <SkeletonCards />
            ) : closedProposals.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No closed proposals yet</p>
              </div>
            ) : (
              closedProposals.map(p => <ProposalCard key={p.id} proposal={p} isCommissioner={isCommissioner} />)
            )}
          </TabsContent>

          <TabsContent value="mine" className="space-y-4 mt-4">
            {loadingMyProposals ? (
              <SkeletonCards />
            ) : (myProposals || []).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Plus className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No proposals yet</p>
                <p className="text-sm">Submit ideas to improve the platform</p>
                <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
                  Create Your First Proposal
                </Button>
              </div>
            ) : (
              (myProposals || []).map(p => <ProposalCard key={p.id} proposal={p} isCommissioner={isCommissioner} />)
            )}
          </TabsContent>
        </Tabs>

        <CreateProposalModal open={createOpen} onClose={() => setCreateOpen(false)} />
      </div>
    </DashboardLayout>
  );
}
