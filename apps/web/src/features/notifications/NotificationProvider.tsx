'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { client } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

interface NotificationContextType {
  // We don't expose much here, the provider just runs silently in the background
}

const NotificationContext = createContext<NotificationContextType>({});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Keep track of the last seen status for documents so we don't spam toasts
  // if the same document is updated multiple times without a status change.
  const docStatusCache = useRef<Record<string, string>>({});

  useEffect(() => {
    // We only want to subscribe to client-facing notifications if they are a regular user.
    // Admins have their own dashboard which they can refresh.
    const role = (user as any)?.prefs?.role;
    if (!user || role === 'Admin' || role === 'Super Admin') return;

    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
    
    const channels = [
      `databases.${dbId}.collections.solar_jobs.documents`,
      `databases.${dbId}.collections.print_orders.documents`,
      `databases.${dbId}.collections.student_projects.documents`,
      `databases.${dbId}.collections.maintenance_contracts.documents`,
      `databases.${dbId}.collections.agency_projects.documents`,
    ];

    console.log('[NotificationProvider] Subscribing to realtime events...');
    const unsubscribe = client.subscribe(channels, (response) => {
      // response.events is an array of event strings triggered
      // example: ["databases.*.collections.*.documents.*.update"]
      const isUpdate = response.events.some(event => event.includes('.update'));
      
      if (isUpdate) {
        const payload: any = response.payload;
        
        // 1. Check if this document belongs to the current user
        const ownerId = payload.clientId || payload.userId || payload.studentId;
        if (ownerId !== user.$id) return; // Not ours

        // 2. Check if the status actually changed
        const docId = payload.$id;
        const newStatus = payload.status;
        const oldStatus = docStatusCache.current[docId];
        
        if (newStatus && newStatus !== oldStatus) {
          // Status changed! Update cache
          docStatusCache.current[docId] = newStatus;
          
          // Only alert if it wasn't the first time we've seen it (to prevent toast storm on load)
          // Wait, Appwrite only sends events on ACTUAL updates, not initial load. 
          // So we can safely toast.

          // Determine module name from collection ID
          let moduleName = 'Service Request';
          if (response.events[0].includes('solar_jobs')) moduleName = 'Solar & Electrical Job';
          if (response.events[0].includes('print_orders')) moduleName = 'Print Order';
          if (response.events[0].includes('student_projects')) moduleName = 'Academic Project';
          if (response.events[0].includes('maintenance_contracts')) moduleName = 'Maintenance Contract';
          if (response.events[0].includes('agency_projects')) moduleName = 'Software Project';

          // Fire toast based on status
          if (newStatus === 'quoted') {
            const price = payload.quotePrice ?? payload.price ?? 0;
            toast.success(`Quote Ready: Your ${moduleName} was quoted for $${price}!`, {
              icon: '💰',
              duration: 8000,
            });
          } else if (newStatus === 'paid') {
            toast.success(`Payment Verified: Your ${moduleName} is now fully paid and active!`, {
              icon: '🎉',
              duration: 6000,
            });
          } else if (newStatus === 'completed') {
            toast.success(`Completed: Your ${moduleName} is finished!`, {
              icon: '✅',
              duration: 6000,
            });
          } else if (newStatus === 'in-progress' || newStatus === 'printing') {
            toast.success(`Update: Your ${moduleName} is now in progress!`, {
              icon: '🚀',
              duration: 5000,
            });
          } else {
            // Generic update
            toast(`Status Update: Your ${moduleName} is now ${newStatus}.`, {
              icon: 'ℹ️',
            });
          }
        }
      }
    });

    return () => {
      console.log('[NotificationProvider] Unsubscribing...');
      unsubscribe();
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
