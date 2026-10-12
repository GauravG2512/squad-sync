import React, { useState, useEffect } from 'react';
import apiClient from './api/client';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import AuthModal from './components/auth/AuthModal';
import HeroLandingPage from './components/landing/HeroLandingPage';
import MatchmakerDashboard from './components/matchmaker/MatchmakerDashboard';
import FriendsHub from './components/friends/FriendsHub';
import SquadsHub from './components/squads/SquadsHub';
import NewsHub from './components/news/NewsHub';
import AdminDashboard from './components/admin/AdminDashboard';
import ChatDrawer from './components/chat/ChatDrawer';
import ProfileHub from './components/profile/ProfileHub';
import { 
  User, 
  LogOut, 
  Copy, 
  Check, 
  Shield, 
  Sparkles,
  Bot,
  MessageSquare
} from 'lucide-react';

function App() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('matchmaker');
  const [activeChatTarget, setActiveChatTarget] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(true);

  const handleOpenChat = (target) => {
    setActiveChatTarget(target);
  };

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(String(user.id));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const userDisplayName = user?.gamer_tag || user?.username || 'Gamer';
  const userInitials = userDisplayName.substring(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAVBAR WITH TOP NAVIGATION MENU BAR */}
      <Navbar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        isProfilePanelOpen={isProfilePanelOpen}
        onToggleProfilePanel={() => setIsProfilePanelOpen((prev) => !prev)}
      />

      {/* AUTHENTICATION MODAL */}
      <AuthModal />

      {/* MAIN CONTAINER */}
      {!isAuthenticated || activeTab === 'home' || activeTab === 'overview' ? (
        /* HOME / LANDING PAGE */
        <main style={{ flex: 1, width: '100%' }}>
          <HeroLandingPage 
            onGetStarted={() => setActiveTab('matchmaker')} 
            onSelectGame={() => setActiveTab('matchmaker')} 
          />
        </main>
      ) : (
        /* AUTHENTICATED USER: CENTERED DASHBOARD WITH FIXED RIGHT SIDE PANEL */
        <main style={{ flex: 1, width: '100%', paddingBottom: '60px', position: 'relative' }}>
          {/* CENTERED MAIN CONTENT AREA */}
          <div className="dashboardCenteredContainer">
            <div style={{ width: '100%', maxWidth: '1060px' }}>
              {activeTab === 'profile' && (
                <ProfileHub onRetakeDna={() => setActiveTab('matchmaker')} />
              )}

              {activeTab === 'matchmaker' && (
                <MatchmakerDashboard 
                  onNavigateTab={setActiveTab}
                  onOpenChat={handleOpenChat}
                />
              )}

              {activeTab === 'friends' && (
                <FriendsHub onOpenChat={handleOpenChat} />
              )}

              {activeTab === 'squads' && (
                <SquadsHub onOpenSquadChat={handleOpenChat} />
              )}

              {activeTab === 'news' && (
                <NewsHub />
              )}

              {activeTab === 'admin' && isAdmin && (
                <AdminDashboard />
              )}
            </div>
          </div>

          {/* DEDICATED RIGHT-HAND SIDE PANEL (USER PROFILE CARD & LOGOUT) */}
          {isProfilePanelOpen && (
            <aside 
              className="glassCard profileSidePanelFixed"
              style={{
                position: 'fixed',
                right: '24px',
                top: '88px',
                width: '320px',
                maxWidth: 'calc(100vw - 32px)',
                zIndex: 850,
                padding: '24px 20px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                borderRadius: '20px',
                background: 'rgba(13, 19, 33, 0.94)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(34, 211, 238, 0.15)',
                animation: 'slideInRight 0.25s ease-out',
              }}
            >
              {/* AVATAR & USER WELCOME */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '17px',
                    fontWeight: 800,
                    color: '#ffffff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    boxShadow: '0 0 20px rgba(34, 211, 238, 0.35)',
                    flexShrink: 0,
                  }}>
                    {userInitials}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                      Welcome back, {userDisplayName}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '2px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProfilePanelOpen(false)}
                  title="Close side panel"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    lineHeight: 1,
                  }}
                >
                  &times;
                </button>
              </div>

              {/* USER ID & VERIFICATION DETAILS */}
              <div style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>User ID:</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Click to copy ID"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#cbd5e1',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0,
                    }}
                  >
                    <span>{String(user?.id || '').substring(0, 10)}...</span>
                    {copiedId ? <Check size={12} color="#2ed573" /> : <Copy size={12} color="#94a3b8" />}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Account Status:</span>
                  <span className="matchBadge" style={{
                    color: '#2ed573',
                    borderColor: '#2ed573',
                    background: 'rgba(46, 213, 115, 0.12)',
                    padding: '2px 8px',
                    fontSize: '10px'
                  }}>
                    ● Session Verified
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS: GAMER PROFILE & DNA + LOGOUT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  className="glassBtn"
                  onClick={() => setActiveTab('profile')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    justifyContent: 'center',
                    color: activeTab === 'profile' ? '#22d3ee' : '#ffffff',
                    background: activeTab === 'profile' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: activeTab === 'profile' ? 'rgba(34, 211, 238, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <User size={15} color="#22d3ee" />
                  <span>Gamer Profile & DNA</span>
                </button>

                <button
                  type="button"
                  className="glassBtn logoutBtn"
                  onClick={logout}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    justifyContent: 'center',
                    color: '#ff6b6b',
                    borderColor: 'rgba(255, 107, 107, 0.3)',
                    background: 'rgba(255, 107, 107, 0.08)',
                  }}
                >
                  <LogOut size={15} color="#ff6b6b" />
                  <span>Sign Out / Logout</span>
                </button>
              </div>
            </aside>
          )}
        </main>
      )}

      {/* REAL-TIME CHAT DOCK (SRS 4.8) */}
      <ChatDrawer
        activeChatTarget={activeChatTarget}
        onCloseTarget={() => setActiveChatTarget(null)}
      />

      {/* FOOTER */}
      {isAuthenticated && (
        <footer style={{
          padding: '24px 40px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '12px',
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '0.2px',
        }}>
          v1.0.0 &nbsp;|&nbsp; IEEE 830 Specification &nbsp;|&nbsp; Squad Sync AI Platform
        </footer>
      )}
    </div>
  );
}

export default App;
