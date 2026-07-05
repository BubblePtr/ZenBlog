let audioContext: AudioContext | undefined;

// One clean tick sampled from the reference recording (48kHz mono s16 WAV,
// normalized to -1dBFS, ~85ms with fade-out).
const CRISP_TICK_SAMPLE_BASE64 =
  'UklGRiYgAABXQVZFZm10IBAAAAABAAEAgLsAAAB3AQACABAATElTVBoAAABJTkZPSVNGVA0AAABMYXZmNjIuMy4xMDAAAGRhdGHg' +
  'HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD6//r/+v/6//n/+f/5' +
  '//n/+f/5//n/+f/5//n/+P/4//j/AAAAAAAAAAAAAAAAAAAAAAkACQAJAAkAAAAAAPf/9//u/+X/3P/c/9z/3P/c/9z/0//L/8v/' +
  '0//L/7n/sP+5/7n/uf+5/7D/sP+w/7D/uf+5/8L/y//c/+X/7v8AAAkAGwAkADUAPgBHAFAAWQBiAGIAawBrAGsAawBrAGsAawBi' +
  'AFkAWQBQAEcARwBHAEcARwBHAEcARwA+AC0AJAASAAkAAAD3//f/7v/u/+7/7v/3//f/9//3/wAACQAJABIAGwAtADUARwBZAGsA' +
  'hgCYAKAAqQCyAKkAoACgAJgAhgB0AGsAYgBQADUALQAbAAAA7v/c/8v/uf+n/57/jP+D/3r/ev96/3r/ev+M/57/wv/3/0cAuwBc' +
  'ASkCGQM2BIkF/waZCFcKJgwIDvIPABIfFEgWaBhkGvUb7hxrHVAdnhx4G+cZFxgbFvwTyhGiD4INawtVCT4HJwX+As0AeP7/+2P5' +
  'o/a286bwae0I6nvmweLk3uzayNZ20gvOe8nRxEHAHbzXuO22graEt9C5Or2CwWLGksv30FTWjduQ4GflCOp07s7yKPeC++X/kARd' +
  'CU8OiBP/GJoeaiRnKn8wujYrPZxDMUr6UKpXwV1CYzNoCGz7bcVtcGsxZ05hRlp6UkJK+UHdOSIy2yoRJMQd4hdZEg4N+Qf+Avv9' +
  '7/jI84/uROno43neFNmu00nO9cirw2m+ObkktCCvHaphpXKh3p4RnkmfUKLpprmsaLOduv/BTslg0BjXZd0+477o5e288mf35Ps+' +
  'AKoEHwmLDQkSoRZLG/YfoCRTKQYuqDJJN+I7ekABRYdJ800PUjpV91b3VkxVD1J/TfZHzUFKO7Y0PC4JKDAiwhy+FwsTnw57CowG' +
  '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' +
  'NANyA7oD+AM2BHUEqgTXBOkE6QTOBJgEUQQBBKgDRgPkAosCMQLhAZEBUwELAc0AmABZACQA5f+n/3H/M//1/rb+b/4x/un9q/1s' +
  '/S798Py6/Hz8PfwI/NL7pvuL+4L7lPu4+/b7NfyF/N78N/2H/df9KP5v/rb+9f4q/2D/lf/L/wAALQBiAJgAzQALAUEBfwG1AfMB' +
  'KQJeApwC0gIHAz0DaQOfA8sD5gP4A/gD5gO6A4QDRgP+ArcCZwIgAtgBmgFcAR0B6ACyAH0AWQAtAPf/y/+e/3H/PP8P/9r+pP54' +
  '/kL+Df7g/av9fv1S/SX9+fzM/Kj8jvyF/I78qPzM/AL9N/11/b39BP5C/oH+tv7s/iH/Tv96/57/y//u/xIAPgBiAI8AuwDoABQB' +
  'QQFtAZoBxwHzARcCOgJnApQCtwLbAvYCBwMQA/4C5ALAAosCVQIXAuEBowFtATgBAgHWALIAhgBiAD4AJAAAANP/uf+V/3H/Rf8h' +
  '//7+0f6t/or+Zv5C/hb+8v3P/bT9kP1s/Vv9Uv1S/Wz9h/20/eD9Fv5L/oH+rf7j/g//PP9g/4P/nv/C/9z/9/8bADUAWQB0AJgA' +
  'uwDWAAIBJgFBAWUBiAGsAccB6gEFAikCQwJVAmcCZwJeAkMCKQL8Ac8BowF2AUoBHQHxAM0AqQCGAGsAUAA1ABsAAADc/8L/sP+M' +
  '/3H/Tv8z/w//9f7R/rb+k/54/l3+Of4f/gT+6f3X/c/9z/3g/fL9Df4x/l3+iv6t/tr+/v4h/0X/YP+D/57/uf/T/+X/AAASAC0A' +
  'RwBiAH0AoAC7ANYA8QAUAS8BSgFlAYgBowG+AdgB6gH8AfwB/AHqAdgBvgGaAXYBUwEmAQIB3wDEAKAAhgBrAFkAPgAkABIAAADl' +
  '/8v/sP+V/3r/aP9O/zP/GP/+/uP+yP6t/pv+gf5m/lT+Qv45/jn+Qv5L/mb+gf6k/sj+4/4G/yr/Rf9g/3r/lf+n/8L/0//u/wAA' +
  'EgAtAD4AUABrAIYAmACpAMQA1gDxAAIBHQEvAUoBXAFtAX8BkQGRAZEBiAF2AVwBQQEmAQsB6ADNALIAmAB9AGsAUAA+AC0AGwAJ' +
  'APf/5f/T/8L/p/+V/4P/cf9g/07/PP8h/w///v7s/tr+yP62/qT+m/6b/qT+rf6//tH+7P4G/yH/PP9X/3H/g/+V/7D/wv/T/9z/' +
  '7v8AABIAJAA1AD4AUABiAHQAhgCYAKkAuwDNAN8A8QACAQsBHQEvATgBQQFBATgBLwEUAQIB6ADWALsAqQCPAH0AawBZAEcANQAk' +
  'ABsACQD3/+7/3P/T/8L/sP+e/5X/g/9x/2D/V/9F/zP/Kv8Y/wb/9f7s/uP+4/7j/uz+/v4P/yH/M/9O/2D/cf+D/57/p/+5/8v/' +
  '0//l/+7/AAAJABsAJAAtAD4AUABZAGsAdACGAI8AoACpALsAzQDWAOgA8QD6APoA+gD6APEA6ADWAMQAsgCYAIYAdABiAFkARwA+' +
  'AC0AGwASAAkA9//u/+X/3P/L/8L/sP+n/57/jP+D/3r/aP9g/07/Rf88/yr/If8Y/xj/GP8h/yr/PP9F/1f/aP96/4z/nv+n/7n/' +
  'wv/T/9z/5f/3/wAACQASACQALQA1AD4ARwBZAGIAawB0AH0AjwCYAKAAqQC7AMQAzQDNAM0AzQDEALsAqQCgAI8AfQB0AGIAWQBH' +
  'AD4ANQAkABsAEgAJAAAA9//u/+X/0//L/8L/uf+w/6f/nv+M/4P/g/9x/2j/YP9X/07/Rf9F/0X/Tv9O/2D/aP9x/4P/lf+e/6f/' +
  'uf/C/8v/0//c/+X/7v/3/wAACQASABsAJAA1ADUAPgBQAFkAWQBiAHQAfQCGAIYAmACgAKAAqQCpAKkAoACYAI8AhgB9AGsAWQBQ' +
  'AEcAPgA1AC0AJAAbABIACQAAAPf/9//u/9z/3P/T/8v/wv+5/7D/p/+e/5X/jP+D/3r/ev9x/2j/aP9o/3H/cf96/4P/jP+V/6f/' +
  'sP+5/8L/y//T/9z/5f/u/+7/9/8AAAkAEgASABsAJAAtADUAPgBHAEcAUABZAGIAawB0AH0AfQCGAIYAjwCGAIYAfQB0AGsAYgBZ' +
  'AFAARwA+ADUALQAkABsAGwASAAkAAAAAAPf/7v/l/+X/3P/T/9P/y//C/7n/sP+n/6f/nv+V/5X/jP+D/4P/g/+D/4P/jP+V/57/' +
  'p/+w/7n/wv/L/9P/3P/c/+X/7v/u//f/AAAJAAkAEgASABsAJAAtAC0ANQA+AEcARwBQAFkAWQBiAGsAawB0AHQAdABrAGsAYgBZ' +
  'AFAARwA+AD4ANQAtACQAGwAbABIACQAJAAkAAAD3//f/7v/u/+X/3P/T/9P/y//L/8L/uf+5/7D/p/+n/57/nv+V/5X/lf+e/57/' +
  'p/+w/7n/wv/L/9P/0//c/+X/5f/u/+7/9//3/wAACQAJAAkAEgAbABsAJAAkAC0ANQA1AD4ARwBHAFAAUABZAFkAYgBiAGIAYgBZ' +
  'AFAAUABHAD4ANQA1AC0AJAAbABsAEgASAAkACQAAAAAA9//3/+7/7v/l/+X/3P/c/9P/0//L/8L/wv+5/7n/sP+w/6f/p/+n/6f/' +
  'p/+w/7D/uf/C/8v/y//T/9z/3P/l/+7/7v/3//f/AAAAAAAACQAJABIAEgAbACQAJAAkAC0ALQA1ADUAPgA+AEcARwBQAFAAUABQ' +
  'AFAAUABHAD4APgA1AC0ALQAkACQAGwASABIACQAJAAkAAAAAAPf/9//3/+7/5f/l/+X/3P/c/9P/0//T/8v/y//C/8L/uf+5/7n/' +
  'sP+5/7n/uf/C/8L/y//T/9P/3P/l/+X/5f/u//f/9//3//f/AAAAAAkACQAJABIAEgAbABsAJAAkACQALQAtADUANQA+AD4APgBH' +
  'AEcARwBHAD4APgA+ADUALQAtACQAJAAbABsAEgASAAkACQAJAAAAAAAAAPf/9//3/+7/7v/l/+X/3P/c/9z/0//T/9P/y//L/8L/' +
  'wv/C/8L/wv/C/8L/wv/L/9P/0//T/9z/5f/l/+7/7v/3//f/9/8AAAAAAAAJAAkACQASABIAEgAbABsAGwAkACQALQAtADUANQA1' +
  'ADUAPgA+AD4APgA+ADUANQA1AC0ALQAkABsAGwASABIACQAJAAkAAAAAAAAAAAD3//f/9//u/+7/7v/l/+X/3P/c/9z/0//T/9P/' +
  '0//L/8v/y//L/8v/y//L/8v/0//T/9z/3P/c/+X/7v/u//f/9//3//f/AAAAAAAACQAJAAkAEgASABIAGwAbABsAJAAkACQAJAAt' +
  'AC0ALQA1ADUANQA1ADUANQA1AC0ALQAkACQAGwAbABsAEgASAAkACQAJAAAAAAAAAPf/9//3//f/7v/u/+7/5f/l/+X/5f/c/9z/' +
  '3P/T/9P/0//T/8v/y//L/8v/0//T/9P/3P/c/9z/5f/l/+7/7v/3//f/9//3/wAAAAAAAAAACQAJAAkAEgASABIAEgAbABsAGwAk' +
  'ACQAJAAtAC0ALQAtADUANQAtAC0ALQAtACQAJAAbABsAGwASABIAEgAJAAkACQAAAAAAAAAAAPf/9//3//f/7v/u/+7/7v/m/+b/' +
  '5v/d/93/3f/d/9T/1P/U/9T/1P/U/9T/1P/d/93/3f/m/+b/7//v/+//9//3//f/9/8AAAAAAAAAAAkACQAJAAkAEQARABEAEQAa' +
  'ABoAGgAiACIAIgAiACsAKwAqACoAKgAqACoAIgAiACIAGQAZABkAEQARABEACAAIAAgAAAAAAAAAAAD4//j/+P/4//j/7//v/+//' +
  '7//n/+f/5//f/9//3//f/9f/1//X/9f/1//X/9//3//f/+f/5//n//D/8P/w//j/+P/4//j/AAAAAAAAAAAIAAgACAAIABAAEAAQ' +
  'ABAAEAAYABgAGAAYACAAIAAgACAAKAAoACgAKAAgACAAIAAYABgAGAAQABAAEAAIAAgACAAIAAAAAAAAAAAAAAD4//j/+P/4//D/' +
  '8P/w//D/8P/p/+n/6f/p/+H/4f/h/+H/4f/Z/+H/4f/h/+H/4f/p/+n/8f/x//H/8f/4//j/+P/4/wAAAAAAAAAAAAAIAAgACAAI' +
  'AA8ADwAPAA8AFwAXABcAFwAXAB4AHgAeAB4AHgAeAB4AHgAeAB4AFwAWABYADwAPAA8ABwAHAAcABwAAAAAAAAAAAAAA+f/5//n/' +
  '+f/5//H/8f/x//H/6v/q/+r/6v/q/+P/4//j/+P/4//j/+P/4//j/+r/6v/q//L/8v/y//L/+f/5//n/+f8AAAAAAAAAAAAABwAH' +
  'AAcABwAHAA4ADgAOAA4AFQAVABUAFQAVABwAHAAcABwAHAAcABwAHAAVABUAFQAVAA4ADgAOAAcABwAHAAcAAAAAAAAAAAAAAAAA' +
  '+f/5//n/+f/5//L/8v/y//L/6//r/+v/6//r/+X/5f/l/+X/5f/l/+X/7P/s/+z/7P/y//L/8v/y//n/+f/5//n/AAAAAAAAAAAA' +
  'AAcABwAHAAcABwANAA0ADQANAA0AFAAUABQAFAAUABoAGgAaABoAGgAaABoAFAAUABQADQANAA0ADQAHAAcABgAGAAAAAAAAAAAA' +
  'AAAAAPr/+v/6//r/+v/z//P/8//z//P/7f/t/+3/7f/t/+f/5//n/+f/5//n/+3/7f/t/+3/8//z//P/+v/6//r/+v/6/wAAAAAA' +
  'AAAAAAAAAAYABgAGAAYABgAMAAwADAAMAAwAEgASABIAEgASABgAGAAYABgAGAASABIAEgASAAwADAAMAAwABgAGAAYABgAAAAAA' +
  'AAAAAAAAAAD6//r/+v/6//r/+v/0//T/9P/0/+7/7v/u/+7/7v/u/+n/6f/p/+n/7v/u/+7/7//v//T/9P/0//r/+v/6//r/+v8A' +
  'AAAAAAAAAAAAAAAGAAYABgAGAAYACwALAAsACwALABEAEQARABEAEQARABcAFwAWABEAEQARABEAEQALAAsACwALAAYABgAGAAYA' +
  'BgAAAAAAAAAAAAAA+//7//v/+//7//v/9f/1//X/9f/1//D/8P/w//D/8P/w/+r/6v/q//D/8P/w//D/9f/1//X/9f/7//v/+//7' +
  '//v/AAAAAAAAAAAAAAAABQAFAAUABQAFAAoACgAKAAoACgAKABAAEAAQABAADwAVABUAFQAPAA8ADwAPAA8ACgAKAAoACgAFAAUA' +
  'BQAFAAUAAAAAAAAAAAAAAAAA+//7//v/+//7//b/9v/2//b/9v/2//H/8f/x//H/8f/s/+z/7P/x//H/8f/x//b/9v/2//b/+//7' +
  '//v/+//7/wAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAkACQAJAAkACQAOAA4ADgAOAA4ADgATABMADgAOAA4ADgAOAAkACQAJAAkA' +
  'BQAFAAUABQAFAAAAAAAAAAAAAAAAAPv/+//7//v/+//3//f/9//3//f/9//z//P/8//z//P/8//u//P/8//z//P/8//z//f/9//3' +
  '//f//P/8//z//P8AAAAAAAAAAAAAAAAAAAQABAAEAAQABAAJAAkACQAIAAgADQANAA0ADQANAA0ADQANAA0ADQANAAwADAAIAAgA' +
  'CAAIAAQABAAEAAQABAAAAAAAAAAAAAAAAAD8//z//P/8//z/+P/4//j/+P/4//j/9P/0//T/9P/0//T/9P/0//T/9P/0//T/+P/4' +
  '//j/+P/8//z//P/8//z//P8AAAAAAAAAAAAAAAAEAAQABAAEAAQACAAIAAgACAAIAAgACwALAAsACwALAAsACwALAAsACwALAAsA' +
  'BwAHAAcABwAEAAQABAAEAAQAAAAAAAAAAAAAAAAA/P/8//z//P/8//z/+f/5//n/+f/5//n/9f/1//b/9v/2//b/9v/2//b/9v/2' +
  '//n/+f/5//n//f/9//3//f/9//3/AAAAAAAAAAAAAAAAAwADAAMAAwADAAMABwAHAAcABwAHAAoACgAKAAoACgAKAAoACgAKAAoA' +
  'CgAKAAYABgAGAAYAAwADAAMAAwADAAAAAAAAAAAAAAAAAP3//f/9//3//f/9//r/+v/6//r/+v/6//f/9//3//f/9//3//f/9//3' +
  '//f/9//6//r/+v/6//3//f/9//3//f/9/wAAAAAAAAAAAAAAAAMAAwADAAMAAwADAAYABgAGAAYABgAIAAgACAAIAAgACAAIAAgA' +
  'CAAIAAgACAAFAAUABQAFAAMAAwADAAMAAwADAAAAAAAAAAAAAAAAAP3//f/9//3//f/9//v/+//7//v/+//4//j/+P/4//j/+P/4' +
  '//j/+P/4//n/+//7//v/+//+//7//v/+//7//v8AAAAAAAAAAAAAAAACAAIAAgACAAIAAgAFAAUABQAFAAUABQAHAAcABwAHAAcA' +
  'BwAHAAcABwAHAAcABAAEAAQABAACAAIAAgACAAIAAgAAAAAAAAAAAAAAAAD+//7//v/+//7//v/8//z//P/8//z/+v/6//r/+v/6' +
  '//r/+v/6//r/+v/6//z//P/8//z//P/+//7//v/+//7/AAAAAAAAAAAAAAAAAgACAAIAAgACAAIABAAEAAQABAAEAAQABgAFAAUA' +
  'BQAFAAUABQAFAAUABQAFAAQABAAEAAQAAgACAAIAAgACAAAAAAAAAAAAAAAAAAAA/v/+//7//v/+//7//f/9//3//f/9//3/+//7' +
  '//v/+//7//v/+//7//v/+//7//3//f/9//3//v///////////wAAAAAAAAAAAAAAAAAAAQABAAEAAQABAAMAAwADAAMAAwADAAQA' +
  'BAAEAAQABAAEAAQABAAEAAQABAADAAMAAwADAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAP////////////////7//v/+//7//v/+' +
  '//3//f/9//3//f/9//3//f/9//3//f/+//7//v/+//////////////8AAAAAAAAAAAAAAAAAAAEAAQABAAEAAQABAAIAAgACAAIA' +
  'AgADAAMAAwADAAMAAwADAAMAAwACAAIAAgACAAIAAgACAAEAAQABAAEAAQAAAAAAAAAAAAAAAAD/////////////////////////' +
  '///////+//7//v/+//7//v/+//7//v/+//7/////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEA' +
  'AQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAA//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

const TICK_GAIN = 0.8;
const TICK_MIN_SPACING = 0.015;

let lastScheduledTime: number | undefined;
let tickBuffer: AudioBuffer | undefined;
let tickBufferPromise: Promise<AudioBuffer> | undefined;

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

function ensureTickBuffer(context: AudioContext): AudioBuffer | undefined {
  if (!tickBufferPromise) {
    const bytes = Uint8Array.from(atob(CRISP_TICK_SAMPLE_BASE64), (char) => char.charCodeAt(0));
    tickBufferPromise = context.decodeAudioData(bytes.buffer).then((buffer) => {
      tickBuffer = buffer;
      return buffer;
    });
  }

  return tickBuffer;
}

// Crossing several ticks in one animation frame would stack identical
// oscillators into one louder click; spacing them keeps an audible ratchet.
export function getNextCrispTickStartTime(
  currentTime: number,
  lastScheduled: number | undefined,
): number {
  if (lastScheduled === undefined) {
    return currentTime;
  }

  return Math.max(currentTime, lastScheduled + TICK_MIN_SPACING);
}

export function playCrispTickSound(): void {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const buffer = ensureTickBuffer(context);
  if (!buffer) {
    return;
  }

  const now = getNextCrispTickStartTime(context.currentTime, lastScheduledTime);
  lastScheduledTime = now;

  const source = context.createBufferSource();
  const gain = context.createGain();

  source.buffer = buffer;
  gain.gain.value = TICK_GAIN;

  source.connect(gain);
  gain.connect(context.destination);
  source.start(now);
}

export function primeCrispTickSound(): void {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  void context.resume();
  ensureTickBuffer(context);
}
