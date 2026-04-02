import { PVTTestEngine } from '../../src/hooks/usePVTTest';
import { Constants } from '../../src/models/constants';

describe('PVTTestEngine', () => {
  test('initializes with correct defaults', () => {
    const engine = new PVTTestEngine(60);
    expect(engine.isActive).toBe(false);
    expect(engine.isComplete).toBe(false);
    expect(engine.reactionTimes).toEqual([]);
    expect(engine.currentCombo).toBe(0);
  });

  test('recordReaction adds valid reaction time', () => {
    const engine = new PVTTestEngine(60);
    engine.isActive = true;
    engine.recordReaction(350);
    expect(engine.reactionTimes).toEqual([350]);
  });

  test('recordReaction floors at minimum valid RT', () => {
    const engine = new PVTTestEngine(60);
    engine.isActive = true;
    engine.recordReaction(50);
    expect(engine.reactionTimes[0]).toBe(Constants.DisplayLatency.minimumValidRtMs);
  });

  test('combo increments on fast reactions', () => {
    const engine = new PVTTestEngine(60);
    engine.isActive = true;
    engine.recordReaction(350);
    expect(engine.currentCombo).toBe(1);
    engine.recordReaction(380);
    expect(engine.currentCombo).toBe(2);
  });

  test('combo resets on slow reactions', () => {
    const engine = new PVTTestEngine(60);
    engine.isActive = true;
    engine.recordReaction(350);
    engine.recordReaction(500);
    expect(engine.currentCombo).toBe(0);
  });

  test('meanRT calculates correctly', () => {
    const engine = new PVTTestEngine(60);
    engine.isActive = true;
    engine.recordReaction(300);
    engine.recordReaction(400);
    expect(engine.meanRT).toBe(350);
  });

  test('comboLabel returns correct text', () => {
    const engine = new PVTTestEngine(60);
    engine.currentCombo = 2;
    expect(engine.comboLabel).toBe('2x Fast!');
    engine.currentCombo = 5;
    expect(engine.comboLabel).toBe('5x On Fire!');
    engine.currentCombo = 8;
    expect(engine.comboLabel).toBe('8x UNSTOPPABLE!');
  });
});
