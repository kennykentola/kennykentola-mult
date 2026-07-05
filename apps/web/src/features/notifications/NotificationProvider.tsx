'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { client } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

interface NotificationContextType {
  newNotificationTrigger: number;
}

const NotificationContext = createContext<NotificationContextType>({ newNotificationTrigger: 0 });

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [newNotificationTrigger, setNewNotificationTrigger] = useState(0);

  useEffect(() => {
    // We only want to subscribe if logged in
    if (!user) return;

    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
    
    // Listen ONLY to the notifications collection
    const channels = [
      `databases.${dbId}.collections.notifications.documents`,
    ];

    console.log('[NotificationProvider] Subscribing to notifications realtime events...');
    const unsubscribe = client.subscribe(channels, (response) => {
      // Check if it's a create event
      const isCreate = response.events.some(event => event.includes('.create'));
      
      if (isCreate) {
        const payload: any = response.payload;
        
        // 1. Check if this document belongs to the current user
        if (payload.userId !== user.$id) return; // Not ours

        // Trigger an update so the NotificationBell knows to fetch
        setNewNotificationTrigger(prev => prev + 1);
        
        // Dynamic Toast based on payload type
        const iconMap: Record<string, string> = {
          success: '✅',
          info: 'ℹ️',
          warning: '⚠️',
          error: '🚨',
          payment: '💰',
          update: '🚀'
        };
        const icon = iconMap[payload.type] || '🔔';

        toast(payload.title + '\n' + payload.message, {
          icon,
          duration: 6000,
        });
      }
    });

    return () => {
      console.log('[NotificationProvider] Unsubscribing...');
      unsubscribe();
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ newNotificationTrigger }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
