import { useState } from 'react'
import { ZonePopover } from './components/ZonePopover'

function App() {
  const [activeLocation, setActiveLocation] = useState<string | null>(null)

  return (
    <div className="app">
      <h1>Ферма невидимых кроликов</h1>
      <div className="zones">
        <button onClick={() => setActiveLocation('Огород')}>Огород</button>
        <button onClick={() => setActiveLocation('Теплица')}>Теплица</button>
        <button onClick={() => setActiveLocation('Сарай')}>Сарай</button>
        <button onClick={() => setActiveLocation('Забор — Запад')}>Запад</button>
        <button onClick={() => setActiveLocation('Забор — Юго-Запад')}>Юго-Запад</button>
        <button onClick={() => setActiveLocation('Забор — Юго-Восток')}>Юго-Восток</button>
        <button onClick={() => setActiveLocation('Забор — Восток')}>Восток</button>
      </div>

      {activeLocation && (
        <ZonePopover
          location={activeLocation}
          onClose={() => setActiveLocation(null)}
        />
      )}
    </div>
  )
}

export default App
