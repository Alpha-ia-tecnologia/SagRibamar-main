import { useEffect } from 'react';

export const useLockBodyScroll = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      // Salva o scroll atual
      const scrollY = window.scrollY;
      
      // Aplica o lock
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Remove o lock
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        // Restaura o scroll
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
};




