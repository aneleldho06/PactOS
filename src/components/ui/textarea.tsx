import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-sm border-[3px] border-foreground bg-background px-3 py-2 text-base font-medium placeholder:text-muted-foreground placeholder:font-normal transition-[box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:-translate-x-[2px] focus-visible:-translate-y-[2px] focus-visible:shadow-[4px_4px_0_0_var(--color-primary)] focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
