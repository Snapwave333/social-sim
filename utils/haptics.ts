
export const triggerHaptic = (type: 'success' | 'warning' | 'light' | 'medium') => {
  if (!navigator.vibrate) return;

  switch (type) {
    case 'success':
      navigator.vibrate(50); // Crisp single tap
      break;
    case 'warning':
      navigator.vibrate([30, 50, 30]); // Triple pulse
      break;
    case 'light':
      navigator.vibrate(10); // Very subtle buzz
      break;
    case 'medium':
      navigator.vibrate(25); // Standard button press
      break;
  }
};
