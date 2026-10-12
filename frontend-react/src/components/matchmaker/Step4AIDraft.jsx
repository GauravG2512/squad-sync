import React, { useState, useEffect, useCallback } from 'react';
import { matchmakerApi } from '../../api/matchmakerApi';
import ConfirmInviteModal from './ConfirmInviteModal';
import { Users, Bot, UserPlus, X, Sparkles, CheckCircle2, AlertCircle, Loader2, RefreshCw, Shield } from 'lucide-react';
import { triggerAppNotification } from '../../utils/audio';

export default function Step4AIDraft({ selectedGame, onNavigateTab, onOpenChat }) {
  const [bench, setBench] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [squad, setSquad] = useState([]);
  const [synergyScore, setSynergyScore] = useState(0);
  const [recommendation, setRecommendation] = useState('Draft verified players from the database to analyze live squad chemistry.');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState(null);
  const [createdSquad, setCreatedSquad] = useState(null);

  // Load real candidates from database
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Try fetching direct candidate pool
      const res = await matchmakerApi.getCandidates(selectedGame || 'Valorant');
      const candidates = res.data?.data || res.data || [];
      if (Array.isArray(candidates) && candidates.length > 0) {
        setBench(candidates);
        setLoading(false);
        return;
      }

      // 2. Fallback to recommendSquads if candidate pool empty
      const recRes = await matchmakerApi.recommendSquads({ game_name: selectedGame, squad_size: 4 });
      const recData = recRes?.data || recRes;
      if (recData?.top_squads?.[0]?.members?.length > 0) {
        const apiCandidates = recData.top_squads[0].members.map((m, idx) => ({
          id: m.user_id || String(idx + 10),
          name: m.username,
          role: m.assigned_role || m.primary_role || 'Duelist',
          desc: m.personality || 'Tactical Operator',
          match: Math.min(99, Math.round((m.win_rate || 50) + 40)),
          rank: m.rank || 'Diamond',
        }));
        setBench(apiCandidates);
      } else {
        setBench([]);
      }
    } catch (err) {
      console.warn('Failed to load database candidates:', err);
      setError('Could not connect to database candidates. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedGame]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Calculate synergy whenever squad changes
  useEffect(() => {
    async function evaluate() {
      if (squad.length === 0) {
        setSynergyScore(0);
        setRecommendation('Draft players from the pool to analyze squad role synergy.');
        return;
      }

      const rolesCount = {};
      squad.forEach((p) => {
        rolesCount[p.role] = (rolesCount[p.role] || 0) + 1;
      });
      const uniqueRoles = Object.keys(rolesCount).length;

      let score = 0;
      if (squad.length === 1) score = 35;
      else if (squad.length === 2) score = uniqueRoles === 2 ? 68 : 52;
      else if (squad.length === 3) score = uniqueRoles === 3 ? 86 : 72;
      else if (squad.length >= 4) {
        if (uniqueRoles >= 4) score = 98;
        else if (uniqueRoles === 3) score = 89;
        else score = 75;
      }

      // Try calling backend API for neural chemistry calculation
      if (squad.length >= 2) {
        try {
          const res = await matchmakerApi.evaluateTeam({
            roles: squad.map((s) => s.role),
            user_ids: squad.map((s) => s.id),
            player_ids: squad.map((s) => s.id),
            game_name: selectedGame || 'Valorant',
          });
          const compData = res.data?.data || res.data;
          if (compData?.compatibility_pct !== undefined) {
            score = Math.round(compData.compatibility_pct);
          } else if (compData?.synergy_score !== undefined) {
            score = Math.round(compData.synergy_score);
          }
          if (compData?.reasons && compData.reasons.length > 0) {
            setRecommendation(compData.reasons[0]);
            setSynergyScore(score);
            return;
          }
        } catch (err) {
          // Heuristic fallback
        }
      }

      setSynergyScore(score);

      // Intelligent recommendation text
      if (squad.length < 4) {
        const needed = 4 - squad.length;
        setRecommendation(`Draft ${needed} more player${needed > 1 ? 's' : ''} to optimize full team chemistry.`);
      } else if (uniqueRoles >= 4) {
        setRecommendation('Perfect Composition! Core tactical roles covered with balanced MMR variance and zero tilt risk.');
      } else if (rolesCount['Duelist'] > 1) {
        setRecommendation('High Duelist density detected. Consider swapping one Duelist for a Controller or Initiator for balanced utility.');
      } else {
        setRecommendation('Strong team foundation. Squad synergy is high and primed for competitive queue.');
      }
    }

    evaluate();
  }, [squad, selectedGame]);

  const handleAddPlayer = (candidate) => {
    if (squad.length >= 4) {
      alert('Squad is full! Remove a player to add a new candidate.');
      return;
    }
    if (squad.some((p) => p.id === candidate.id)) return;

    setSquad((prev) => [...prev, candidate]);
  };

  const handleRemoveSlot = (index) => {
    setSquad((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBroadcastComplete = (playerNames, squadObj) => {
    setBroadcastFeedback(`Real-time invitations sent to ${playerNames}. Squad created and roster initialized.`);
    if (squadObj) {
      setCreatedSquad(squadObj);
    }
    triggerAppNotification({
      id: `squad-deploy-${Date.now()}`,
      type: 'squad_created',
      title: 'Squad Deployed!',
      message: `Invitations sent to ${playerNames}. Ready for competitive queue.`,
      time: 'Just now',
      read: false,
    });
  };

  return (
    <div className="onboardingStep">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 className="sectionTitle" style={{ marginBottom: '8px' }}>
          STEP 4: AI SQUAD DRAFT & MATCHMAKING
        </h2>
        <p className="sectionSubtitle">
          Draft verified gamers from your <strong>{selectedGame}</strong> database to analyze live neural chemistry and assemble squads.
        </p>
      </div>

      <div className="builderLayout">
        {/* FREE AGENTS CANDIDATES BENCH */}
        <div className="glassCard playersBench">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={22} color="var(--cyan)" />
              Database Player Pool ({bench.length})
            </h3>
            <button
              type="button"
              className="glassBtn"
              onClick={loadCandidates}
              style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Refresh players from database"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text2)' }}>
              <Loader2 size={26} color="var(--cyan)" className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: '13px' }}>Loading real player profiles from database...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.08)', borderRadius: '12px' }}>
              <AlertCircle size={24} style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '13px' }}>{error}</p>
            </div>
          ) : bench.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ margin: '0 0 6px 0', color: 'var(--text2)', fontSize: '14px' }}>No other active players found in the database.</p>
              <span style={{ fontSize: '12px' }}>Make sure seed accounts are created or other users have registered.</span>
            </div>
          ) : (
            <div className="playerCardList">
              {bench.map((candidate) => {
                const isDrafted = squad.some((p) => p.id === candidate.id);
                return (
                  <div key={candidate.id} className="playerCard" style={{ padding: '14px 16px' }}>
                    {/* AVATAR */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      {candidate.avatar ? (
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '1px solid var(--border)',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(139, 92, 246, 0.25))',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#ffffff',
                            fontSize: '14px',
                            flexShrink: 0,
                          }}
                        >
                          {(candidate.name || 'P').substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="playerInfo" style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', color: '#ffffff' }}>{candidate.name}</h4>
                          <span
                            className="matchBadge"
                            style={{
                              background: 'rgba(46, 213, 115, 0.15)',
                              color: '#2ed573',
                              borderColor: '#2ed573',
                              fontSize: '11px',
                              padding: '2px 8px',
                            }}
                          >
                            {candidate.match}% Match
                          </span>
                          {candidate.rank && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: 'var(--cyan)',
                                border: '1px solid var(--border)',
                                fontFamily: 'var(--font-geistmono)',
                              }}
                            >
                              {candidate.rank}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <strong style={{ color: 'var(--cyan)' }}>{candidate.role}</strong> • {candidate.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="addPlayerBtn"
                      onClick={() => handleAddPlayer(candidate)}
                      disabled={isDrafted}
                      style={{
                        marginLeft: '12px',
                        padding: '8px 14px',
                        fontSize: '12px',
                        flexShrink: 0,
                        background: isDrafted ? 'rgba(255, 255, 255, 0.05)' : 'var(--cyan)',
                        color: isDrafted ? 'var(--text-muted)' : '#000000',
                        border: isDrafted ? '1px solid var(--border)' : 'none',
                        fontWeight: 600,
                      }}
                    >
                      {isDrafted ? 'In Squad' : '+ Add to Squad'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTIVE SQUAD ROSTER & SYNERGY METER */}
        <div className="glassCard squadArea">
          <h3>
            <Users size={22} color="var(--cyan)" />
            Your Active Squad Roster ({squad.length}/4 Slots)
          </h3>

          <div id="teamSlots">
            {[0, 1, 2, 3].map((index) => {
              const player = squad[index];
              if (player) {
                return (
                  <div key={index} className="slot filled">
                    <h4>{player.name}</h4>
                    <p style={{ color: 'var(--cyan)', fontWeight: 600 }}>{player.role}</p>
                    <button
                      type="button"
                      className="removeSlotBtn"
                      onClick={() => handleRemoveSlot(index)}
                      title="Remove from squad"
                    >
                      &times;
                    </button>
                  </div>
                );
              }
              return (
                <div key={index} className="slot">
                  Empty Slot
                </div>
              );
            })}
          </div>

          {/* SYNERGY METER */}
          <div className="synergyBox">
            <h2>Predicted Squad Synergy</h2>
            <div className="bigScore">{synergyScore}%</div>

            <div className="progressLarge">
              <div
                style={{
                  height: '100%',
                  width: `${synergyScore}%`,
                  background: 'linear-gradient(90deg, var(--cyan), var(--violet))',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.8s ease',
                  boxShadow: '0 0 15px var(--cyan-glow)',
                }}
              />
            </div>

            <div className="recommendation">
              <strong>AI Recommendation</strong>
              <p>{recommendation}</p>
            </div>

            <button
              type="button"
              className="primaryBtn largeBtn fullWidth"
              onClick={() => {
                if (squad.length === 0) {
                  alert('Please draft at least one player into your roster before sending join requests!');
                  return;
                }
                setIsConfirmModalOpen(true);
              }}
              style={{ marginTop: '22px' }}
            >
              Send Join Request to All Selected Players
            </button>

            {broadcastFeedback && (
              <div
                className="glassCard"
                style={{
                  marginTop: '16px',
                  padding: '18px 20px',
                  borderColor: '#2ed573',
                  background: 'rgba(46, 213, 115, 0.12)',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#2ed573',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <h4 style={{ color: '#2ed573', margin: 0, fontSize: '15px', fontWeight: 700 }}>
                      Squad Deployed Successfully!
                    </h4>
                    <p style={{ color: 'var(--text2)', margin: '4px 0 0 0', fontSize: '13px' }}>
                      {broadcastFeedback}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {onNavigateTab && (
                    <button
                      type="button"
                      className="primaryBtn"
                      onClick={() => onNavigateTab('squads')}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      View in My Squads →
                    </button>
                  )}
                  {onOpenChat && (
                    <button
                      type="button"
                      className="glassBtn"
                      onClick={() =>
                        onOpenChat({
                          type: 'team',
                          id: createdSquad?.id,
                          name: createdSquad?.name || `${selectedGame} Squad`,
                          role: selectedGame,
                        })
                      }
                      style={{ padding: '6px 14px', fontSize: '12px', color: '#22d3ee' }}
                    >
                      Open Squad Tactical Chat 💬
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <ConfirmInviteModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        squad={squad}
        selectedGame={selectedGame}
        synergyScore={synergyScore}
        onBroadcastComplete={handleBroadcastComplete}
      />
    </div>
  );
}
