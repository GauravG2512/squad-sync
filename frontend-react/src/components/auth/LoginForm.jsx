import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';
import { playLoginErrorSound } from '../../utils/audio';

export default function LoginForm() {
  const { login, setAuthModalMode } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsSubmitting(true);

    try {
      await login(emailOrUsername, password);
    } catch (err) {
      playLoginErrorSound();
      setStatus({
        type: 'error',
        message: err.message || 'Invalid email or password.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ fontSize: '26px', marginBottom: '8px', color: '#fff' }}>Welcome Back</h2>
      <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px' }}>
        Log in to access your Gamer DNA™ & Squad Matchmaker.
      </p>

      {status.message && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: status.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(46, 213, 115, 0.15)',
          border: `1px solid ${status.type === 'error' ? 'var(--rose)' : '#2ed573'}`,
          color: status.type === 'error' ? 'var(--rose)' : '#2ed573',
          fontSize: '13px',
          marginBottom: '20px',
        }}>
          <AlertCircle size={16} />
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="inputGroup">
          <label>Email Address or Username</label>
          <input
            type="text"
            required
            placeholder="gamer@squadsync.gg or GamerTag"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
          />
        </div>

        <div className="inputGroup">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ margin: 0 }}>Password</label>
            <button
              type="button"
              onClick={() => setAuthModalMode('forgot')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--cyan)',
                fontSize: '12px',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="primaryBtn fullWidth"
          disabled={isSubmitting}
          style={{ marginTop: '12px', padding: '14px' }}
        >
          {isSubmitting ? (
            'Connecting to SquadSync...'
          ) : (
            <>
              <LogIn size={18} />
              Log In
            </>
          )}
        </button>

        {/* QUICK DEMO ACCOUNTS HELPER */}
        <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick 1-Click Demo Login:
            </span>
            <span style={{ fontSize: '10px', color: 'var(--cyan)', fontFamily: 'var(--font-geistmono)' }}>
              Pass: password123
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="glassBtn"
              onClick={() => {
                setEmailOrUsername('ProGamer');
                setPassword('password123');
              }}
              title="Demo Account (All-Rounder / Team Captain)"
              style={{ fontSize: '11px', padding: '6px 11px', borderRadius: '8px', borderColor: 'rgba(34, 211, 238, 0.3)', color: 'var(--cyan)' }}
            >
              ProGamer
            </button>

            <button
              type="button"
              className="glassBtn"
              onClick={() => {
                setEmailOrUsername('Nova');
                setPassword('password123');
              }}
              title="Controller / Smokes Operator"
              style={{ fontSize: '11px', padding: '6px 11px', borderRadius: '8px' }}
            >
              Nova
            </button>

            <button
              type="button"
              className="glassBtn"
              onClick={() => {
                setEmailOrUsername('Shadow');
                setPassword('password123');
              }}
              title="Duelist / Apex Fragger"
              style={{ fontSize: '11px', padding: '6px 11px', borderRadius: '8px' }}
            >
              Shadow
            </button>

            <button
              type="button"
              className="glassBtn"
              onClick={() => {
                setEmailOrUsername('PhoenixCarry');
                setPassword('password123');
              }}
              title="Phoenix Entry Specialist"
              style={{ fontSize: '11px', padding: '6px 11px', borderRadius: '8px' }}
            >
              PhoenixCarry
            </button>

            <button
              type="button"
              className="glassBtn"
              onClick={() => {
                setEmailOrUsername('admin@squadsync.gg');
                setPassword('password123');
              }}
              title="Platform Administrator"
              style={{ fontSize: '11px', padding: '6px 11px', borderRadius: '8px', color: '#ff6363', borderColor: 'rgba(255, 99, 99, 0.3)' }}
            >
              Admin
            </button>
          </div>
        </div>
      </form>

      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text2)' }}>
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => setAuthModalMode('register')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--cyan)',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          Register Free
        </button>
      </p>
    </div>
  );
}
