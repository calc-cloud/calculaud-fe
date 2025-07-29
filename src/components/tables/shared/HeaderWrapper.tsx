import { ReactNode } from 'react';

interface HeaderWrapperProps {
  children: ReactNode;
  className?: string;
}

export const HeaderWrapper = ({ children, className = '' }: HeaderWrapperProps) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="h-auto p-2 font-medium">
        {children}
      </div>
    </div>
  );
};

export const SimpleHeaderWrapper = ({ children }: { children: ReactNode }) => {
  return <div className="text-center">{children}</div>;
};