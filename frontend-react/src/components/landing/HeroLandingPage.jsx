import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bot, 
  Shield, 
  Zap, 
  Sparkles, 
  Users, 
  ArrowRight, 
  Star,
  CheckCircle2,
  Radio,
  Crosshair
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

const GAMES = [
  { id: 'VALORANT', name: 'VALORANT', logo: '/assets/game-logo/VALO.png', tag: 'Tactical 5v5' },
  { id: 'Apex Legends', name: 'Apex Legends', logo: '/assets/game-logo/APEX Legends.png', tag: 'Battle Royale' },
  { id: 'Rainbow Six Siege', name: 'Rainbow Six Siege', logo: '/assets/game-logo/Rainbow Six.png', tag: 'Siege & Breach' },
  { id: 'CS2', name: 'Counter Strike 2', logo: '/assets/game-logo/CS2.png', tag: 'Defuse 5v5' },
  { id: 'Call of Duty', name: 'Call of Duty', logo: '/assets/game-logo/COD.png', tag: 'Warzone FPS' },
  { id: 'PUBG', name: 'PUBG', logo: '/assets/game-logo/pubg-logo.svg', tag: 'Squad Survival' },
];

const FEATURES = [
  {
    icon: <Bot size={24} color="#22d3ee" />,
    title: 'Neural Gamer DNA™',
    desc: 'Analyzes 18 behavioral vectors including comms frequency, clutch composure, aggression profile, and agent versatility to construct mathematically synergistic rosters.',
  },
  {
    icon: <Shield size={24} color="#8b5cf6" />,
    title: 'Zero Toxicity Guarantee',
    desc: 'Pre-queue sentiment analysis and historical tilt telemetry filter out rage-quitters, blame-throwers, and toxic teammates before you ever enter agent select.',
  },
  {
    icon: <Radio size={24} color="#10b981" />,
    title: 'Live Voice Comms & Telemetry',
    desc: 'Instant low-latency WebSocket party channels with automated push-to-talk integration and live in-game role coordination telemetry.',
  },
];

const REVIEWS = [
  {
    name: 'PhoenixCarry',
    rank: 'Immortal 2 • VALORANT',
    quote: 'Solo queue was an absolute nightmare before SquadSync. In 4 matches I found a permanent Controller and Sentinel duo. Synergy is 10x better.',
    rating: 5,
  },
  {
    name: 'ValkyrieApex',
    rank: 'Apex Predator • Apex',
    quote: 'Zero tilt lobbies are real. The behavioral DNA matching accurately paired me with proactive comms players who actually play for the team.',
    rating: 5,
  },
  {
    name: 'SovaIntel',
    rank: 'FaceIT Level 10 • CS2',
    quote: 'The AI draft bench calculates role distribution flawlessly. No more 3 AWPers or 4 Duelists fighting for the same pick.',
    rating: 5,
  },
];

export default function HeroLandingPage({ onGetStarted, onSelectGame }) {
  const { isAuthenticated, openRegisterModal } = useAuth();
  const [liveSynergy, setLiveSynergy] = useState('96.4%');
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });

  // Interactive Draggable Controller State
  const [controllerDrag, setControllerDrag] = useState({ x: 0, y: 0 });
  const [isDraggingController, setIsDraggingController] = useState(false);
  const dragOriginRef = useRef({ startX: 0, startY: 0, initX: 0, initY: 0 });

  const handleControllerMouseDown = (e) => {
    if (e.button !== 0) return; // left click only
    setIsDraggingController(true);
    dragOriginRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: controllerDrag.x,
      initY: controllerDrag.y,
    };
    e.preventDefault();
  };

  const handleControllerTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDraggingController(true);
    dragOriginRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initX: controllerDrag.x,
      initY: controllerDrag.y,
    };
  };

  useEffect(() => {
    if (!isDraggingController) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - dragOriginRef.current.startX;
      const dy = e.clientY - dragOriginRef.current.startY;
      setControllerDrag({
        x: dragOriginRef.current.initX + dx,
        y: dragOriginRef.current.initY + dy,
      });
    };

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragOriginRef.current.startX;
      const dy = touch.clientY - dragOriginRef.current.startY;
      setControllerDrag({
        x: dragOriginRef.current.initX + dx,
        y: dragOriginRef.current.initY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDraggingController(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingController]);

  // Real-time live match synergy simulation (fluctuates between 95% and 98%)
  useEffect(() => {
    const timer = setInterval(() => {
      const randomSynergy = (95.2 + Math.random() * 2.8).toFixed(1);
      setLiveSynergy(`${randomSynergy}%`);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Ambient cursor glow tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleActionClick = () => {
    if (isAuthenticated) {
      if (onGetStarted) onGetStarted();
    } else {
      openRegisterModal();
    }
  };

  const scrollToGames = () => {
    const el = document.getElementById('games');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>
      {/* CURSOR GLOW */}
      <div
        className="cursorGlow"
        id="cursorGlow"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />

      {/* =========================================
          HERO SECTION (BALANCED & PROPORTIONATE)
      ========================================= */}
      <section id="hero" className="hero">
        <div className="heroInner">
          {/* HERO LEFT COLUMN */}
          <div className="heroContent">
            {/* TAG */}
            <p className="tag">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              AI-POWERED TEAMMATE MATCHMAKING
            </p>

            {/* MAIN HEADLINE */}
            <h1>
              DOMINATE<br />
              EVERY LOBBY.<br />
              <span>ZERO TOXICITY.</span>
            </h1>

            {/* HERO BODY TEXT */}
            <p className="heroText">
              Squad Sync analyzes your Gamer DNA™, communication style, competitive mindset, preferred roles, schedule, and playstyle to build the perfect, high-synergy squad in seconds.
            </p>

            {/* HERO BUTTONS */}
            <div className="heroButtons">
              <button
                type="button"
                className="primaryBtn largeBtn"
                id="heroGetStartedBtn"
                onClick={handleActionClick}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
              >
                <span>{isAuthenticated ? 'Enter AI Matchmaker' : 'Create Free Profile'}</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="glassBtn largeBtn"
                onClick={scrollToGames}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Crosshair size={16} color="var(--cyan)" />
                <span>Explore Titles</span>
              </button>
            </div>

            {/* ACTIVE GAMERS TRUST PILL */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 18px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex' }}>
                {['PH', 'OM', 'SV', 'CY'].map((initials, idx) => (
                  <div key={idx} style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: idx % 2 === 0 ? 'linear-gradient(135deg, #22d3ee, #0284c7)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    border: '2px solid #060911',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginLeft: idx === 0 ? 0 : '-7px',
                  }}>
                    {initials}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                <strong style={{ color: '#22d3ee' }}>14+ Real Gamers</strong> in queue
              </div>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            </div>

            {/* HERO FEATURE PILLARS MICRO-GRID (BALANCING THE BOTTOM-LEFT VOID) */}
            <div className="heroPillarsGrid">
              <div className="heroPillarCard">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(34, 211, 238, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#22d3ee'
                  }}>
                    <Bot size={15} />
                  </div>
                  <strong style={{ fontSize: '13px', color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Neural DNA™
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                  18-factor behavioral playstyle & role telemetry.
                </p>
              </div>

              <div className="heroPillarCard">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8b5cf6'
                  }}>
                    <Shield size={15} />
                  </div>
                  <strong style={{ fontSize: '13px', color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Zero Toxicity
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                  Tilt-free lobbies with temperament matching.
                </p>
              </div>

              <div className="heroPillarCard">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981'
                  }}>
                    <Zap size={15} />
                  </div>
                  <strong style={{ fontSize: '13px', color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Sub-Second Sync
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                  Instant party formation with live voice channels.
                </p>
              </div>
            </div>
          </div>

          {/* HERO RIGHT (FLOATING CONTROLLER & LIVE PLAYERS & SQUADS CARD) */}
          <div className="heroRight">
            {/* FLOATING & DRAGGABLE CONTROLLER */}
            <div 
              className="controllerFloat"
              onMouseDown={handleControllerMouseDown}
              onTouchStart={handleControllerTouchStart}
              style={{
                transform: `translate(${controllerDrag.x}px, ${controllerDrag.y}px) ${isDraggingController ? 'scale(1.08) rotate(3deg)' : ''}`,
                cursor: isDraggingController ? 'grabbing' : 'grab',
                animation: isDraggingController || controllerDrag.x !== 0 || controllerDrag.y !== 0 ? 'none' : undefined,
                pointerEvents: 'auto',
                userSelect: 'none',
                zIndex: 100,
                transition: isDraggingController ? 'none' : 'transform 0.15s ease-out',
              }}
              title="Click & drag the controller anywhere!"
            >
              <img 
                src="/assets/Controller.png" 
                alt="Squad Sync Controller" 
                draggable={false}
                style={{ userSelect: 'none', pointerEvents: 'none', width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* PREVIEW CARD: LIVE PLAYERS & SQUADS */}
            <div className="previewCard glassCard">
              <div className="liveHeader">
                <div className="liveDot" />
                <h4>LIVE PLAYERS & SQUADS</h4>
              </div>

              <div className="matchScore" style={{ margin: '14px 0 16px' }}>
                <div>
                  <h1 style={{ color: 'var(--cyan)' }}>14+</h1>
                  <p>Live Gamers</p>
                </div>
                <div className="divider" />
                <div>
                  <h1 style={{ color: 'var(--violet)' }}>6</h1>
                  <p>Active Squads</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px', textAlign: 'left' }}>
                <div style={{
                  padding: '9px 12px',
                  borderRadius: '12px',
                  background: 'rgba(34, 211, 238, 0.08)',
                  border: '1px solid rgba(34, 211, 238, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>Phantom Vanguards</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>VALORANT • 4/5 Roster</span>
                  </div>
                  <span className="matchBadge" style={{ fontSize: '10px', background: 'rgba(46, 213, 115, 0.15)', color: '#2ed573', borderColor: '#2ed573' }}>
                    96% Synergy
                  </span>
                </div>

                <div style={{
                  padding: '9px 12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>PhoenixCarry</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Duelist • Diamond 2</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600 }}>
                    Ready to Queue
                  </span>
                </div>
              </div>

              <div className="progress">
                <div className="progressFill" id="liveMatchProgress" style={{ width: '96%' }} />
              </div>

              <div className="matchInfo">
                <p>Team Synergy <strong id="heroSynergy">{liveSynergy}</strong></p>
                <p>Matchmaking Latency <strong>&lt; 100ms</strong></p>
                <p>Voice Comms <strong>Active</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SUPPORTED GAMES SECTION
      ========================================= */}
      <section id="games" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <h2 className="sectionTitle">SUPPORTED GAMES</h2>
        <p className="sectionSubtitle">Cross-platform intelligence tailored for top competitive titles.</p>

        <div className="gameScroller">
          {GAMES.map((game) => (
            <div
              key={game.id}
              className="game glassCard"
              onClick={() => onSelectGame && onSelectGame(game.id)}
              title={`Matchmake in ${game.name}`}
            >
              <div className="gameIcon">
                <img src={game.logo} alt={`${game.name} Logo`} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{game.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 500 }}>{game.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          FEATURES SECTION (WHY SQUAD SYNC?)
      ========================================= */}
      <section id="features" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 24px' }}>
        <h2 className="sectionTitle">WHY SQUAD SYNC?</h2>
        <p className="sectionSubtitle">Engineered from the ground up for high-ELO competitive players tired of coin-flip lobbies.</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginTop: '36px',
        }}>
          {FEATURES.map((feat, idx) => (
            <div 
              key={idx}
              className="glassCard"
              style={{
                padding: '32px 28px',
                borderRadius: '20px',
                background: 'rgba(13, 19, 33, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '20px', color: '#ffffff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          COMMUNITY REVIEWS / VOICES FROM THE LOBBY
      ========================================= */}
      <section id="reviews" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 24px' }}>
        <h2 className="sectionTitle">TESTED BY COMPETITIVE PLAYERS</h2>
        <p className="sectionSubtitle">Hear how real squads climbed ranks using our AI matchmaking engine.</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginTop: '36px',
        }}>
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="glassCard"
              style={{
                padding: '28px 24px',
                borderRadius: '20px',
                background: 'rgba(13, 19, 33, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                "{rev.quote}"
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <strong style={{ fontSize: '14px', color: '#ffffff', display: 'block', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {rev.name}
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--cyan)' }}>
                  {rev.rank}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          CALL TO ACTION (CTA)
      ========================================= */}
      <section className="cta" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 24px' }}>
        <div className="glassCard ctaBox" style={{ textAlign: 'center', padding: '60px 32px', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '38px', marginBottom: '14px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            Ready to Build Your Dream Squad?
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 28px', color: '#94a3b8', fontSize: '16px' }}>
            Join competitive gamers using AI-powered matchmaking to climb ranks with zero toxicity.
          </p>
          <button
            type="button"
            className="primaryBtn largeBtn"
            onClick={handleActionClick}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 36px' }}
          >
            <span>{isAuthenticated ? 'Launch AI Matchmaker' : 'Create Free Profile'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* =========================================
          FOOTER
      ========================================= */}
      <footer>
        <div className="footerLogo" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={logoImg} 
            alt="SquadSync Logo" 
            style={{ 
              height: '36px', 
              width: 'auto', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 14px rgba(34, 211, 238, 0.45))' 
            }} 
          />
          <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
            Squad<span style={{ color: 'var(--cyan)' }}>Sync</span>
          </span>
        </div>
        <div className="footerLinks">
          <a href="#hero">Overview</a>
          <a href="#games">Games</a>
          <a href="#features">Features</a>
          <a href="#reviews">Reviews</a>
          <a href="https://discord.gg" target="_blank" rel="noopener noreferrer">Join Discord</a>
          <a href="#">Support</a>
        </div>
        <p>© 2026 Squad Sync. Built for Competitive Gamers.</p>
      </footer>
    </div>
  );
}
