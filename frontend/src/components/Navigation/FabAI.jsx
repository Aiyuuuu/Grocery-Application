import React from 'react';
import styles from './FabAI.module.css';

export default function FabAI() {
  return (
    <button className={`fixed bottom-8 right-8 z-50 h-16 w-16 rounded-full shadow-[0_0_30px_rgba(105,246,184,0.4)] flex items-center justify-center group hover:scale-110 transition-transform active:scale-95 ${styles.ctaGradient}`}>
      <span className="material-symbols-outlined text-on-primary-container text-3xl">smart_toy</span>
      <span className="absolute right-full mr-4 bg-surface-container border border-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Ask Javiz AI</span>
    </button>
  );
}
