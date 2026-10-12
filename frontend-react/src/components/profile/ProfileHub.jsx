import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profileApi';
import GamerDnaCardView from './GamerDnaCardView';
import EditProfileModal from './EditProfileModal';
import GameAccountsSection from './GameAccountsSection';
import { getAvatarSrc } from '../../api/client';
import { 
  User, 
  Edit3, 
  RefreshCw, 
  Gamepad2, 
  Shield, 
  Clock, 
  Globe, 
  MessageSquare, 
  Link2, 
  CheckCircle2, 
  ExternalLink,
  Plus,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function ProfileHub({ onRetakeDna }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [dnaCard, setDnaCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfileData = async () => {
    try {
      const [profileRes, dnaRes, accountsRes] = await Promise.allSettled([
        profileApi.getProfile(),
        profileApi.getDnaCard(),
        profileApi.getLinkedAccounts(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value?.data || profileRes.value);
      } else {
        // Fallback default from user session
        setProfile({
          display_name: user?.gamer_tag || user?.username,
          region: 'NA-East',
          language: 'English',
          preferred_games: ['Valorant'],
          preferred_roles: ['Duelist'],
          bio: 'Competitive gamer on SquadSync.',
        });
      }

      if (dnaRes.status === 'fulfilled') {
        setDnaCard(dnaRes.value?.data || dnaRes.value);
      }

      if (accountsRes.status === 'fulfilled') {
        setLinkedAccounts(accountsRes.value?.data || accountsRes.value || []);
      }
    } catch (err) {
      console.warn('Profile fetch warning:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleProfileSaved = (updated) => {
    setProfile(updated);
    fetchProfileData();
  };

  const displayName = profile?.display_name || user?.gamer_tag || user?.username || 'Operator';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
      {/* TOP HERO PROFILE BANNER */}
      <div className="glassCard" style={{
        padding: '32px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(34, 211, 238, 0.25)',
        background: 'linear-gradient(135deg, rgba(13, 19, 33, 0.95), rgba(20, 28, 48, 0.9))'
      }}>
        {/* AMBIENT BACKLIGHT */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '100px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15), transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', position: 'relative' }}>
          {/* AVATAR & BASIC DETAILS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow: '0 0 25px rgba(34, 211, 238, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {(profile?.avatar || profile?.avatar_url) ? (
                <img
                  src={getAvatarSrc(profile?.avatar || profile?.avatar_url)}
                  alt={displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#10b981',
                border: '3px solid #060911',
                boxShadow: '0 0 8px #10b981'
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: 0,
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '-0.5px'
                }}>
                  {displayName}
                </h1>
                <span className="matchBadge" style={{
                  background: 'rgba(34, 211, 238, 0.15)',
                  borderColor: '#22d3ee',
                  color: '#22d3ee'
                }}>
                  ● Verified Gamer
                </span>
                {profile?.rank && (
                  <span className="matchBadge" style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    borderColor: '#8b5cf6',
                    color: '#c084fc'
                  }}>
                    {profile.rank}
                  </span>
                )}
              </div>

              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '6px 0 0 0' }}>
                @{user?.username || 'user'} • {user?.email} • Region: <strong style={{ color: '#ffffff' }}>{profile?.region || 'Global'}</strong>
              </p>

              {profile?.bio && (
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '13px',
                  margin: '10px 0 0 0',
                  maxWidth: '650px',
                  lineHeight: 1.5,
                  fontStyle: 'italic'
                }}>
                  "{profile.bio}"
                </p>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="glassBtn"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            >
              <RefreshCw size={14} className={refreshing ? 'spinner' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="primaryBtn"
              onClick={() => setIsEditModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px' }}
            >
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID: GAMER DNA™ VS SETUP & ACCOUNTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px' }}>
        {/* LEFT COLUMN: GAMER DNA™ CARD */}
        <div>
          <GamerDnaCardView 
            dnaCard={dnaCard} 
            user={user}
            onRetakeSurvey={onRetakeDna} 
            loading={loading} 
          />
        </div>

        {/* RIGHT COLUMN: COMPETITIVE SETUP & LINKED ACCOUNTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* COMPETITIVE GAMING SETUP */}
          <div className="glassCard" style={{ padding: '28px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(34, 211, 238, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22d3ee'
                }}>
                  <Gamepad2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Competitive Gaming Specs
                  </h3>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>Tactical roster preferences</span>
                </div>
              </div>

              <button
                type="button"
                className="glassBtn"
                onClick={() => setIsEditModalOpen(true)}
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                Modify
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* PREFERRED GAMES */}
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                  Target Competitive Titles
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {profile?.preferred_games?.length > 0 ? (
                    profile.preferred_games.map((game) => (
                      <span key={game} style={{
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        background: 'rgba(34, 211, 238, 0.1)',
                        border: '1px solid rgba(34, 211, 238, 0.3)',
                        color: '#22d3ee',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        🎮 {game}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '13px' }}>No titles selected</span>
                  )}
                </div>
              </div>

              {/* PREFERRED ROLES */}
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                  Preferred Combat Roles
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {profile?.preferred_roles?.length > 0 ? (
                    profile.preferred_roles.map((role) => (
                      <span key={role} style={{
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.35)',
                        color: '#c084fc',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        🛡️ {role}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '13px' }}>No preferred roles specified</span>
                  )}
                </div>
              </div>

              {/* AVAILABILITY SCHEDULE */}
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Availability & Active Hours
                </span>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Clock size={16} color="#22d3ee" />
                  <span style={{ fontSize: '13px', color: profile?.availability ? '#ffffff' : '#64748b' }}>
                    {profile?.availability || 'Flexible schedule / not configured'}
                  </span>
                </div>
              </div>

              {/* LANGUAGE & REGION */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Primary Language</span>
                  <strong style={{ fontSize: '13px', color: '#ffffff' }}>{profile?.language || 'English'}</strong>
                </div>

                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Matchmaking Region</span>
                  <strong style={{ fontSize: '13px', color: '#ffffff' }}>{profile?.region || 'NA-East'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* VERIFIED GAME ACCOUNTS & TELEMETRY SECTION */}
          <GameAccountsSection onAccountUpdated={fetchProfileData} />
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={profile}
        onProfileSaved={handleProfileSaved}
      />
    </div>
  );
}
