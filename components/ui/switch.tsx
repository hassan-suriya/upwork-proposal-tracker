"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative inline-block h-6 w-11">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        <span
          className={cn(
            "absolute inset-0 cursor-pointer rounded-full bg-gray-300 transition-colors duration-300 peer-checked:bg-primary",
            className
          )}
        />
        <span
          className={cn(
            "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 peer-checked:translate-x-5"
          )}
        />
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
