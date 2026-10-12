/**
 * Audio Sound Effects System for SquadSync
 */

export const playMissionPassedSound = () => {
  try {
    const audio = new Audio('/sounds/mission_passed.mp3');
    audio.volume = 0.8;
    audio.play().catch((err) => {
      console.log('Audio playback notice (user interaction required):', err);
    });
  } catch (err) {
    console.error('Failed to initialize audio:', err);
  }
};

export const playSquadSelectSound = () => {
  try {
    const audio = new Audio('/sounds/squad_select.mp3');
    audio.volume = 0.9;
    audio.play().catch((err) => {
      console.log('Audio playback notice (user interaction required):', err);
    });
  } catch (err) {
    console.error('Failed to initialize audio:', err);
  }
};

export const playLoginErrorSound = () => {
  try {
    const audio = new Audio('/sounds/login_error.mp3');
    audio.volume = 0.8;
    audio.play().catch((err) => {
      console.log('Audio playback notice (user interaction required):', err);
    });
  } catch (err) {
    console.error('Failed to initialize audio:', err);
  }
};

export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/xbox-series-notification.mp3');
    audio.volume = 0.85;
    audio.play().catch((err) => {
      console.log('Audio playback notice (user interaction required):', err);
    });
  } catch (err) {
    console.error('Failed to initialize audio:', err);
  }
};

export const triggerAppNotification = (notificationData) => {
  playNotificationSound();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('squadsync_notification', { detail: notificationData })
    );
  }
};
