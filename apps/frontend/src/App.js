import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/`)
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => console.error('Error fetching from API:', err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Datifyy Frontend</h1>
      <p>API Response: {message || 'Loading...'}</p>
    </div>
  );
}

export default App;