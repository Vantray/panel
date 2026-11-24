import { cn } from "@/lib/utils";
import type { FC, PropsWithChildren } from "react";

type IconBlockProps = {
  tone?: "accent" | "danger" | "warning";
  className?: string;
};

/** Small rounded icon tile used as modal header decoration. */
export const IconBlock: FC<PropsWithChildren<IconBlockProps>> = ({
  tone = "accent",
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "flex size-11 items-center justify-center rounded-xl",
        tone === "danger" && "bg-danger-soft text-danger",
        tone === "accent" && "bg-accent-soft text-accent",
        tone === "warning" && "bg-warning-soft text-warning",
        className,
      )}
    >
      {children}
    </div>
  );
};
