import React, { useState } from 'react';
import debounce from './debounce';

function DebounceExample () {
  const [_, setQuery] = useState('');

  const handleChange = debounce((event) => {
    setQuery(event.target.value);
    // 发起 API 请求或其他操作
    console.log('Fetching data for:', event.target.value);
  }, 300);

  return (
    <input
      type='text'
      placeholder='Search...'
      onChange={handleChange}
    />
  );
}

export default DebounceExample;
