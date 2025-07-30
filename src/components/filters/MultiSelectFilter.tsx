import {ChevronDown} from 'lucide-react';
import React from 'react';

import {Badge} from '@/components/ui/badge';
import {Checkbox} from '@/components/ui/checkbox';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible';

interface FilterOption {
  id: number | string;
  name: string;
  // For status filters that need special badge rendering
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

interface MultiSelectFilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: (number | string)[];
  onToggle: (value: number | string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  subtitle?: string;
  renderOption?: (option: FilterOption, isSelected: boolean) => React.ReactNode;
  maxHeight?: string;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  title,
  options,
  selectedValues,
  onToggle,
  isLoading = false,
  emptyMessage = 'No options available',
  subtitle,
  renderOption,
  maxHeight = 'max-h-60'
}) => {
  const defaultRenderOption = (option: FilterOption, _isSelected: boolean) => {
    if (option.variant) {
      // Special rendering for status badges
      return (
        <Badge 
          variant={option.variant} 
          className={`text-xs ${option.className || ''}`}
        >
          {option.name}
        </Badge>
      );
    }
    
    return <span className="text-sm truncate">{option.name}</span>;
  };

  const optionRenderer = renderOption || defaultRenderOption;

  return (
    <Collapsible>
      <CollapsibleTrigger 
        className="flex items-center justify-between w-full py-2 text-sm font-medium text-left hover:bg-gray-50 rounded-sm px-1" 
        disabled={isLoading}
      >
        <span>
          {isLoading ? 'Loading...' : title}
          {subtitle && (
            <span className="ml-2 text-xs text-blue-600 font-normal">
              {subtitle}
            </span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 flex-shrink-0" />
      </CollapsibleTrigger>
      <CollapsibleContent className={`space-y-2 mt-3 pl-1 ${maxHeight} overflow-y-auto`}>
        {options.length === 0 ? (
          <div className="text-sm text-gray-500 py-2 px-1">
            {emptyMessage}
          </div>
        ) : (
          <>
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.id);
              return (
                <div
                  key={option.id}
                  className="flex items-center space-x-3 cursor-pointer py-1"
                  onClick={() => onToggle(option.id)}
                >
                  <Checkbox checked={isSelected} />
                  {optionRenderer(option, isSelected)}
                </div>
              );
            })}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};