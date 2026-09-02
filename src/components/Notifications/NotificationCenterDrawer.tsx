import React, { useState, useEffect } from 'react';
import { 
  Bell, X, Check, CheckCheck, Sparkles, Mail, DollarSign, 
  ShieldAlert, Layers, ExternalLink, Clock, Trash2, Filter 
} from 'lucide-react';
import { InAppNotification, NotificationType } from '../../types/automation';
import { 
  fetchInAppNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../../services/automationService';

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientRole?: 'end_customer' | 'partner' | 'admin';
  onNavigateAction?: (url: string) => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientRole = 'end_customer',
  onNavigateAction,
}) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'rsvp' | 'payment' | 'export'>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const loadNotifications = async () => {
    setLoading(true);
    const list = await fetchInAppNotifications(recipientId, recipientRole);
    setNotifications(list);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, recipientId]);

  const handleMarkAsRead = async (notif: InAppNotification) => {
    await markNotificationAsRead(recipientId, notif.id);
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
    if (notif.action_url && onNavigateAction) {
      onNavigateAction(notif.action_url);
      onClose();
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(recipientId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.is_read;
    if (activeFilter === 'rsvp') return n.type === 'rsvp';
    if (activeFilter === 'payment') return n.type === 'payment';
    if (activeFilter === 'export') return n.type === 'export';
    return true;
  });

  if (!isOpen) return null;

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="w-4 h-4 text-[#136A4E]" />;
      case 'rsvp':
        return <Mail className="w-4 h-4 text-[#8C6D2E]" />;
      case 'export':
        return <Sparkles className="w-4 h-4 text-[#540D1E]" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-[#8C4A4A]" />;
      default:
        return <Bell className="w-4 h-4 text-[#736567]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs font-manrope animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E8DFD1] animate-slideLeft">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#F2ECE1] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#540D1E] text-[#F4D06F] flex items-center justify-center font-bold text-sm">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#20181A]">Notification Center</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.2 rounded-full bg-[#8C4A4A] text-white text-[10px] font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#736567]">Real-time operational alerts &amp; wedding updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                title="Mark all as read"
                className="p-1.5 rounded-lg text-[#736567] hover:text-[#20181A] hover:bg-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#736567] hover:text-[#20181A] hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="p-3 border-b border-[#F2ECE1] bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'rsvp', label: 'RSVP' },
            { id: 'payment', label: 'Payments' },
            { id: 'export', label: 'Exports' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-[#540D1E] text-white'
                  : 'text-[#736567] hover:bg-[#FAF6EF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification Feed Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#736567]">
              Loading notification stream...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Bell className="w-8 h-8 text-[#C2B8B0] mx-auto" />
              <p className="text-xs font-bold text-[#736567]">All caught up!</p>
              <p className="text-[11px] text-[#9C8C8E]">No notifications matching the selected filter.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkAsRead(n)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  n.is_read
                    ? 'bg-white border-[#E8DFD1] hover:border-[#D0C4B4]'
                    : 'bg-[#FAF6EE] border-[#F4D06F] shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white border border-[#E8DFD1] flex items-center justify-center shrink-0">
                      {getTypeIcon(n.type)}
                    </div>
                    <span className="font-bold text-xs text-[#20181A]">{n.title}</span>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[#540D1E] shrink-0 mt-1" />
                  )}
                </div>

                <p className="text-[11px] text-[#4A3E40] leading-relaxed pl-8">
                  {n.message}
                </p>

                <div className="flex items-center justify-between text-[10px] text-[#736567] pl-8 pt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {n.action_url && (
                    <span className="text-[#540D1E] font-bold flex items-center gap-0.5">
                      Open <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-[#F2ECE1] bg-[#FAF8F5] text-center text-[10px] text-[#736567]">
          AmantranLink Real-time Notification Engine · Auto-archived after 30 days
        </div>

      </div>
    </div>
  );
};
