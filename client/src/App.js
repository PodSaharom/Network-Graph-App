import React from 'react';
import NetworkGraph from './NetworkGraph';
import Explanation from './Explanation';
import './App.css'; // Убедитесь, что стили подключены

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Тестирование производительности сети</h1>
      </header>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <Explanation />
        <NetworkGraph />
        <div className="decorative-element"></div>
        <div className="decorative-corner"></div>
        <div className="decorative-side">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </main>
    </div>
  );
}

export default App;
