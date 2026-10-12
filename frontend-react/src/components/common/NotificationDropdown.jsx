import React, { useState, useEffect, useRef } from 'react';
import { friendsApi } from '../../api/friendsApi';
import { getAvatarSrc } from '../../api/client';
import { 
  Bell, 
  Check, 
  X, 
  UserPlus, 
  Shield, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { playNotificationSound } from '../../utils/audio';

const DEFAULT_ACTIVITY_NOTIFICATIONS = [
  {
    id: 'squad-inv-1',
    type: 'squad_invite',
    title: 'Squad Invitation',
    sender: 'SovaIntel',
    target: 'Phantom Vanguards',
    message: 'Request from SovaIntel to join squad "Phantom Vanguards"',
    time: '5m ago',
    read: false,
    game: 'VALORANT',
  },
  {
    id: 'friend-acc-1',
    type: 'friend_accepted',
    title: 'Request Accepted',
    sender: 'OmenSmokes',
    message: 'Your friend request to OmenSmokes has been accepted!',
    time: '15m ago',
    read: false,
  },
  {
    id: 'squad-req-1',
    type: 'squad_request',
    title: 'Squad Join Request',
    sender: 'CypherLock',
    target: 'Phantom Vanguards',
    message: 'Request from CypherLock to join your squad roster',
    time: '35m ago',
    read: false,
    game: 'VALORANT',
  },
];

export default function NotificationDropdown({ onNavigateTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activityNotifs, setActivityNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem('squadsync_notifications');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_ACTIVITY_NOTIFICATIONS;
  });
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const dropdownRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const prevPendingCountRef = useRef(0);

  // Sync activity notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('squadsync_notifications', JSON.stringify(activityNotifs));
    } catch (_) {}
  }, [activityNotifs]);

  // Listen for real-time squad & app notifications to play sound & add to list
  useEffect(() => {
    const handleAppNotification = (e) => {
      playNotificationSound();
      if (e.detail) {
        setActivityNotifs((prev) => [e.detail, ...prev]);
      }
    };
    window.addEventListener('squadsync_notification', handleAppNotification);
    return () => window.removeEventListener('squadsync_notification', handleAppNotification);
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const res = await friendsApi.getPendingRequests();
      const list = res?.data || res || [];
      const arr = Array.isArray(list) ? list : [];
      if (!isFirstLoadRef.current && arr.length > prevPendingCountRef.current) {
        playNotificationSound();
      }
      isFirstLoadRef.current = false;
      prevPendingCountRef.current = arr.length;
      setPendingRequests(arr);
    } catch (err) {
      // Quiet fail if unauthenticated
    }
  };

  useEffect(() => {
    fetchFriendRequests();
    const interval = setInterval(fetchFriendRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRespondFriend = async (requestId, action, e) => {
    e.stopPropagation();
    setActionLoadingId(requestId);
    try {
      await friendsApi.respondToRequest(requestId, action);
      setPendingRequests((prev) => prev.filter((r) => (r.friendship_id || r.id) !== requestId));
      // Add accepted notification if accepted
      if (action.toUpperCase() === 'ACCEPT') {
        const acceptedNotif = {
          id: `acc-${Date.now()}`,
          type: 'friend_accepted',
          title: 'Friend Connected',
          message: 'You are now connected! Open chat to coordinate.',
          time: 'Just now',
          read: false,
        };
        setActivityNotifs((prev) => [acceptedNotif, ...prev]);
      }
    } catch (err) {
      console.warn('Failed to respond to request:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleActionActivity = (notifId, action, e) => {
    e.stopPropagation();
    setActivityNotifs((prev) =>
      prev.map((n) => {
        if (n.id === notifId) {
          return {
            ...n,
            read: true,
            status: action === 'accept' ? 'accepted' : 'declined',
            message: action === 'accept' ? `Accepted! You joined the squad.` : `Declined request.`,
          };
        }
        return n;
      })
    );
  };

  const handleMarkAllRead = () => {
    setActivityNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadActivityCount = activityNotifs.filter((n) => !n.read).length;
  const totalBadgeCount = pendingRequests.length + unreadActivityCount;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchFriendRequests();
        }}
        title="Notifications"
        style={{
          position: 'relative',
          background: isOpen ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          border: isOpen ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isOpen ? '#22d3ee' : '#94a3b8',
          transition: 'all 0.2s',
        }}
      >
        <Bell size={18} />
        {totalBadgeCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '18px',
            height: '18px',
            padding: '0 4px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #060911',
            boxShadow: '0 0 8px rgba(244, 63, 94, 0.6)',
          }}>
            {totalBadgeCount}
          </span>
        )}
      </button>

      {/* DROPDOWN POPUP */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '48px',
          right: 0,
          width: '360px',
          maxWidth: 'calc(100vw - 32px)',
          background: 'rgba(10, 15, 29, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 211, 238, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(34, 211, 238, 0.12)',
          zIndex: 1200,
          overflow: 'hidden',
          textAlign: 'left',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          {/* HEADER */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={15} color="#22d3ee" />
              <strong style={{ fontSize: '13px', color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                Notifications & Squad Alerts
              </strong>
            </div>
            {totalBadgeCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--cyan)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            ) : (
              <span style={{ fontSize: '11px', color: '#64748b' }}>All caught up</span>
            )}
          </div>

          {/* NOTIFICATION STREAM */}
          <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '10px' }}>
            {/* INCOMING FRIEND REQUESTS */}
            {pendingRequests.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ padding: '4px 6px 8px', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pending Friend Requests ({pendingRequests.length})
                </div>
                {pendingRequests.map((req) => {
                  const reqId = req.friendship_id || req.id;
                  const isProcessing = actionLoadingId === reqId;
                  const reqName = req.gamer_tag || req.username || 'Gamer';
                  const initials = reqName.substring(0, 2).toUpperCase();

                  return (
                    <div
                      key={reqId}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#fff',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}>
                          {req.avatar_url ? (
                            <img src={getAvatarSrc(req.avatar_url)} alt={reqName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            initials
                          )}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {reqName}
                          </strong>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Wants to connect with you
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        {isProcessing ? (
                          <Loader2 size={16} className="animate-spin" color="#22d3ee" />
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleRespondFriend(reqId, 'ACCEPT', e)}
                              title="Accept Friend"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: '#10b981',
                                border: 'none',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleRespondFriend(reqId, 'REJECT', e)}
                              title="Decline"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SQUAD & FRIEND ACTIVITY NOTIFICATIONS */}
            <div>
              <div style={{ padding: '4px 6px 8px', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Squad & Match Activity
              </div>

              {activityNotifs.map((notif) => {
                const isUnread = !notif.read;
                const isInvite = notif.type === 'squad_invite' || notif.type === 'squad_request';
                const isAccepted = notif.type === 'friend_accepted';

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      // Mark read on click
                      setActivityNotifs((prev) =>
                        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                      );
                      if (isInvite && onNavigateTab) onNavigateTab('squads');
                      else if (isAccepted && onNavigateTab) onNavigateTab('friends');
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: isUnread ? 'rgba(34, 211, 238, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: isUnread ? '1px solid rgba(34, 211, 238, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isAccepted
                          ? 'rgba(46, 213, 115, 0.2)'
                          : 'rgba(34, 211, 238, 0.2)',
                        border: isAccepted
                          ? '1px solid #2ed573'
                          : '1px solid #22d3ee',
                        color: isAccepted ? '#2ed573' : '#22d3ee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {isAccepted ? <CheckCircle2 size={16} /> : <Shield size={16} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '13px', color: '#ffffff' }}>
                            {notif.title}
                          </strong>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>
                            {notif.time}
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.35 }}>
                          {notif.message}
                        </p>

                        {/* ACTION BUTTONS FOR INVITATIONS */}
                        {isInvite && !notif.status && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                            <button
                              type="button"
                              onClick={(e) => handleActionActivity(notif.id, 'accept', e)}
                              className="primaryBtn"
                              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                            >
                              Accept Squad
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleActionActivity(notif.id, 'decline', e)}
                              className="glassBtn"
                              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER */}
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
          }}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onNavigateTab) onNavigateTab('friends');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--cyan)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View Friends & Network Hub</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
