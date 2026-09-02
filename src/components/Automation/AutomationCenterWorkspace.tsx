import React, { useState, useEffect } from 'react';
import { 
  Zap, Bell, Clock, SlidersHorizontal, CheckCircle2, 
  AlertTriangle, Copy, ExternalLink, RefreshCw, ToggleLeft, 
  ToggleRight, MessageSquare, History, Shield, Moon, Mail 
} from 'lucide-react';
import { 
  AutomationRule, 
  AutomationExecutionLog, 
  UserNotificationPreferences, 
  WhatsAppReminderQueueItem 
} from '../../types/automation';
import { 
  fetchAutomationRules, 
  toggleAutomationRule, 
  fetchAutomationExecutionLogs, 
  fetchUserNotificationPreferences, 
  saveUserNotificationPreferences, 
  generateWhatsAppReminderQueueItem 
} from '../../services/automationService';

interface AutomationCenterWorkspaceProps {
  userId: string;
  userRole?: 'end_customer' | 'partner' | 'admin';
  weddingCoupleName?: string;
  weddingSlug?: string;
}

export const AutomationCenterWorkspace: React.FC<AutomationCenterWorkspaceProps> = ({
  userId,
  userRole = 'partner',
  weddingCoupleName = 'Dhruv & Shreya',
  weddingSlug = 'dhruv-shreya',
}) => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'whatsapp_queue' | 'preferences' | 'logs'>('workflows');
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationExecutionLog[]>([]);
  const [prefs, setPrefs] = useState<UserNotificationPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Manual WhatsApp Reminder Queue State
  const [queueItems, setQueueItems] = useState<WhatsAppReminderQueueItem[]>([]);
  const [guestNameInput, setGuestNameInput] = useState<string>('');
  const [guestPhoneInput, setGuestPhoneInput] = useState<string>('');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    const [rList, lList, uPrefs] = await Promise.all([
      fetchAutomationRules(),
      fetchAutomationExecutionLogs(),
      fetchUserNotificationPreferences(userId),
    ]);
    setRules(rList);
    setLogs(lList);
    setPrefs(uPrefs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleToggleRule = async (rule: AutomationRule) => {
    const nextState = !rule.is_enabled;
    const ok = await toggleAutomationRule(rule.id, nextState);
    if (ok) {
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_enabled: nextState } : r));
      showToast(`Automation "${rule.name}" ${nextState ? 'Enabled' : 'Disabled'}.`);
    }
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefs) return;
    await saveUserNotificationPreferences(prefs);
    showToast('Notification preferences saved successfully.');
  };

  const handleAddQueueItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestNameInput || !guestPhoneInput) return;
    const invUrl = typeof window !== 'undefined' ? `${window.location.origin}/i/${weddingSlug}` : `https://amantranlink.com/i/${weddingSlug}`;
    const item = generateWhatsAppReminderQueueItem(guestNameInput, guestPhoneInput, weddingCoupleName, invUrl);
    setQueueItems(prev => [item, ...prev]);
    setGuestNameInput('');
    setGuestPhoneInput('');
    showToast('Guest added to WhatsApp Reminder Queue.');
  };

  return (
    <div className="space-y-6 font-manrope">
      
      {/* Workspace Header */}
      <div className="bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#540D1E] text-[#F4D06F] flex items-center justify-center font-bold text-xl shadow-inner">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cormorant text-2xl font-bold text-[#20181A]">
                Automation &amp; Reminder Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EDF7F2] text-[#136A4E] font-mono text-[10px] font-bold uppercase">
                Active Workers
              </span>
            </div>
            <p className="text-xs text-[#736567]">
              Intelligent RSVP follow-ups, invoice due notifications &amp; approval workflows
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#FAF6EE] p-1.5 rounded-2xl border border-[#E8DFD1] text-xs font-bold">
          {[
            { id: 'workflows', label: 'Active Rules', icon: Zap },
            { id: 'whatsapp_queue', label: 'WhatsApp Queue', icon: MessageSquare },
            { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
            { id: 'logs', label: 'Execution Logs', icon: History },
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#540D1E] text-white shadow-2xs'
                    : 'text-[#736567] hover:text-[#20181A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 bg-[#EDF7F2] border border-[#BCE3D1] rounded-2xl text-xs text-[#136A4E] flex items-center gap-2 animate-scaleUp">
          <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Tab Stage */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#736567]">
          Loading automation workflows...
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. ACTIVE WORKFLOW RULES                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'workflows' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              {rules.map((rule) => (
                <div key={rule.id} className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF4E8] text-[#8C6D2E] text-[10px] font-mono font-bold uppercase">
                          {rule.trigger_type.replace('_', ' ')}
                        </span>
                        {rule.cooldown_hours > 0 && (
                          <span className="text-[10px] text-[#736567] font-mono">
                            ⏳ {rule.cooldown_hours}h cooldown
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule)}
                        className="cursor-pointer"
                      >
                        {rule.is_enabled ? (
                          <ToggleRight className="w-8 h-8 text-[#136A4E]" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-[#9C8C8E]" />
                        )}
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-[#20181A]">{rule.name}</h3>
                    <p className="text-xs text-[#736567] leading-relaxed">{rule.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between text-[10px] text-[#736567]">
                    <span>Scope: <strong className="capitalize text-[#20181A]">{rule.scope}</strong></span>
                    <span className="text-[#136A4E] font-bold">Idempotent Execution Engine</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. MANUAL WHATSAPP REMINDER QUEUE (MODE A)                                */}
          {/* ========================================================================= */}
          {activeTab === 'whatsapp_queue' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Add Queue Item Form */}
              <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#20181A]">Generate RSVP WhatsApp Reminder</h3>
                    <p className="text-xs text-[#736567]">Creates personalized 1-click invitation reminders with guest name and link</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#8C6D2E] text-[10px] font-bold font-mono">
                    Mode A: Manual WhatsApp Link
                  </span>
                </div>

                <form onSubmit={handleAddQueueItem} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Guest / Family Name"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    className="p-2.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp Phone (+91 ...)"
                    value={guestPhoneInput}
                    onChange={(e) => setGuestPhoneInput(e.target.value)}
                    className="p-2.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add to Queue
                  </button>
                </form>
              </div>

              {/* Generated Queue List */}
              <div className="space-y-3">
                {queueItems.length === 0 ? (
                  <div className="py-12 bg-white border border-[#E8DFD1] rounded-3xl text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-[#C2B8B0] mx-auto" />
                    <p className="text-xs font-bold text-[#736567]">Queue is empty</p>
                    <p className="text-[11px] text-[#9C8C8E]">Add guests above to generate ready-to-send WhatsApp reminders.</p>
                  </div>
                ) : (
                  queueItems.map((item) => (
                    <div key={item.id} className="p-4 bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-[#20181A]">{item.recipient_name}</strong>
                          <span className="text-[10px] font-mono text-[#736567]">{item.recipient_phone}</span>
                        </div>
                        <p className="text-[11px] text-[#4A3E40] line-clamp-1 italic bg-[#FAF8F5] p-1.5 rounded-lg border border-[#F2ECE1]">
                          "{item.message_text.split('\n')[0]}..."
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.message_text);
                            showToast('Message text copied to clipboard.');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD1] hover:bg-[#FAF6EF] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>

                        <a
                          href={item.wa_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <span>Open WhatsApp</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. NOTIFICATION PREFERENCES                                               */}
          {/* ========================================================================= */}
          {activeTab === 'preferences' && prefs && (
            <form onSubmit={handleSavePrefs} className="max-w-2xl bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-6 animate-fadeIn">
              <h3 className="font-bold text-sm text-[#20181A] border-b border-[#F2ECE1] pb-3">
                Notification Channel Preferences
              </h3>

              <div className="space-y-4 text-xs">
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#20181A] block">In-App Notification Stream</span>
                    <span className="text-[11px] text-[#736567]">Receive alerts inside top navigation drawer</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.in_app_enabled}
                    onChange={(e) => setPrefs({ ...prefs, in_app_enabled: e.target.checked })}
                    className="w-4 h-4 text-[#540D1E] rounded accent-[#540D1E]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#20181A] block">RSVP Submission Alerts</span>
                    <span className="text-[11px] text-[#736567]">Notify when a guest accepts or updates attendance</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.rsvp_alerts}
                    onChange={(e) => setPrefs({ ...prefs, rsvp_alerts: e.target.checked })}
                    className="w-4 h-4 text-[#540D1E] rounded accent-[#540D1E]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#20181A] block">Studio Payment &amp; Invoice Alerts</span>
                    <span className="text-[11px] text-[#736567]">Notify on upcoming dues and received payments</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.payment_alerts}
                    onChange={(e) => setPrefs({ ...prefs, payment_alerts: e.target.checked })}
                    className="w-4 h-4 text-[#540D1E] rounded accent-[#540D1E]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#20181A] block">Export Render Notifications</span>
                    <span className="text-[11px] text-[#736567]">Instant alerts when PDF Kankotri or Video Invitations are ready</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.export_alerts}
                    onChange={(e) => setPrefs({ ...prefs, export_alerts: e.target.checked })}
                    className="w-4 h-4 text-[#540D1E] rounded accent-[#540D1E]"
                  />
                </div>

              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                Save Preferences
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 4. EXECUTION AUDIT LOGS                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'logs' && (
            <div className="bg-white border border-[#E8DFD1] rounded-3xl overflow-hidden shadow-2xs animate-fadeIn">
              <div className="p-4 bg-[#FAF8F5] border-b border-[#E8DFD1] text-xs font-mono font-bold text-[#736567] uppercase">
                Idempotent Automation Execution Stream ({logs.length})
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E8DFD1] text-[10px] font-mono uppercase text-[#736567]">
                    <tr>
                      <th className="p-3.5">Execution Time</th>
                      <th className="p-3.5">Workflow Rule</th>
                      <th className="p-3.5">Target</th>
                      <th className="p-3.5">Channel</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE1]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FAF6EF]/50">
                        <td className="p-3.5 text-[#736567] font-mono text-[10px]">
                          {new Date(log.executed_at).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 font-bold text-[#20181A]">{log.rule_name}</td>
                        <td className="p-3.5 text-[#4A3E40]">{log.target_name || log.target_id}</td>
                        <td className="p-3.5 font-mono text-[10px] uppercase text-[#540D1E] font-bold">{log.delivery_channel}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-[#EDF7F2] text-[#136A4E] font-mono font-bold text-[9px] uppercase">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};
