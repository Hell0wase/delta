// Global volume control
let globalVolume = 1.0;

export const setGlobalVolume = (volume: number) => {
  globalVolume = Math.max(0, Math.min(1, volume));
};

export const getGlobalVolume = () => {
  return globalVolume;
};

// Sound effects for hover and interactions
export const playHoverSound = () => {
  if (globalVolume === 0) return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.1 * globalVolume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01 * globalVolume, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

export const playClickSound = () => {
  if (globalVolume === 0) return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 600;
  oscillator.type = 'square';

  gainNode.gain.setValueAtTime(0.15 * globalVolume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01 * globalVolume, audioContext.currentTime + 0.15);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
};
