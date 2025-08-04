import { ReactNode } from "react";

interface CellWrapperProps {
  children: ReactNode;
  className?: string;
}

export const CellWrapper = ({ children, className = "" }: CellWrapperProps) => {
  return (
    <div className="text-center">
      <div className={`flex items-center justify-center ${className}`}>{children}</div>
    </div>
  );
};
