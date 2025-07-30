import React from 'react';

interface FilterSectionProps {
  children: React.ReactNode;
  showBorder?: boolean;
  borderTop?: boolean;
  borderBottom?: boolean;
  className?: string;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  children,
  showBorder = true,
  borderTop = false,
  borderBottom = true,
  className = ''
}) => {
  const borderClasses = showBorder ? [
    borderTop && 'border-t border-gray-200 pt-3',
    borderBottom && 'border-b border-gray-200 pb-3'
  ].filter(Boolean).join(' ') : '';

  return (
    <div className={`${borderClasses} ${className}`.trim()}>
      {children}
    </div>
  );
};