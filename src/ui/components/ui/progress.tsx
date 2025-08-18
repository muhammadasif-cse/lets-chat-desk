import * as React from "react";
import { cn } from "../../../lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  isIndeterminate?: boolean;
  size?: "sm" | "md" | "lg";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, isIndeterminate = false, size = "md", ...props }, ref) => {
    const percentage = isIndeterminate ? undefined : Math.min(100, Math.max(0, (value / max) * 100));
    
    const sizeClasses = {
      sm: "h-1",
      md: "h-2", 
      lg: "h-3"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-secondary",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full bg-primary transition-all duration-300 ease-in-out",
            isIndeterminate && "animate-pulse"
          )}
          style={{
            width: isIndeterminate ? "100%" : `${percentage}%`,
          }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
