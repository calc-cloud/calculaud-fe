import {format} from 'date-fns';
import {CalendarIcon} from 'lucide-react';
import React, {useState} from 'react';

import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {cn} from '@/lib/utils';
import {RELATIVE_TIME_OPTIONS, UnifiedFilters} from '@/types/filters';
import {handleDateChange, handleRelativeTimeChange} from '@/utils/filterUtils';

interface DateRangeFilterProps {
  filters: UnifiedFilters;
  onFiltersChange: (filters: UnifiedFilters) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  filters,
  onFiltersChange
}) => {
  // State for controlling date picker popovers
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">From:</label>
            <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.start_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {filters.start_date ? format(new Date(filters.start_date), "dd/MM/yyyy") : "Start date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.start_date ? new Date(filters.start_date) : undefined}
                  onSelect={(date) => {
                    handleDateChange('start_date', date ? format(date, 'yyyy-MM-dd') : undefined, filters, onFiltersChange);
                    setStartDatePickerOpen(false);
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <span className="text-muted-foreground px-1 pb-2">—</span>
          
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">To:</label>
            <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.end_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {filters.end_date ? format(new Date(filters.end_date), "dd/MM/yyyy") : "End date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.end_date ? new Date(filters.end_date) : undefined}
                  onSelect={(date) => {
                    handleDateChange('end_date', date ? format(date, 'yyyy-MM-dd') : undefined, filters, onFiltersChange);
                    setEndDatePickerOpen(false);
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Relative Time:</label>
          <Select
              value={filters.relative_time || 'all_time'}
            onValueChange={(relativeTime) => handleRelativeTimeChange(relativeTime, filters, onFiltersChange)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {RELATIVE_TIME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};