import { Vibration, Alert } from 'react-native';

export interface PomodoroState {
  running: boolean;
  presetIdx: number;
  customMinutes: string;
  customSeconds: string;
  selectedCourse?: string;
  targetTime: number | null;
  totalSeconds: number;
  secondsRemaining: number;
  sessionStartTime: number | null;
  showCompletionModal: boolean;
  pendingCalculatedElapsed: number;
}

type Listener = () => void;

class PomodoroManager {
  state: PomodoroState = {
    running: false,
    presetIdx: 0,
    customMinutes: '45',
    customSeconds: '00',
    selectedCourse: undefined,
    targetTime: null,
    totalSeconds: 25 * 60,
    secondsRemaining: 25 * 60,
    sessionStartTime: null,
    showCompletionModal: false,
    pendingCalculatedElapsed: 0,
  };

  listeners = new Set<Listener>();
  interval: any = null;

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => { this.listeners.delete(l); };
  };

  notify = () => this.listeners.forEach(l => l());

  getState = () => this.state;

  setState = (patch: Partial<PomodoroState>) => {
    this.state = { ...this.state, ...patch };
    this.notify();
  };

  start = () => {
    if (this.state.secondsRemaining <= 0) return;
    this.setState({
      targetTime: Date.now() + this.state.secondsRemaining * 1000,
      sessionStartTime: Date.now(),
      running: true,
    });
    this.startInterval();
  };

  stop = (force?: boolean) => {
    if (this.interval) clearInterval(this.interval);
    let elapsed = 0;
    if (!force && this.state.sessionStartTime && this.state.running) {
       elapsed = Math.floor((Date.now() - this.state.sessionStartTime) / 1000);
       // Preset 0 is focus, preset 3 is custom
       if (elapsed >= 60 && (this.state.presetIdx === 0 || this.state.presetIdx === 3)) {
          this.setState({ showCompletionModal: true, pendingCalculatedElapsed: elapsed });
       }
    }
    this.setState({ running: false, targetTime: null, sessionStartTime: null });
  };

  reset = () => {
    this.stop(true);
    this.setState({ secondsRemaining: this.state.totalSeconds });
  };

  switchPreset = (idx: number, minutes: number) => {
    this.stop(true);
    let sec = 0;
    if (minutes > 0) sec = minutes * 60;
    else sec = (parseInt(this.state.customMinutes) || 0) * 60 + (parseInt(this.state.customSeconds) || 0);

    this.setState({
      presetIdx: idx,
      totalSeconds: sec,
      secondsRemaining: sec,
    });
  };

  startInterval = () => {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (!this.state.targetTime) return;
      const remaining = Math.max(0, Math.floor((this.state.targetTime - Date.now()) / 1000));
      this.setState({ secondsRemaining: remaining });

      if (remaining === 0) {
        if (this.interval) clearInterval(this.interval);
        
        const elapsed = this.state.totalSeconds;
        this.setState({
          running: false,
          targetTime: null,
          sessionStartTime: null,
        });

        Vibration.vibrate([0, 400, 200, 400]);
        
        if (this.state.presetIdx === 0 || this.state.presetIdx === 3) {
          this.setState({ showCompletionModal: true, pendingCalculatedElapsed: elapsed });
        } else {
          Alert.alert("Break over!", "Time to get back to work.");
          this.setState({ secondsRemaining: this.state.totalSeconds });
        }
      }
    }, 1000);
  };
}

export const pomodoroStore = new PomodoroManager();
