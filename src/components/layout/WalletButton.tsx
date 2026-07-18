import { useState } from "react";
import { LoaderCircle, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authenticateWithFreighter } from "@/lib/wallet-auth";
import { useSessionStore } from "@/lib/stores";

type WalletButtonProps = {
  variant?: "default" | "ghost";
  size?: "sm" | "default";
  className?: string;
};

export function WalletButton({ variant = "default", size = "sm", className }: WalletButtonProps) {
  const walletAddress = useSessionStore((state) => state.walletAddress);
  const setSession = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    setLoading(true);
    try {
      setSession(await authenticateWithFreighter());
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Wallet connection failed.");
    } finally {
      setLoading(false);
    }
  };

  if (walletAddress) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={clearSession}
        title="Disconnect wallet"
      >
        <Wallet className="h-4 w-4" />
        {`${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}`}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={connect}
      disabled={loading}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
      {loading ? "Connecting…" : "Connect wallet"}
    </Button>
  );
}
