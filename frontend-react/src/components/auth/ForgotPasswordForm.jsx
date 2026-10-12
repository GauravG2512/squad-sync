import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle, Lock, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordForm() {
  const { setAuthModalMode } = useAuth();
  const [step, setStep] = useState(1); // 1: Request token, 2: Set new password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate password requirements
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasDigit && hasSpecial;

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsSubmitting(true);

    try {
      const res = await authApi.forgotPassword(email);
      const resData = res?.data || res;
      
      // If server returned reset_token (dev/test mode)
      const tokenReceived = resData?.reset_token || resData?.data?.reset_token;
      if (tokenReceived) {
        setToken(tokenReceived);
        setStatus({
          type: 'success',
          message: 'Reset token generated! Please enter your new password below.',
        });
        setStep(2);
      } else {
        setStatus({
          type: 'success',
          message: resData?.message || 'If that email exists, password reset instructions have been sent.',
        });
        setStep(2);
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.detail || err.message || 'Unable to request password reset.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!isPasswordValid) {
      setStatus({
        type: 'error',
        message: 'Password does not meet the security criteria.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authApi.resetPassword(token.trim(), newPassword);
      const resData = res?.data || res;
      setStatus({
        type: 'success',
        message: resData?.message || 'Password reset successfully! Redirecting to login...',
      });
      setTimeout(() => {
        setAuthModalMode('login');
      }, 1800);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.detail || err.message || 'Failed to reset password. Please check token.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <button
        type="button"
        onClick={() => setAuthModalMode('login')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text2)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          padding: 0,
          marginBottom: '16px',
        }}
      >
        <ArrowLeft size={14} />
        <span>Back to Login</span>
      </button>

      <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
        {step === 1 ? 'Recover Password' : 'Set New Password'}
      </h2>
      <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '20px' }}>
        {step === 1
          ? 'Enter your registered email address to receive a secure password recovery token.'
          : 'Provide your verification token and select a new strong password.'}
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
          {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestToken}>
          <div className="inputGroup">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="var(--cyan)" />
              Registered Email Address
            </label>
            <input
              type="email"
              required
              placeholder="gamer@squadsync.gg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="primaryBtn fullWidth"
            disabled={isSubmitting}
            style={{ marginTop: '12px', padding: '14px' }}
          >
            {isSubmitting ? (
              'Dispatching Recovery Token...'
            ) : (
              <>
                <KeyRound size={16} />
                Send Recovery Token
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setStep(2)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--cyan)',
                fontSize: '12px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Already have a reset token? Enter it here &rarr;
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="inputGroup">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={14} color="var(--cyan)" />
              Password Reset Token
            </label>
            <input
              type="text"
              required
              placeholder="Paste verification token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={{ fontFamily: 'var(--font-geistmono)', fontSize: '12px' }}
            />
          </div>

          <div className="inputGroup">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="var(--cyan)" />
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {/* Password criteria checklist */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '16px',
            fontSize: '11px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
          }}>
            <span style={{ color: hasMinLength ? '#2ed573' : '#64748b' }}>
              {hasMinLength ? '✓' : '•'} 8+ characters
            </span>
            <span style={{ color: hasUpper ? '#2ed573' : '#64748b' }}>
              {hasUpper ? '✓' : '•'} Uppercase (A-Z)
            </span>
            <span style={{ color: hasLower ? '#2ed573' : '#64748b' }}>
              {hasLower ? '✓' : '•'} Lowercase (a-z)
            </span>
            <span style={{ color: hasDigit ? '#2ed573' : '#64748b' }}>
              {hasDigit ? '✓' : '•'} One number (0-9)
            </span>
            <span style={{ color: hasSpecial ? '#2ed573' : '#64748b', gridColumn: 'span 2' }}>
              {hasSpecial ? '✓' : '•'} Special symbol (!@#$%...)
            </span>
          </div>

          <div className="inputGroup">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--cyan)" />
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="primaryBtn fullWidth"
            disabled={isSubmitting || !isPasswordValid || newPassword !== confirmPassword}
            style={{ marginTop: '12px', padding: '14px' }}
          >
            {isSubmitting ? (
              'Updating Password...'
            ) : (
              <>
                <ShieldCheck size={16} />
                Set New Password & Log In
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text2)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              &larr; Request a different token
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
