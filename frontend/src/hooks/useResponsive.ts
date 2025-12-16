import { useState, useEffect, useCallback } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveState {
  deviceType: DeviceType;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  isTouchDevice: boolean;
  hasNotch: boolean;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
} as const;

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return getDefaultState();
    }
    return calculateResponsiveState();
  });

  const handleResize = useCallback(() => {
    setState(calculateResponsiveState());
  }, []);

  const handleOrientationChange = useCallback(() => {
    // Delay to ensure viewport is fully updated
    setTimeout(() => {
      setState(calculateResponsiveState());
    }, 100);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize, false);
    window.addEventListener('orientationchange', handleOrientationChange, false);
    // Listen for safe area changes (iOS)
    window.addEventListener('resize', handleResize, false);

    return () => {
      window.removeEventListener('resize', handleResize, false);
      window.removeEventListener('orientationchange', handleOrientationChange, false);
    };
  }, [handleResize, handleOrientationChange]);

  return state;
};

function calculateResponsiveState(): ResponsiveState {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isTouchDevice = () => {
    return (
      typeof window !== 'undefined' &&
      (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0))
    );
  };

  const getDeviceType = (): DeviceType => {
    if (width < BREAKPOINTS.mobile) return 'mobile';
    if (width < BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  };

  const getSafeAreaInsets = () => {
    // Get safe area insets from CSS variables if available
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    const getCSSVarValue = (varName: string): number => {
      const value = computedStyle.getPropertyValue(varName).trim();
      if (!value) return 0;
      return parseInt(value, 10) || 0;
    };

    // Also check env() variables (iOS)
    return {
      top: getCSSVarValue('--safe-area-inset-top') || getEnvValue('safe-area-inset-top'),
      right: getCSSVarValue('--safe-area-inset-right') || getEnvValue('safe-area-inset-right'),
      bottom: getCSSVarValue('--safe-area-inset-bottom') || getEnvValue('safe-area-inset-bottom'),
      left: getCSSVarValue('--safe-area-inset-left') || getEnvValue('safe-area-inset-left'),
    };
  };

  const getEnvValue = (envName: string): number => {
    // CSS env() variables are not accessible via JS
    // This is a fallback - ideally should use window.visualViewport or similar
    return 0;
  };

  const hasNotch = (): boolean => {
    // Check for notch by examining safe area insets
    const insets = getSafeAreaInsets();
    return insets.top > 20 || insets.right > 0 || insets.left > 0;
  };

  const deviceType = getDeviceType();
  const isLandscape = width > height;
  const isPortrait = width <= height;
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  const touch = isTouchDevice();
  const notch = hasNotch();
  const safeAreaInsets = getSafeAreaInsets();

  return {
    deviceType,
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    isTouchDevice: touch,
    hasNotch: notch,
    safeAreaInsets,
  };
}

function getDefaultState(): ResponsiveState {
  return {
    deviceType: 'desktop',
    width: 1280,
    height: 720,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLandscape: true,
    isPortrait: false,
    isTouchDevice: false,
    hasNotch: false,
    safeAreaInsets: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  };
}

// Helper hook for specific breakpoint checks
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
};

export const useIsTablet = (): boolean => {
  const { isTablet } = useResponsive();
  return isTablet;
};

export const useIsTouchDevice = (): boolean => {
  const { isTouchDevice } = useResponsive();
  return isTouchDevice;
};

export const useIsLandscape = (): boolean => {
  const { isLandscape } = useResponsive();
  return isLandscape;
};

export const useSafeAreaInsets = () => {
  const { safeAreaInsets } = useResponsive();
  return safeAreaInsets;
};
