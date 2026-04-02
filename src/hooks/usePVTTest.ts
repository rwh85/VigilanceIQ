import { useState, useRef, useCallback, useEffect } from 'react';
import { Constants } from '../models/constants';
import { getPerformanceLevel, PerformanceLevel } from '../models/types';

const COMBO_THRESHOLD_MS = 400;

// Pure logic engine (testable without React)
export class PVTTestEngine {
  isActive = false;
  isComplete = false;
  reactionTimes: number[] = [];
  currentCombo = 0;
  maxCombo = 0;
  durationSeconds: number;

  constructor(durationSeconds: number) {
    this.durationSeconds = durationSeconds;
  }

  recordReaction(rawMs: number): number {
    const ms = Math.max(rawMs, Constants.DisplayLatency.minimumValidRtMs);
    this.reactionTimes.push(ms);

    if (ms < COMBO_THRESHOLD_MS) {
      this.currentCombo++;
      if (this.currentCombo > this.maxCombo) this.maxCombo = this.currentCombo;
    } else {
      this.currentCombo = 0;
    }

    return ms;
  }

  handleAnticipatory(): void {
    this.currentCombo = 0;
  }

  get meanRT(): number {
    if (this.reactionTimes.length === 0) return 0;
    return this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;
  }

  get medianRT(): number {
    if (this.reactionTimes.length === 0) return 0;
    const sorted = [...this.reactionTimes].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  get fastestRT(): number {
    return this.reactionTimes.length > 0 ? Math.min(...this.reactionTimes) : 0;
  }

  get slowestRT(): number {
    return this.reactionTimes.length > 0 ? Math.max(...this.reactionTimes) : 0;
  }

  get lapseCount(): number {
    return this.reactionTimes.filter((rt) => rt > Constants.AlertnessThresholds.lapse).length;
  }

  get performanceLevel(): PerformanceLevel {
    return getPerformanceLevel(this.meanRT);
  }

  get comboLabel(): string {
    if (this.currentCombo === 2) return '2x Fast!';
    if (this.currentCombo === 3) return '3x Combo!';
    if (this.currentCombo === 4) return '4x Hot Streak!';
    if (this.currentCombo >= 5 && this.currentCombo <= 7) return `${this.currentCombo}x On Fire!`;
    if (this.currentCombo >= 8) return `${this.currentCombo}x UNSTOPPABLE!`;
    return '';
  }

  reset(): void {
    this.isActive = false;
    this.isComplete = false;
    this.reactionTimes = [];
    this.currentCombo = 0;
    this.maxCombo = 0;
  }
}

// React hook wrapping the engine
export function usePVTTest(durationSeconds: number = Constants.PVTTest.standardDurationSeconds) {
  const engineRef = useRef(new PVTTestEngine(durationSeconds));
  const [, forceUpdate] = useState(0);
  const stimulusTimeRef = useRef(0);
  const stimulusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showStimulus, setShowStimulus] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);

  const engine = engineRef.current;
  const rerender = () => forceUpdate((n) => n + 1);

  const scheduleStimulus = useCallback(() => {
    const interval =
      Constants.PVTTest.minStimulusInterval +
      Math.random() * (Constants.PVTTest.maxStimulusInterval - Constants.PVTTest.minStimulusInterval);

    stimulusTimerRef.current = setTimeout(() => {
      stimulusTimeRef.current = performance.now();
      setShowStimulus(true);
    }, interval * 1000);
  }, []);

  const startTest = useCallback(() => {
    engine.reset();
    engine.isActive = true;
    setRemainingSeconds(durationSeconds);
    setShowStimulus(false);
    rerender();

    countdownTimerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          engine.isActive = false;
          engine.isComplete = true;
          if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current);
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setShowStimulus(false);
          rerender();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    scheduleStimulus();
  }, [durationSeconds, scheduleStimulus]);

  const handleTap = useCallback(() => {
    if (!engine.isActive) return;

    if (showStimulus && stimulusTimeRef.current > 0) {
      const responseTime = performance.now();
      const reactionMs = responseTime - stimulusTimeRef.current;
      engine.recordReaction(reactionMs);
      setShowStimulus(false);
      stimulusTimeRef.current = 0;
      rerender();
      scheduleStimulus();
    } else if (!showStimulus) {
      engine.handleAnticipatory();
      rerender();
    }
  }, [showStimulus, scheduleStimulus]);

  const resetTest = useCallback(() => {
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    engine.reset();
    setShowStimulus(false);
    setRemainingSeconds(durationSeconds);
    rerender();
  }, [durationSeconds]);

  useEffect(() => {
    return () => {
      if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  return {
    engine,
    showStimulus,
    remainingSeconds,
    startTest,
    handleTap,
    resetTest,
  };
}
