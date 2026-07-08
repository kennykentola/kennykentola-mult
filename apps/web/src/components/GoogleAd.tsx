'use client';

import React, { useEffect, useRef } from 'react';

interface GoogleAdProps {
  /**
   * The slot ID for the specific ad unit (created in the AdSense Dashboard).
   * Example: "1234567890"
   */
  slotId: string;
  
  /**
   * Optional inline styles for the container.
   */
  style?: React.CSSProperties;
  
  /**
   * Tailwinds classes for the container. Default is "w-full overflow-hidden my-4"
   */
  className?: string;
  
  /**
   * The format of the ad. Default is "auto".
   */
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
}

/**
 * A reusable component to render Google AdSense ad units.
 * 
 * IMPORTANT: 
 * This component will only display live ads if you have an active AdSense account,
 * have provided the NEXT_PUBLIC_ADSENSE_ID in your .env file,
 * and the domain is approved by Google.
 */
export function GoogleAd({ 
  slotId, 
  style = { display: 'block' }, 
  className = "w-full overflow-hidden my-4 text-center",
  format = 'auto'
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    // We only try to push the ad if the publisher ID exists and the window object is ready.
    if (publisherId && typeof window !== 'undefined') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err: any) {
        console.error('AdSense error:', err.message);
      }
    }
  }, [publisherId]);

  // If no Publisher ID is set, we can optionally render a placeholder in development
  // so you can see where the ads *will* go.
  if (!publisherId) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center p-4 text-slate-500 text-sm ${className}`}>
          [Google AdSpace Placeholder - Slot: {slotId}]
        </div>
      );
    }
    return null;
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
