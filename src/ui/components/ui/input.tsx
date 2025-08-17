import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: any;
  labelPlacement?: "inside" | "outside";
  errorMessage?: string;
  isInvalid?: boolean;
  endContent?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, labelPlacement = "inside", errorMessage, isInvalid, endContent, ...props }, ref) => {
    const id = React.useId();
    
    return (
      <div className="w-full">
        {label && labelPlacement === "outside" && (
          <label htmlFor={id} className="block text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              endContent && "pr-10",
              isInvalid && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          />
          {endContent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {endContent}
            </div>
          )}
          {label && labelPlacement === "inside" && !props.value && (
            <label 
              htmlFor={id} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none"
            >
              {label}
            </label>
          )}
        </div>
        {errorMessage && (
          <p className="text-sm text-destructive mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
