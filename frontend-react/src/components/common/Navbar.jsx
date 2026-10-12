import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Bot, 
  Users, 
  Shield, 
  Newspaper, 
  ShieldAlert 
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import logoImg from '../../assets/logo.png';

export default function Navbar({ activeTab, onSelectTab, isProfilePanelOpen, onToggleProfilePanel }) {
  const { user, isAuthenticated, isAdmin, openLoginModal, openRegisterModal } = useAuth();
  const userDisplayName = user?.gamer_tag || user?.username || 'Gamer';
  const userInitials = userDisplayName.substring(0, 2).toUpperCase();

  return (
    <nav id="navbar">
      <div className="navbarContainer">
        {/* BRAND LOGO */}
        <div 
          className="logo" 
          onClick={() => {
            if (onSelectTab) onSelectTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
        >
          <img 
            src={logoImg} 
            alt="SquadSync Logo" 
            className="brandLogoImg"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <h2 style={{ fontSize: '20px', margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px' }}>
            Squad<span style={{ color: 'var(--cyan)' }}>Sync</span>
          </h2>
        </div>

      {/* TOP NAVIGATION MENU BAR (AUTHENTICATED) */}
      {isAuthenticated ? (
        <div 
          className="topNavMenu"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '4px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            overflowX: 'auto',
            maxWidth: 'calc(100vw - 320px)',
          }}
        >
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: activeTab === 'profile' ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid transparent',
              background: activeTab === 'profile' ? 'rgba(34, 211, 238, 0.12)' : 'transparent',
              color: activeTab === 'profile' ? '#ffffff' : '#94a3b8',
              fontSize: '13px',
              fontWeight: activeTab === 'profile' ? 600 : 500,
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <User size={15} color={activeTab === 'profile' ? '#22d3ee' : '#94a3b8'} />
            <span>Gamer Profile & DNA</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('matchmaker')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: activeTab === 'matchmaker' ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid transparent',
              background: activeTab === 'matchmaker' ? 'rgba(34, 211, 238, 0.12)' : 'transparent',
              color: activeTab === 'matchmaker' ? '#ffffff' : '#94a3b8',
              fontSize: '13px',
              fontWeight: activeTab === 'matchmaker' ? 600 : 500,
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Bot size={15} color={activeTab === 'matchmaker' ? '#22d3ee' : '#94a3b8'} />
            <span>AI Matchmaker</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('friends')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: activeTab === 'friends' ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid transparent',
              background: activeTab === 'friends' ? 'rgba(34, 211, 238, 0.12)' : 'transparent',
              color: activeTab === 'friends' ? '#ffffff' : '#94a3b8',
              fontSize: '13px',
              fontWeight: activeTab === 'friends' ? 600 : 500,
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Users size={15} color={activeTab === 'friends' ? '#22d3ee' : '#94a3b8'} />
            <span>Friends & Network</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('squads')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: activeTab === 'squads' ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid transparent',
              background: activeTab === 'squads' ? 'rgba(34, 211, 238, 0.12)' : 'transparent',
              color: activeTab === 'squads' ? '#ffffff' : '#94a3b8',
              fontSize: '13px',
              fontWeight: activeTab === 'squads' ? 600 : 500,
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Shield size={15} color={activeTab === 'squads' ? '#22d3ee' : '#94a3b8'} />
            <span>My Squads</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('news')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: activeTab === 'news' ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid transparent',
              background: activeTab === 'news' ? 'rgba(34, 211, 238, 0.12)' : 'transparent',
              color: activeTab === 'news' ? '#ffffff' : '#94a3b8',
              fontSize: '13px',
              fontWeight: activeTab === 'news' ? 600 : 500,
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Newspaper size={15} color={activeTab === 'news' ? '#22d3ee' : '#94a3b8'} />
            <span>Esports & News</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: activeTab === 'admin' ? '1px solid rgba(255, 99, 99, 0.5)' : '1px solid transparent',
                background: activeTab === 'admin' ? 'rgba(255, 99, 99, 0.15)' : 'transparent',
                color: activeTab === 'admin' ? '#ff6363' : '#ff8585',
                fontSize: '13px',
                fontWeight: activeTab === 'admin' ? 600 : 500,
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <ShieldAlert size={15} color="#ff6363" />
              <span>Admin Hub</span>
            </button>
          )}
        </div>
      ) : null}

      {/* RIGHT ACTION BUTTONS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Real-Time Notification Bell */}
            <NotificationDropdown onNavigateTab={onSelectTab} />

            {/* Profile Side Panel Toggle Button */}
            <button
              type="button"
              onClick={onToggleProfilePanel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '12px',
                background: isProfilePanelOpen ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isProfilePanelOpen ? 'rgba(34, 211, 238, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                color: '#ffffff',
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
              title="Toggle Profile Side Panel"
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
                color: '#ffffff',
              }}>
                {userInitials}
              </div>
              <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userDisplayName}
              </span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="glassBtn"
              id="loginNavBtn"
              onClick={openLoginModal}
            >
              Login
            </button>
            <button
              type="button"
              className="primaryBtn"
              id="registerNavBtn"
              onClick={openRegisterModal}
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  </nav>
  );
}
