import React, { useState } from 'react';
import { Shield, Users, UserMinus, Crown, Trash2, Award, MessageSquare, UserPlus, LogOut, Loader2 } from 'lucide-react';
import { squadsApi } from '../../api/squadsApi';
import { useAuth } from '../../context/AuthContext';
import { triggerAppNotification } from '../../utils/audio';
import InviteTeammateModal from './InviteTeammateModal';

export default function SquadCard({ squad, onSquadUpdated, onSquadDeleted, onOpenSquadChat }) {
  const { user } = useAuth();
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const isOwner = user?.id && squad.owner_id === user.id;
  const members = squad.members || [];
  const maxMembers = squad.max_members || 5;
  const canInvite = isOwner && members.length < maxMembers;

  // Handle removing another player (owner only)
  const handleRemoveMember = async (memberUserId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this squad roster?`)) return;

    setRemovingMemberId(memberUserId);
    try {
      await squadsApi.removeMember(squad.id, memberUserId);
      triggerAppNotification({
        id: `rm-${Date.now()}`,
        type: 'member_removed',
        title: 'Roster Updated',
        message: `${memberName} was removed from ${squad.name}.`,
        time: 'Just now',
        read: false,
      });
      if (onSquadUpdated) onSquadUpdated();
    } catch (err) {
      alert('Failed to remove member from squad.');
    } finally {
      setRemovingMemberId(null);
    }
  };

  // Handle squad leader disbanding squad
  const handleDisbandSquad = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to DISBAND and delete "${squad.name}"?\n\nThis will permanently delete the squad roster and message history.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await squadsApi.deleteSquad(squad.id);
      triggerAppNotification({
        id: `disband-${Date.now()}`,
        type: 'squad_disbanded',
        title: 'Squad Disbanded',
        message: `Squad "${squad.name}" has been permanently deleted.`,
        time: 'Just now',
        read: false,
      });
      if (onSquadDeleted) onSquadDeleted(squad.id);
      else if (onSquadUpdated) onSquadUpdated();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to disband squad.';
      alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle normal member leaving squad
  const handleLeaveSquad = async () => {
    const confirmed = window.confirm(`Are you sure you want to LEAVE "${squad.name}"?`);
    if (!confirmed) return;

    setIsLeaving(true);
    try {
      await squadsApi.removeMember(squad.id, user.id);
      triggerAppNotification({
        id: `leave-${Date.now()}`,
        type: 'squad_left',
        title: 'Left Squad',
        message: `You have left "${squad.name}".`,
        time: 'Just now',
        read: false,
      });
      if (onSquadDeleted) onSquadDeleted(squad.id);
      else if (onSquadUpdated) onSquadUpdated();
    } catch (err) {
      alert('Failed to leave squad.');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div
      className="glassCard"
      style={{
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'left'
      }}
    >
      {/* SQUAD HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="matchBadge" style={{ background: 'rgba(34, 211, 238, 0.15)', color: 'var(--cyan)', borderColor: 'rgba(34, 211, 238, 0.35)' }}>
              {squad.game}
            </span>
            <span className="matchBadge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--violet)', borderColor: 'rgba(139, 92, 246, 0.35)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Award size={12} />
              {squad.synergy_score}% Synergy
            </span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 6px 0', fontFamily: "'Space Grotesk', sans-serif" }}>
            {squad.name}
          </h3>

          <p style={{ color: 'var(--text2)', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>
            {squad.description || 'Competitive squad roster formed via SquadSync.'}
          </p>
        </div>

        {/* HEADER ACTIONS: CHANNEL & DISBAND/LEAVE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onOpenSquadChat && (
            <button
              type="button"
              className="glassBtn"
              onClick={() => onOpenSquadChat({
                type: 'team',
                id: squad.id,
                name: squad.name,
                role: squad.game,
                isOnline: true
              })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '12px'
              }}
            >
              <MessageSquare size={13} color="var(--cyan)" />
              <span>Squad Channel</span>
            </button>
          )}

          {isOwner ? (
            <button
              type="button"
              className="glassBtn"
              onClick={handleDisbandSquad}
              disabled={isDeleting}
              title="Disband and delete this squad (Leader only)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)'
              }}
            >
              {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              <span>Disband Squad</span>
            </button>
          ) : (
            <button
              type="button"
              className="glassBtn"
              onClick={handleLeaveSquad}
              disabled={isLeaving}
              title="Leave this squad roster"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)'
              }}
            >
              {isLeaving ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
              <span>Leave Squad</span>
            </button>
          )}
        </div>
      </div>

      {/* ROSTER SECTION */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-geistmono)', color: 'var(--text2)', fontWeight: 500 }}>
              ACTIVE ROSTER ({members.length}/{maxMembers})
            </span>
            {isOwner && (
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-geistmono)', color: '#facc15', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Crown size={12} /> SQUAD LEADER
              </span>
            )}
          </div>

          {canInvite && (
            <button
              type="button"
              className="glassBtn"
              onClick={() => setIsInviteModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                fontSize: '11px',
                color: 'var(--cyan)',
                borderColor: 'rgba(34, 211, 238, 0.35)',
                background: 'rgba(34, 211, 238, 0.08)'
              }}
            >
              <UserPlus size={12} />
              <span>Invite Player</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {members.length === 0 ? (
            <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text2)', fontSize: '12px', fontFamily: 'var(--font-geistmono)' }}>
              No members in this roster yet.
            </div>
          ) : (
            members.map((member) => {
              const isMemberOwner = member.user_id === squad.owner_id;
              const canRemove = isOwner && !isMemberOwner;

              return (
                <div
                  key={member.user_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-sm)',
                        background: isMemberOwner ? 'linear-gradient(135deg, #22d3ee, #8b5cf6)' : 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid var(--border)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: "'Space Grotesk', sans-serif"
                      }}
                    >
                      {(member.gamer_tag || member.username || 'G').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {member.gamer_tag || member.username}
                      </strong>
                      {isMemberOwner && (
                        <span style={{ color: '#facc15', fontSize: '10px', fontFamily: 'var(--font-geistmono)', marginLeft: '6px' }}>
                          (Leader)
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pills)',
                      fontSize: '10px',
                      fontFamily: 'var(--font-geistmono)',
                      background: 'rgba(34, 211, 238, 0.1)',
                      border: '1px solid rgba(34, 211, 238, 0.25)',
                      color: 'var(--cyan)'
                    }}>
                      {member.role || 'Flex'}
                    </span>

                    {canRemove && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.user_id, member.gamer_tag || member.username)}
                        disabled={removingMemberId === member.user_id}
                        title="Remove member from squad"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <UserMinus size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* INVITE TEAMMATE MODAL */}
      <InviteTeammateModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        squad={squad}
        onMemberInvited={() => {
          if (onSquadUpdated) onSquadUpdated();
        }}
      />
    </div>
  );
}
