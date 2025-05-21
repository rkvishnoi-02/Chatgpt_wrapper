import { useEffect, useState } from 'react';
import { UI_CONFIG } from '@/config/constants';

export function useMobileView() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < UI_CONFIG.MAX_MOBILE_WIDTH
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < UI_CONFIG.MAX_MOBILE_WIDTH);
    };

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
