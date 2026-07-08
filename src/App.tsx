import './App.css'

function ControlArea() {
  return (
    <div className="control-area">
      <div className="control-section">
        <h2>Симулятор</h2>
      </div>
      <div className="control-section parameters">
        <h3>Параметры estimator'а</h3>
      </div>
    </div>
  );
}

function DashboardArea() {
  return (
    <div className="dashboard-area">
      <h2>Дашборд</h2>
    </div>
  );
}

function OverlayButtons() {
  return (
    <div className="overlay-buttons">
      <button>AI Worklog</button>
      <button>Legend</button>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <h1>Ферма невидимых кроликов</h1>
      <ControlArea />
      <DashboardArea />
      <OverlayButtons />
    </div>
  )
}

export default App
