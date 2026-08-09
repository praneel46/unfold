import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'default', showWordmark = true, className = '' }) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const markSize = isLarge ? 'w-10 h-10' : isSmall ? 'w-6 h-6' : 'w-8 h-8';
  const textSize = isLarge ? 'text-2xl' : isSmall ? 'text-lg' : 'text-xl';

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Abstract Editorial Mark: Two unfolding layered pages */}
      <div className={`relative ${markSize} flex items-center justify-center shrink-0`}>
        {/* Layer 1 - Sage backdrop */}
        <div className="absolute w-[80%] h-[90%] bg-sage-500/80 rounded-md transform -rotate-6 transition-transform duration-300 group-hover:-rotate-12" />
        {/* Layer 2 - Coral top page */}
        <div className="absolute w-[80%] h-[90%] bg-coral-500 rounded-md transform rotate-3 transition-transform duration-300 group-hover:rotate-6 shadow-sm flex items-center justify-center">
          <div className="w-[1px] h-3/4 bg-paper-50/50 border-r border-dotted border-paper-50/60" />
        </div>
      </div>

      {showWordmark && (
        <span className={`font-serif font-bold tracking-tight text-ink-900 dark:text-ink-50 ${textSize}`}>
          UNFOLD
        </span>
      )}
    </Link>
  );
}
