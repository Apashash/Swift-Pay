import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/';
const TELEGRAM_URL  = 'https://t.me/';

export function SupportButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Options — WhatsApp + Telegram */}
      <AnimatePresence>
        {open && (
          <>
            {/* Telegram */}
            <motion.a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.85 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-xl hover:border-[#229ED9]/50 transition-all group"
            >
              {/* Telegram logo SVG */}
              <svg width="22" height="22" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="120" cy="120" r="120" fill="#229ED9"/>
                <path d="M180 65L155 180s-3.5 8.75-13 4.5l-36.5-28.25-13.25 12.75S89 171 82.25 171l2.5-38.25L159.5 61.25S163.5 57.5 159.5 61.25c0 0 4.5-2.75-1 0L57.75 133.5 21.5 121.75s-5.75-2-6.25-6.25c-.5-4.5 6.5-6.75 6.5-6.75L180 65z" fill="white"/>
              </svg>
              <span className="text-sm font-semibold text-foreground group-hover:text-[#229ED9] transition-colors">Telegram</span>
            </motion.a>

            {/* WhatsApp */}
            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-xl hover:border-[#25D366]/50 transition-all group"
            >
              {/* WhatsApp logo SVG */}
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#25D366"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M23.5 8.5A10.43 10.43 0 0016 5.5C10.75 5.5 6.5 9.75 6.5 15c0 1.6.42 3.17 1.22 4.56L6.5 25l5.56-1.46a10.47 10.47 0 004.94 1.26C21.25 24.8 25.5 20.55 25.5 15a10.43 10.43 0 00-2-6.5zm-7.5 16.05a8.7 8.7 0 01-4.43-1.2l-.32-.19-3.3.87.88-3.22-.2-.33A8.71 8.71 0 018.25 15C8.25 10.72 11.72 7.25 16 7.25A8.75 8.75 0 0124.75 16c0 4.27-3.47 7.75-7.75 7.55zm4.8-5.8c-.26-.13-1.55-.76-1.79-.85-.24-.09-.41-.13-.58.13-.17.26-.66.85-.81 1.02-.15.17-.3.19-.56.06a7.1 7.1 0 01-2.1-1.3 7.9 7.9 0 01-1.45-1.8c-.15-.26 0-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.07-.13-.58-1.4-.8-1.92-.2-.5-.42-.43-.58-.44H12c-.15 0-.39.06-.6.28-.2.22-.78.76-.78 1.86s.8 2.16.91 2.31c.11.15 1.57 2.4 3.8 3.37.53.23.95.37 1.27.47.53.17 1.02.14 1.4.09.43-.06 1.32-.54 1.5-1.06.2-.52.2-.96.14-1.05-.06-.1-.22-.15-.47-.28z" fill="white"/>
              </svg>
              <span className="text-sm font-semibold text-foreground group-hover:text-[#25D366] transition-colors">WhatsApp</span>
            </motion.a>
          </>
        )}
      </AnimatePresence>

      {/* Main floating button — no background, just the support icon */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.92 }}
        className="w-20 h-20 flex items-center justify-center focus:outline-none"
        aria-label="Support"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(0,230,118,0.7)]" />
            </motion.div>
          ) : (
            <motion.div
              key="support"
              initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              {/* Support agent SVG icon — green, no background */}
              <svg width="72" height="72" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="26" cy="20" r="8" stroke="#00e676" strokeWidth="2.2" fill="none"/>
                <path d="M26 12C21.58 12 18 15.58 18 20s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" fill="#00e676" fillOpacity="0.12"/>
                <path d="M14 36c0-4 5.37-7 12-7s12 3 12 7" stroke="#00e676" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                {/* Headset left ear */}
                <path d="M17 22a9 9 0 0 1 18 0" stroke="#00e676" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                <rect x="14" y="22" width="4" height="7" rx="2" fill="#00e676"/>
                <rect x="34" y="22" width="4" height="7" rx="2" fill="#00e676"/>
                {/* Mic */}
                <path d="M18 29c0 4 16 4 16 0" stroke="#00e676" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                <line x1="26" y1="33" x2="26" y2="36" stroke="#00e676" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="23" y1="36" x2="29" y2="36" stroke="#00e676" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

    </div>
  );
}
