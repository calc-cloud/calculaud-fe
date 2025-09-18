import { useCallback, useEffect, useRef, useState } from "react";

interface UseAutoHideFiltersReturn {
  isVisible: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  resetTimer: () => void;
}

export const useAutoHideFilters = (hideDelay: number = 2000): UseAutoHideFiltersReturn => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to clear existing timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Function to start/restart the auto-hide timer
  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (!isHovered) {
        setIsVisible(false);
      }
    }, hideDelay);
  }, [clearTimer, hideDelay, isHovered]);

  // Function to reset timer (called on any interaction)
  const resetTimer = useCallback(() => {
    setIsVisible(true);
    startTimer();
  }, [startTimer]);

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setIsVisible(true);
    clearTimer();
  }, [clearTimer]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    startTimer();
  }, [startTimer]);

  // Start initial timer on mount
  useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, [startTimer, clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    isVisible,
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
    resetTimer,
  };
};