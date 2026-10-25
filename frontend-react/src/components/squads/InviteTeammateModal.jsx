import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Search, Shield, Check, Loader2, AlertCircle } from 'lucide-react';
import { squadsApi } from '../../api/squadsApi';
import { friendsApi } from '../../api/friendsApi';
import { triggerAppNotification } from '../../utils/audio';

const TACTICAL_ROLES = [
  'Duelist',
  'Initiator',
  'Controller',
  'Sentinel',
  'Entry Fragger',
  'Support',
  'In-Game Leader (IGL)',
  'Sniper / AWPer',
  'Flex'
];

export default function InviteTeammateModal({ isOpen, onClose, squad, onMemberInvited }) {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' | 'search'
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Flex');
  const [inviting, setInviting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load user's friends list when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setErrorMsg('');
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    const fetchFriends = async () => {
      setLoadingFriends(true);
      try {
        const res = await friendsApi.getFriends();
        const list = res.data?.data || res.data || [];
        setFriends(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn('Could not fetch friends for invite:', err);
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchFriends();
  }, [isOpen]);

  // Search players by query
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMsg('');
    try {
      const res = await friendsApi.searchGamers(searchQuery.trim());
      const results = res.data?.data || res.data || [];
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (err) {
      setErrorMsg('Failed to search players.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedUser) {
      setErrorMsg('Please select a player to invite.');
      return;
    }

    setInviting(true);
    setErrorMsg('');
    try {
      const targetUserId = selectedUser.user_id || selectedUser.id;
      const res = await squadsApi.inviteMember(squad.id, {
        user_id: targetUserId,
        role: selectedRole
      });

      const updatedSquad = res.data?.data || res.data;
      if (onMemberInvited) onMemberInvited(updatedSquad);

      triggerAppNotification({
        id: `inv-${Date.now()}`,
        type: 'squad_invited',
        title: 'Player Recruited',
        message: `${selectedUser.gamer_tag || selectedUser.username} added to ${squad.name} as ${selectedRole}!`,
        time: 'Just now',
        read: false,
      });

      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message || 'Failed to invite player.';
      setErrorMsg(detail);
    } finally {
      setInviting(false);
    }
  };

  if (!isOpen) return null;

  const existingMemberIds = new Set((squad.members || []).map((m) => m.user_id));
  const availableFriends = friends.filter((f) => !existingMemberIds.has(f.user_id));

  return (
    <div className="modalOverlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modalContainer glassCard" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '540px', textAlign: 'left' }}
      >
        <button type="button" className="modalCloseBtn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* HEADER */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <UserPlus size={20} color="var(--cyan)" />
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
              Invite Player to Squad
            </h2>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: '13px', margin: 0 }}>
            Recruit teammates into <strong style={{ color: '#fff' }}>{squad.name}</strong> ({squad.game}).
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: 'var(--radius-buttons)',
            fontSize: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={15} flexShrink={0} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SELECTION TABS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('friends'); setSelectedUser(null); }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-buttons)',
              fontSize: '12px',
              cursor: 'pointer',
              border: activeTab === 'friends' ? '1px solid var(--cyan)' : '1px solid var(--border)',
              background: activeTab === 'friends' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === 'friends' ? '#ffffff' : 'var(--text2)',
              fontWeight: activeTab === 'friends' ? 600 : 500,
            }}
          >
            My Friends ({availableFriends.length})
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('search'); setSelectedUser(null); }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-buttons)',
              fontSize: '12px',
              cursor: 'pointer',
              border: activeTab === 'search' ? '1px solid var(--cyan)' : '1px solid var(--border)',
              background: activeTab === 'search' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === 'search' ? '#ffffff' : 'var(--text2)',
              fontWeight: activeTab === 'search' ? 600 : 500,
            }}
          >
            Search Global Players
          </button>
        </div>

        {/* TAB 1: FRIENDS LIST */}
        {activeTab === 'friends' && (
          <div style={{ marginBottom: '20px' }}>
            <span style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-geistmono)', color: 'var(--text2)', marginBottom: '8px' }}>
              CHOOSE FROM CONNECTED FRIENDS
            </span>

            {loadingFriends ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text2)', fontSize: '13px' }}>
                <Loader2 size={18} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                Loading friends list...
              </div>
            ) : availableFriends.length === 0 ? (
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text2)', fontSize: '12px' }}>
                No eligible friends found. All your friends may already be in this squad, or you can search global players.
              </div>
            ) : (
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {availableFriends.map((friend) => {
                  const isSelected = selectedUser?.user_id === friend.user_id;
                  return (
                    <div
                      key={friend.user_id}
                      onClick={() => setSelectedUser(friend)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(34, 211, 238, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid var(--cyan)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.2))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#fff'
                        }}>
                          {(friend.gamer_tag || friend.username || 'F').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '13px', display: 'block' }}>
                            {friend.gamer_tag || friend.username}
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-geistmono)' }}>
                            {friend.primary_role || 'Flex'} • {friend.rank_tier || 'Unranked'}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div style={{ color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                          <Check size={14} /> Selected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GLOBAL SEARCH */}
        {activeTab === 'search' && (
          <div style={{ marginBottom: '20px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search player username or gamer tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: 'var(--radius-buttons)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border)',
                    color: '#ffffff',
                    fontSize: '13px',
                  }}
                />
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <button
                type="submit"
                className="glassBtn"
                disabled={isSearching || !searchQuery.trim()}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                {isSearching ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
              </button>
            </form>

            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {searchResults.length === 0 && !isSearching && searchQuery && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text2)', fontSize: '12px' }}>
                  No players found matching "{searchQuery}".
                </div>
              )}
              {searchResults.map((player) => {
                const isSelected = (selectedUser?.user_id || selectedUser?.id) === (player.user_id || player.id);
                const isAlreadyIn = existingMemberIds.has(player.user_id || player.id);
                return (
                  <div
                    key={player.user_id || player.id}
                    onClick={() => !isAlreadyIn && setSelectedUser(player)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(34, 211, 238, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid var(--cyan)' : '1px solid var(--border)',
                      cursor: isAlreadyIn ? 'not-allowed' : 'pointer',
                      opacity: isAlreadyIn ? 0.5 : 1,
                    }}
                  >
                    <div>
                      <strong style={{ color: '#fff', fontSize: '13px', display: 'block' }}>
                        {player.gamer_tag || player.username}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-geistmono)' }}>
                        {player.role || player.primary_role || 'Flex'} • {player.rank_tier || 'Unranked'}
                      </span>
                    </div>

                    {isAlreadyIn ? (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-geistmono)' }}>
                        Already in squad
                      </span>
                    ) : isSelected ? (
                      <div style={{ color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                        <Check size={14} /> Selected
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ROLE SELECTION */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-geistmono)', color: 'var(--text2)', marginBottom: '8px' }}>
            ASSIGN TACTICAL ROLE IN SQUAD
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {TACTICAL_ROLES.map((role) => {
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-geistmono)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid var(--cyan)' : '1px solid var(--border)',
                    color: isSelected ? 'var(--cyan)' : 'var(--text2)',
                    fontWeight: isSelected ? 700 : 500,
                    textAlign: 'center',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="glassBtn"
            onClick={onClose}
            disabled={inviting}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            Cancel
          </button>

          <button
            type="button"
            className="primaryBtn"
            onClick={handleSendInvite}
            disabled={inviting || !selectedUser}
            style={{ padding: '8px 22px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {inviting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Inviting...</span>
              </>
            ) : (
              <>
                <UserPlus size={14} />
                <span>Confirm & Invite</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
