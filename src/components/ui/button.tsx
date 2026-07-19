import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-bold uppercase tracking-wide cursor-pointer transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-[3px] border-foreground shadow-[4px_4px_0_0_var(--color-foreground)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-foreground)]",
        destructive:
          "bg-destructive text-destructive-foreground border-[3px] border-foreground shadow-[4px_4px_0_0_var(--color-foreground)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-foreground)]",
        outline:
          "border-[3px] border-foreground bg-background text-foreground shadow-[4px_4px_0_0_var(--color-primary)] hover:bg-primary hover:text-primary-foreground hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-primary)]",
        secondary:
          "bg-secondary text-secondary-foreground border-[3px] border-foreground shadow-[4px_4px_0_0_var(--color-primary)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-primary)]",
        ghost: "hover:bg-accent hover:text-accent-foreground border-[3px] border-transparent",
        link: "text-primary underline underline-offset-4 decoration-2 hover:decoration-[3px]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
