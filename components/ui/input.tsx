import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-white to-slate-50 px-4 py-2 text-base shadow-lg shadow-slate-200/20 transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:border-blue-400 hover:shadow-xl hover:from-slate-50 hover:to-slate-100 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm backdrop-blur-sm",
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
