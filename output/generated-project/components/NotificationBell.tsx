'use client';

import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, Check, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationBellProps {
  notifications?: Notification[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

export function NotificationBell({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    // You can customize icons based on notification type
    return '📬';
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onMarkAsRead && !notification.read) {
      onMarkAsRead(notification.id);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'relative p-2 text-gray-700 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md',
            className
          )}
          aria-label={`Notifications, ${unreadCount} unread`}
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-error rounded-full min-w-[20px] h-5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-hidden"
          align="end"
          sideOffset={5}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && onMarkAllAsRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onMarkAllAsRead();
                }}
                leftIcon={<CheckCheck className="h-4 w-4" />}
              >
                Mark all read
              </Button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[320px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm mt-1">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenu.Item
                  key={notification.id}
                  asChild
                  className="focus:outline-none"
                  onSelect={(e) => {
                    if (!notification.link) {
                      e.preventDefault();
                    }
                  }}
                >
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      className={cn(
                        'block p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer',
                        !notification.read && 'bg-blue-50'
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start">
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        'block p-4 border-b border-gray-100 cursor-default',
                        !notification.read && 'bg-blue-50'
                      )}
                    >
                      <div className="flex items-start">
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </DropdownMenu.Item>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Link
                href="/notifications"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => setOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
