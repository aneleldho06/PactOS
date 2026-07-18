import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { WalletButton } from "@/components/layout/WalletButton";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="ml-6 hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
            Features
          </a>
          <a href="#why" className="text-sm text-muted-foreground hover:text-foreground">
            Why Stellar
          </a>
          <Link to="/templates" className="text-sm text-muted-foreground hover:text-foreground">
            Templates
          </Link>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <WalletButton variant="ghost" />
          <Button asChild size="sm" className="rounded-full">
            <Link to="/builder">Create Agreement</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
