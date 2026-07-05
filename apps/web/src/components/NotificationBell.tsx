'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { getSessionJwt } from '../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface Notification {
  $id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!profile) return;
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [profile]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await getSessionJwt();
      if (!token) return;

      const res = await fetch(`${API_BASE}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          // In case backend isn't ready and returns HTML or error obj
          setNotifications([]);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id: string, link?: string) => {
    try {
      const token = await getSessionJwt();
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(prev => prev.map(n => n.$id === id ? { ...n, isRead: true } : n));
      
      if (link) {
        window.open(link, '_blank');
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getSessionJwt();
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-slate-950">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
            <h3 className="font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                You're all caught up!
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.$id}
                  onClick={() => markAsRead(notification.$id, notification.link)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border-l-2 ${
                    notification.isRead 
                      ? 'bg-transparent border-transparent hover:bg-slate-800/50' 
                      : 'bg-indigo-500/10 border-indigo-500 hover:bg-indigo-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-slate-300' : 'text-white'}`}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{notification.message}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                      {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {notification.link && (
                      <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-1">
                        Open Link <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
