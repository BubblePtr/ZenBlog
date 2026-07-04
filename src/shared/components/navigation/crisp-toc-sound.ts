let audioContext: AudioContext | undefined;

function getAudioContext(): AudioContext | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }

  return audioContext;
}

export function playCrispTickSound(): void {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  const duration = 0.045;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(3200, now);
  oscillator.frequency.exponentialRampToValueAtTime(900, now + duration);

  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1200, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.01);
}

export function primeCrispTickSound(): void {
  void getAudioContext()?.resume();
}
