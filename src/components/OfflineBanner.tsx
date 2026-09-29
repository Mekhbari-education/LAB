import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-orange-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center justify-between gap-4 no-print w-[calc(100vw-2rem)] max-w-lg"
        dir="rtl"
      >
        <div className="flex items-center gap-3">
          <WifiOff size={20} className="animate-pulse shrink-0" />
          <span className="text-xs sm:text-sm font-bold leading-tight">أنت الآن في وضع عدم الاتصال (Offline). يتم حفظ البيانات محلياً.</span>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="ms-2 p-1 hover:bg-white/20 rounded-full transition-all shrink-0"
          aria-label="إغلاق التنبيه"
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
