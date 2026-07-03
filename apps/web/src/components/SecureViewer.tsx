'use client';

import React, { useEffect } from 'react';

export function SecureViewer({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  useEffect(() => {
    // Disable specific keyboard shortcuts (Ctrl+C, Ctrl+P, Ctrl+S, Ctrl+A, F12, Ctrl+Shift+I)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow normal typing if they are somehow focused on an input, though this is a viewer
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (
        (e.ctrlKey && ['c', 'p', 's', 'a', 'x'].includes(e.key.toLowerCase())) ||
        (e.metaKey && ['c', 'p', 's', 'a', 'x'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Override clipboard copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', 'This content is protected by KennyKentola Digital.');
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('copy', handleCopy, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('copy', handleCopy, { capture: true });
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .secure-viewer-content {
            display: none !important;
          }
          body::before {
            content: "Printing is disabled for this document.";
            display: block;
            text-align: center;
            font-size: 24px;
            margin-top: 50px;
          }
        }
      `}} />
      <div 
        className={`secure-viewer-content select-none ${className}`}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          KhtmlUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {children}
      </div>
    </>
  );
}
