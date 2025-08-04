import { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipCellProps {
  trigger: ReactNode;
  content: ReactNode;
  className?: string;
}

export const TooltipCell = ({
  trigger,
  content,
  className = "",
}: TooltipCellProps) => {
  return (
    <div className="text-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`cursor-pointer ${className}`}>{trigger}</div>
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </div>
  );
};

interface MultiItemDisplayProps {
  items: string[];
  maxVisible?: number;
  className?: string;
}

export const MultiItemDisplay = ({
  items,
  maxVisible = 2,
  className = "",
}: MultiItemDisplayProps) => {
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  return (
    <div className={`flex flex-col gap-0.5 items-center ${className}`}>
      {visibleItems.map((item, index) => (
        <div key={index} className="text-sm truncate">
          {item}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="text-xs text-muted-foreground">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
};
