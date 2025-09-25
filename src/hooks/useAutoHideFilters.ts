import { useCallback, useState } from "react";

interface UseAutoHideFiltersReturn {
  isVisible: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export const useAutoHideFilters = (): UseAutoHideFiltersReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle mouse enter - show immediately
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setIsVisible(true);
  }, []);

  // Handle mouse leave - hide immediately regardless of dropdown state
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsVisible(false);
  }, []);


  return {
    isVisible,
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
  };
};