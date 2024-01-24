import React, { useState, useRef, useEffect } from 'react';

import { render } from 'react-dom';

import './style.css';

const App = () => {
  const [timer, setTimer] = useState('0:00');

  const [minutesValue, setMinutesValue] = useState();

  const [secondsValue, setSecondsValue] = useState();

  const [pause, setPause] = useState(false);

  const [active, setActive] = useState(false);

  const [count, setCount] = useState(0);

  let initCounter = () => {
    let m = Math.floor(count / 60);

    let s = count - m * 60;

    if (count >= 0) {
      setCount((count) => count - 1);

      setTimer((m > 9 ? m : '0' + m) + ':' + (s > 9 ? s : '0' + s));

      console.log(count, m, s);
    }
  };

  const interval = useRef(null);

  useEffect(() => {
    if (!pause && active) {
      interval.current = setInterval(() => {
        if (count >= 0) {
          initCounter();
        }
      }, 1000);
    } else {
      clearInterval(interval.current);

      interval.current = null;
    }

    return () => {
      clearInterval(interval.current);
    };
  }, [pause, active, count]);

  const handleRun = () => {
    setPause((pause) => !pause);
  };

  const handleChangeMin = (event) => {
    setCount(
      Number(event.target.value) * 60 + (secondsValue > 0 ? secondsValue : 0)
    );

    console.log(count);

    setMinutesValue(Number(event.target.value));
  };

  const handleChangeSec = (event) => {
    setCount(minutesValue ? minutesValue * 60 : 0 + Number(event.target.value));

    setSecondsValue(Number(event.target.value));
  };

  const handleStart = () => {
    setActive((active) => !active);
  };

  let reset = (e) => {
    setTimer('0:00');

    setCount(0);

    setMinutesValue(0);

    setSecondsValue(0);

    setActive(false);
  };

  return (
    <div>
      <div>
        <label>
          <input
            id="minute"
            name="minute"
            type="number"
            value={minutesValue}
            onChange={handleChangeMin}
          />
          Minutes
        </label>

        <label>
          <input
            id="id1"
            name="minute1"
            type="number"
            value={secondsValue}
            onChange={handleChangeSec}
          />
          Seconds
        </label>
      </div>

      <button onClick={handleStart}>START</button>

      <button onClick={handleRun}>{pause ? 'Run' : 'Pause'}</button>

      <button onClick={reset}>Reset</button>

      <h1>{timer}</h1>
    </div>
  );
};

render(<App />, document.getElementById('root'));
