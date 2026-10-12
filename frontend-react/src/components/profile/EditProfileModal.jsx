import React, { useState, useEffect } from 'react';
import { profileApi } from '../../api/profileApi';
import { X, Save, Loader2, Sparkles, Gamepad2, Shield, Globe, Clock, MessageSquare, User, Upload, Camera, CheckCircle2 } from 'lucide-react';
import { getAvatarSrc } from '../../api/client';

const POPULAR_GAMES = [
  'Valorant',
  'CS2',
  'Apex Legends',
  'Rainbow Six Siege',
  'Dota 2',
  'Call of Duty'
];

const POPULAR_ROLES = [
  'Duelist',
  'Initiator',
  'Controller',
  'Sentinel',
  'Support',
  'Entry Fragger',
  'Shotcaller',
  'Flex'
];

const REGIONS = [
  'NA-East',
  'NA-West',
  'EU-Central',
  'EU-West',
  'AP-South (Mumbai)',
  'AP-East (Tokyo)',
  'AP-Southeast (Singapore)',
  'SA-Brazil',
  'Oceania'
];

const LANGUAGES = [
  'English',
  'Spanish',
  'German',
  'French',
  'Japanese',
  'Korean',
  'Hindi',
  'Portuguese'
];

export default function EditProfileModal({ isOpen, onClose, currentProfile, onProfileSaved }) {
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    region: 'NA-East',
    language: 'English',
    preferred_games: ['Valorant'],
    preferred_roles: ['Duelist'],
    availability: '',
    rank: '',
    avatar: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState(false);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image exceeds the 5MB file size limit.');
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    setAvatarUploadSuccess(false);

    try {
      const res = await profileApi.uploadAvatar(file);
      const updatedProfile = res?.data || res;
      const newAvatarUrl = updatedProfile?.avatar || updatedProfile?.avatar_url;
      if (newAvatarUrl) {
        setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));
        setAvatarUploadSuccess(true);
        setTimeout(() => setAvatarUploadSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        display_name: currentProfile.display_name || currentProfile.full_name || '',
        bio: currentProfile.bio || '',
        region: currentProfile.region || 'NA-East',
        language: currentProfile.language || 'English',
        preferred_games: currentProfile.preferred_games?.length 
          ? currentProfile.preferred_games 
          : (currentProfile.favorite_game ? [currentProfile.favorite_game] : ['Valorant']),
        preferred_roles: currentProfile.preferred_roles?.length 
          ? currentProfile.preferred_roles 
          : (currentProfile.preferred_role ? [currentProfile.preferred_role] : ['Duelist']),
        availability: currentProfile.availability || currentProfile.gaming_schedule || '',
        rank: currentProfile.rank || '',
        avatar: currentProfile.avatar || currentProfile.avatar_url || ''
      });
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const toggleGame = (game) => {
    setFormData((prev) => {
      const exists = prev.preferred_games.includes(game);
      const updated = exists 
        ? prev.preferred_games.filter((g) => g !== game)
        : [...prev.preferred_games, game];
      return { ...prev, preferred_games: updated.length ? updated : [game] };
    });
  };

  const toggleRole = (role) => {
    setFormData((prev) => {
      const exists = prev.preferred_roles.includes(role);
      const updated = exists 
        ? prev.preferred_roles.filter((r) => r !== role)
        : [...prev.preferred_roles, role];
      return { ...prev, preferred_roles: updated.length ? updated : [role] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        display_name: formData.display_name.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        region: formData.region,
        language: formData.language,
        preferred_games: formData.preferred_games,
        preferred_roles: formData.preferred_roles,
        availability: formData.availability.trim() || undefined,
        rank: formData.rank.trim() || undefined,
        avatar: formData.avatar.trim() || undefined
      };

      const res = await profileApi.saveProfile(payload);
      const updatedData = res?.data || res;
      if (onProfileSaved) {
        onProfileSaved(updatedData);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err.message || 'Failed to save gamer profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modalOverlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="glassCard" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          position: 'relative',
          borderRadius: '24px',
          border: '1px solid rgba(34, 211, 238, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(34, 211, 238, 0.15)'
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
        >
          <X size={18} />
        </button>

        {/* MODAL HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.2))',
            border: '1px solid rgba(34, 211, 238, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22d3ee'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
              Edit Gamer Identity
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '2px 0 0 0' }}>
              Update your competitive preferences, roles, and gaming availability.
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#f43f5e',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* PROFILE PICTURE / AVATAR UPLOAD */}
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            flexWrap: 'wrap',
          }}>
            {/* Avatar Preview */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(34, 211, 238, 0.5)',
              boxShadow: '0 0 15px rgba(34, 211, 238, 0.25)',
              flexShrink: 0,
            }}>
              {formData.avatar ? (
                <img
                  src={getAvatarSrc(formData.avatar)}
                  alt="Profile Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {(formData.display_name || 'G').substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Avatar Controls */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Camera size={14} color="#22d3ee" /> Profile Picture / Avatar
              </label>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(34, 211, 238, 0.15)',
                    border: '1px solid rgba(34, 211, 238, 0.4)',
                    color: '#22d3ee',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Upload size={14} />
                  <span>{uploadingAvatar ? 'Uploading...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleAvatarFileChange}
                    disabled={uploadingAvatar}
                    style={{ display: 'none' }}
                  />
                </label>

                {avatarUploadSuccess && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2ed573' }}>
                    <CheckCircle2 size={14} /> Uploaded!
                  </span>
                )}
              </div>

              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  className="inputField"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="Or enter direct image URL (https://...)"
                  style={{ width: '100%', fontSize: '12px', padding: '6px 12px' }}
                />
              </div>
            </div>
          </div>

          {/* DISPLAY NAME & RANK */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <User size={14} color="#22d3ee" /> Display Name
              </label>
              <input
                type="text"
                className="inputField"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="e.g. ValkyrieMain"
                maxLength={100}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Shield size={14} color="#8b5cf6" /> Competitive Rank
              </label>
              <input
                type="text"
                className="inputField"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                placeholder="e.g. Radiant / Faceit Lvl 10"
                maxLength={50}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* BIO */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <MessageSquare size={14} color="#22d3ee" /> Gamer Bio & Playstyle Summary
            </label>
            <textarea
              className="inputField"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell squads about your communication style, favorite agent/hero, and competitive goals..."
              rows={3}
              maxLength={1000}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* REGION & LANGUAGE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Globe size={14} color="#22d3ee" /> Server Region
              </label>
              <select
                className="inputField"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                style={{ width: '100%' }}
              >
                {REGIONS.map((reg) => (
                  <option key={reg} value={reg} style={{ background: '#0a0e1a', color: '#fff' }}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Globe size={14} color="#8b5cf6" /> Primary Language
              </label>
              <select
                className="inputField"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                style={{ width: '100%' }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} style={{ background: '#0a0e1a', color: '#fff' }}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PREFERRED GAMES */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Gamepad2 size={14} color="#22d3ee" /> Preferred Game Titles
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {POPULAR_GAMES.map((game) => {
                const selected = formData.preferred_games.includes(game);
                return (
                  <button
                    type="button"
                    key={game}
                    onClick={() => toggleGame(game)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: selected ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: selected ? '1px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: selected ? '#22d3ee' : '#94a3b8',
                      boxShadow: selected ? '0 0 12px rgba(34, 211, 238, 0.25)' : 'none'
                    }}
                  >
                    {selected ? '✓ ' : '+ '}{game}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PREFERRED ROLES */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Shield size={14} color="#8b5cf6" /> Tactical Roles
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {POPULAR_ROLES.map((role) => {
                const selected = formData.preferred_roles.includes(role);
                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => toggleRole(role)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: selected ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: selected ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: selected ? '#c084fc' : '#94a3b8',
                      boxShadow: selected ? '0 0 12px rgba(139, 92, 246, 0.25)' : 'none'
                    }}
                  >
                    {selected ? '✓ ' : '+ '}{role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AVAILABILITY SCHEDULE */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Clock size={14} color="#22d3ee" /> Gaming Schedule & Active Hours
            </label>
            <input
              type="text"
              className="inputField"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              placeholder="e.g. Weekdays 8 PM – 12 AM EST, Weekends anytime"
              maxLength={255}
              style={{ width: '100%' }}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              className="glassBtn"
              onClick={onClose}
              disabled={saving}
              style={{ padding: '10px 20px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primaryBtn"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                minWidth: '140px',
                justifyContent: 'center'
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
