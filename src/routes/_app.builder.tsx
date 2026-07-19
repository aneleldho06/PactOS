import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Play, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuilderBlock } from "@/components/builder/BuilderBlock";
import { BlockPalette } from "@/components/builder/BlockPalette";
import { ExecutionModal } from "@/components/execution/ExecutionModal";
import { useBuilderStore, useSessionStore } from "@/lib/stores";
import { BLOCK_META } from "@/lib/blocks-meta";
import { api } from "@/lib/api";
import { config } from "@/lib/config";
import { signTransaction } from "@stellar/freighter-api";
import { toast } from "sonner";
import type { BlockType } from "@/lib/types";

export const Route = createFileRoute("/_app/builder")({
  component: BuilderPage,
});

function BuilderPage() {
  const { name, description, blocks, setName, setDescription, addBlock, removeBlock, moveBlock } = useBuilderStore();
  const walletAddress = useSessionStore((s) => s.walletAddress);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const onAdd = (type: BlockType) => {
    const meta = BLOCK_META[type];
    addBlock({ id: `${type}-${Date.now()}`, type, title: meta.label, subtitle: meta.description });
  };

  const onSave = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (blocks.length === 0) {
      toast.error("Please add at least one block to your agreement.");
      return;
    }

    try {
      setSaving(true);
      toast.loading("Preparing transaction...", { id: "save-flow" });

      // 1. Prepare
      const prepareRes = (await api.agreements.prepare({
        name,
        description,
        blocks,
        creatorAddress: walletAddress,
      })) as {
        agreementId: string;
        chainAgreementId: string;
        transactionXdr: string;
      };

      toast.loading("Simulating transaction on-chain...", { id: "save-flow" });

      // 2. Simulate
      const simRes = await api.blockchain.simulate<any>(prepareRes.transactionXdr);
      if (simRes.error || (simRes.results && simRes.results.some((r: any) => r.error))) {
        throw new Error("Simulation failed. The transaction might be invalid.");
      }

      toast.loading("Signing transaction in wallet...", { id: "save-flow" });

      // 3. Sign
      let signedXdr: string;
      try {
        const signRes: any = await signTransaction(prepareRes.transactionXdr, {
          networkPassphrase: config.stellarNetworkPassphrase,
          address: walletAddress,
        });
        signedXdr = typeof signRes === "string" ? signRes : signRes.signedTxXdr;
      } catch (err: any) {
        throw new Error(err.message || "User cancelled signing or Freighter error.");
      }

      toast.loading("Submitting to Stellar network...", { id: "save-flow" });

      // 4. Submit
      const submitRes = await api.blockchain.submit<{ hash: string; status: string }>(signedXdr);
      const hash = submitRes.hash;

      toast.loading("Confirming transaction (waiting for ledger)...", { id: "save-flow" });

      // 5. Poll status
      let status = "PENDING";
      let attempts = 0;
      while (status === "PENDING" && attempts < 15) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const txStatus = await api.blockchain.getTransaction<{ status: string }>(hash);
        status = txStatus.status;
        attempts++;
      }

      if (status !== "SUCCESS") {
        throw new Error(`Transaction failed to confirm (status: ${status})`);
      }

      // 6. Update agreement status to DEPLOYED
      await api.agreements.update(prepareRes.agreementId, { status: "DEPLOYED" });

      toast.success("Agreement saved and registered on-chain!", { id: "save-flow" });
      navigate({ to: `/agreements/${prepareRes.agreementId}` });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save agreement.", { id: "save-flow" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0 flex-1">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="border-0 bg-transparent px-0 font-display !text-3xl shadow-none focus-visible:ring-0" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 border-0 bg-transparent px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0" />
        </div>
        <div className="flex gap-2">
          <Button onClick={onSave} disabled={saving} variant="outline" className="rounded-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
          <Button onClick={() => setOpen(true)} className="rounded-full"><Play className="h-4 w-4" />Test run</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <BlockPalette onAdd={onAdd} />
        <div className="min-h-[500px] rounded-2xl border-[3px] border-foreground bg-card/40 p-6 dot-grid">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <AnimatePresence>
              {blocks.map((bl, i) => (
                <div key={bl.id} className="w-full">
                  <BuilderBlock
                    block={bl}
                    first={i === 0}
                    last={i === blocks.length - 1}
                    onRemove={() => removeBlock(bl.id)}
                    onMoveUp={() => moveBlock(bl.id, -1)}
                    onMoveDown={() => moveBlock(bl.id, 1)}
                  />
                  {i < blocks.length - 1 && <div className="mx-auto my-1 h-6 w-px bg-border" />}
                </div>
              ))}
            </AnimatePresence>
            {blocks.length === 0 && (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Add a block from the palette to get started.
              </div>
            )}
          </div>
        </div>
      </div>
      <ExecutionModal open={open} onOpenChange={setOpen} />
    </div>
  );
}