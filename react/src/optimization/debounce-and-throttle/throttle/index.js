import React, { useEffect, useState } from 'react';
import throttle from './throttle';

function ThrottleExample () {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = throttle(() => {
    setSize({
      width: window.innerWidth,
      height: window, innerHeight,
    });
  }, 1000);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
      <h1>Window Size</h1>
      <p>Width: {size.width}px</p>
      <p>Height: {size.height}px</p>
    </div>
  );
}

export default ThrottleExample;
