import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { ReactNode } from "react";

import { SortConfig, SortField } from "@/utils/sorting";

interface HeaderWrapperProps {
  children: ReactNode;
  className?: string;
  sortable?: boolean;
  sortField?: SortField;
  currentSort?: SortConfig;
  onSortChange?: (config: SortConfig) => void;
}

export const HeaderWrapper = ({
  children,
  className = "",
  sortable = false,
  sortField,
  currentSort,
  onSortChange,
}: HeaderWrapperProps) => {
  const handleSortClick = () => {
    if (!sortable || !sortField || !onSortChange) return;

    const newDirection = currentSort?.field === sortField && currentSort?.direction === "desc" ? "asc" : "desc";

    onSortChange({ field: sortField, direction: newDirection });
  };

  const getSortIcon = () => {
    if (!sortable) return null;

    const isActive = currentSort?.field === sortField;
    const direction = currentSort?.direction;

    if (!isActive) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
    }

    return direction === "desc" ? (
      <ArrowDown className="h-4 w-4 text-primary flex-shrink-0" />
    ) : (
      <ArrowUp className="h-4 w-4 text-primary flex-shrink-0" />
    );
  };

  if (sortable) {
    return (
      <div
        className={`text-center cursor-pointer hover:bg-muted/50 transition-colors ${className}`}
        onClick={handleSortClick}
        title={`Sort by ${children}`}
      >
        <div className="h-auto p-2 font-medium flex items-center justify-center gap-2">
          {children}
          {getSortIcon()}
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="h-auto p-2 font-medium">{children}</div>
    </div>
  );
};

export const SimpleHeaderWrapper = ({ children }: { children: ReactNode }) => {
  return <div className="text-center">{children}</div>;
};
