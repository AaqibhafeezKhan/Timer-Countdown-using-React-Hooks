import React, { useState, useRef, useEffect } from 'react';
import { render } from 'react-dom';
import './style.css';

const App = () => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [taskName, setTaskName] = useState('Custom Timer');

  const [isMuted, setIsMuted] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

  const [inputMinutes, setInputMinutes] = useState('');
  const [inputSeconds, setInputSeconds] = useState('');

  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      document.title = `(${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}) ${taskName}`;
    } else {
      document.title = 'Pomodoro Timer React';
    }
  }, [totalSeconds, isActive, isPaused, taskName]);

  const playBeep = () => {
    if (isMuted) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq / 2, startTime + duration);

      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(660, now, 0.2);
    playTone(880, now + 0.2, 0.2);
    playTone(1320, now + 0.4, 0.4);
  };

  useEffect(() => {
    if (isActive && !isPaused && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            playBeep();

            if (taskName === 'Pomodoro Work') {
              setPomodorosCompleted((c) => c + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, totalSeconds, taskName, isMuted]);

  const handleStart = () => {
    if (totalSeconds === 0) {
      const mins = parseInt(inputMinutes || 0, 10);
      const secs = parseInt(inputSeconds || 0, 10);
      const total = mins * 60 + secs;
      if (total > 0) {
        setTotalSeconds(total);
        setInitialSeconds(total);
        setIsActive(true);
        setIsPaused(false);
        if (taskName === 'Custom Timer') setTaskName('Focus Time');
      }
    } else {
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTotalSeconds(0);
    setInitialSeconds(0);
    setInputMinutes('');
    setInputSeconds('');
    setTaskName('Custom Timer');
  };

  const setPreset = (mins, name) => {
    const total = mins * 60;
    setTotalSeconds(total);
    setInitialSeconds(total);
    setTaskName(name);
    setInputMinutes(mins.toString());
    setInputSeconds('0');
    setIsActive(false);
    setIsPaused(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = initialSeconds > 0 ? totalSeconds / initialSeconds : 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="app-container">
      <div className="timer-card">
        <div className="header-controls">
          <button
            className="mute-btn"
            onClick={() => setIsMuted((m) => !m)}
            title={isMuted ? 'Unmute Alarm' : 'Mute Alarm'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        <h2 className="task-title">{taskName}</h2>

        <div className="timer-display-container">
          <svg className="progress-ring" width="220" height="220">
            <circle
              className="progress-ring__track"
              stroke="#2d3748"
              strokeWidth="8"
              fill="transparent"
              r={radius}
              cx="110"
              cy="110"
            />
            <circle
              className="progress-ring__circle"
              stroke="#4fd1c5"
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="110"
              cy="110"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <div className="timer-text">
            {formatTime(
              totalSeconds ||
                parseInt(inputMinutes || 0) * 60 + parseInt(inputSeconds || 0)
            )}
          </div>
        </div>

        <div className="stats-container">
          {pomodorosCompleted > 0 && (
            <div className="pomodoro-streak">
              🔥 Streak: {pomodorosCompleted} Pomodoros completed!
            </div>
          )}
        </div>

        {!isActive && totalSeconds === 0 && (
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="number"
                min="0"
                placeholder="00"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
              />
              <span>min</span>
            </div>
            <span className="colon">:</span>
            <div className="input-wrapper">
              <input
                type="number"
                min="0"
                max="59"
                placeholder="00"
                value={inputSeconds}
                onChange={(e) => setInputSeconds(e.target.value)}
              />
              <span>sec</span>
            </div>
          </div>
        )}

        <div className="controls">
          {!isActive && !isPaused && totalSeconds === 0 ? (
            <button className="btn btn-primary" onClick={handleStart}>
              START
            </button>
          ) : (
            <>
              {!isActive || isPaused ? (
                <button className="btn btn-primary" onClick={handleStart}>
                  RESUME
                </button>
              ) : (
                <button className="btn btn-warning" onClick={handlePause}>
                  PAUSE
                </button>
              )}
              <button className="btn btn-danger" onClick={handleReset}>
                RESET
              </button>
            </>
          )}
        </div>

        <div className="presets">
          <p>Quick Presets</p>
          <div className="preset-buttons">
            <button
              className="btn-preset"
              onClick={() => setPreset(25, 'Pomodoro Work')}
            >
              25m Work
            </button>
            <button
              className="btn-preset"
              onClick={() => setPreset(5, 'Short Break')}
            >
              5m Break
            </button>
            <button
              className="btn-preset"
              onClick={() => setPreset(15, 'Long Break')}
            >
              15m Break
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

render(<App />, document.getElementById('root'));
