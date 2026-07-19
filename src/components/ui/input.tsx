import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-sm border-[3px] border-foreground bg-background px-3 py-1 text-base font-medium transition-[box-shadow,transform] duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground placeholder:font-normal focus-visible:outline-none focus-visible:-translate-x-[2px] focus-visible:-translate-y-[2px] focus-visible:shadow-[4px_4px_0_0_var(--color-primary)] focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
