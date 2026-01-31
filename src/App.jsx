import { useState } from 'react'
import './App.css'
import WebApp from '@twa-dev/sdk'

function App() {
  const [items, setItems] = useState([
    { id: 1, name: 'Улюблена футболка', type: 'Верх', emoji: '👕' },
    { id: 2, name: 'Джинси Levi\'s', type: 'Низ', emoji: '👖' },
    { id: 3, name: 'Кеди Converse', type: 'Взуття', emoji: '👟' }
  ])

  const handleAdd = () => {
    WebApp.showPopup({
      title: 'Додати річ',
      message: 'Скоро тут відкриється камера!',
      buttons: [{ type: 'ok' }]
    });
  }

  return (
    <div className="container">
      <h1>Мій Гардероб</h1>
      <div className="grid">
        {items.map(item => (
          <div key={item.id} className="card">
            <div className="icon">{item.emoji}</div>
            <h3>{item.name}</h3>
            <p>{item.type}</p>
          </div>
        ))}
      </div>
      <button className="add-btn" onClick={handleAdd}>📸 Додати нову річ</button>
    </div>
  )
}

export default App