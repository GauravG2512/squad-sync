import React, { useState, useEffect, useRef } from 'react';
import { friendsApi } from '../../api/friendsApi';
import { getAvatarSrc } from '../../api/client';
import { Bell, Check, X, UserPlus, Shield, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function NotificationDropdown({ onNavigateTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await friendsApi.getPendingRequests();
      const list = res?.data || res || [];
      setPendingRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      // Quiet fail if unauthenticated or network error
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for incoming activity
    const interval = setInterval(fetchNotifications, 30000);
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

  const handleRespond = async (requestId, action, e) => {
    e.stopPropagation();
    setActionLoadingId(requestId);
    try {
      await friendsApi.respondToRequest(requestId, action);
      setPendingRequests((prev) => prev.filter((r) => r.friendship_id !== requestId && r.id !== requestId));
    } catch (err) {
      console.warn('Failed to respond to request:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const notificationCount = pendingRequests.length;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        title="Notifications"
        style={{
          position: 'relative',
          background: isOpen ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          border: isOpen ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isOpen ? '#22d3ee' : '#94a3b8',
          transition: 'all 0.2s',
        }}
      >
        <Bell size={16} />
        {notificationCount > 0 && (
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
            animation: 'pulse 2s infinite',
          }}>
            {notificationCount}
          </span>
        )}
      </button>

      {/* DROPDOWN POPUP */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '46px',
          right: 0,
          width: '340px',
          maxWidth: '90vw',
          background: 'rgba(10, 15, 29, 0.96)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 211, 238, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(34, 211, 238, 0.1)',
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
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={14} color="#22d3ee" />
              <strong style={{ fontSize: '13px', color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                Activity & Alerts
              </strong>
            </div>
            {notificationCount > 0 && (
              <span className="matchBadge" style={{ fontSize: '10px', padding: '2px 8px' }}>
                {notificationCount} pending
              </span>
            )}
          </div>

          {/* NOTIFICATION CONTENT */}
          <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '8px' }}>
            {/* PENDING FRIEND REQUESTS SECTION */}
            {pendingRequests.length > 0 ? (
              <div>
                <div style={{ padding: '6px 8px', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Friend Requests
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
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
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
                            {req.primary_role || 'Competitive Player'} {req.rank_tier ? `• ${req.rank_tier}` : ''}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {isProcessing ? (
                          <Loader2 size={16} className="animate-spin" color="#22d3ee" />
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleRespond(reqId, 'ACCEPT', e)}
                              title="Accept Friend Request"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                background: 'rgba(46, 213, 115, 0.15)',
                                border: '1px solid rgba(46, 213, 115, 0.4)',
                                color: '#2ed573',
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
                              onClick={(e) => handleRespond(reqId, 'REJECT', e)}
                              title="Decline"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
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
            ) : null}

            {/* SYSTEM TELEMETRY ALERTS */}
            <div style={{ padding: '6px 8px', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              System Status
            </div>

            <div style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(34, 211, 238, 0.05)',
              border: '1px solid rgba(34, 211, 238, 0.15)',
              marginBottom: '6px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <Sparkles size={16} color="#22d3ee" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '12px', color: '#ffffff', display: 'block' }}>
                  AI Matchmaking Engine Online
                </strong>
                <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.3, display: 'block' }}>
                  Gamer DNA™ clusters and pairwise compatibility recommendations updated.
                </span>
              </div>
            </div>

            <div style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <Shield size={16} color="#a855f7" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '12px', color: '#ffffff', display: 'block' }}>
                  Conduct Moderation Active
                </strong>
                <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.3, display: 'block' }}>
                  Player protection rules & 48-hour conduct SLA enforced.
                </span>
              </div>
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
              <span>Manage Friends & Network</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
