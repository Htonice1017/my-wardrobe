// src/App.jsx
import { useState, useEffect } from 'react'
import './App.css'
import { Home, PlusCircle, User, Camera, Image as ImageIcon, Sparkles, Sun, Moon, Star, Plus } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [theme, setTheme] = useState('dark')

  const categories = [
    { id: 1, name: 'Взуття', emoji: '👟' },
    { id: 2, name: 'Верх', emoji: '👕' },
    { id: 3, name: 'Низ', emoji: '👖' },
    { id: 4, name: 'Аксесуари', emoji: '🧢' },
  ]

  const favorites = [
    { id: 101, name: 'Nike Air', emoji: '👟' },
    { id: 102, name: 'Улюблені джинси', emoji: '👖' },
  ]

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // --- ГОЛОВНА (Тут кнопка ЗАЛИШИЛАСЬ) ---
  const renderHome = () => (
    <>
      <div className="header-row">
        <h1>Мій Гардероб</h1>
        {/* Кнопка зміни теми ТІЛЬКИ ТУТ */}
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="filters-row">
        <div className="filter-chip active">Все</div>
        <div className="filter-chip">🌞 Літо</div>
        <div className="filter-chip">🍂 Осінь</div>
        <div className="filter-chip">❄️ Зима</div>
        <div className="filter-chip">🌱 Весна</div>
      </div>

      <div className="section-title">
        <Star size={18} fill="gold" stroke="gold" />
        <span>Улюблене</span>
      </div>

      <div className="favorites-row">
        {favorites.map(item => (
          <div key={item.id} className="fav-card">
            <Star size={14} fill="gold" stroke="gold" className="star-icon" />
            <span className="emoji">{item.emoji}</span>
            <span style={{ fontSize: '10px', marginTop: '4px' }}>{item.name}</span>
          </div>
        ))}
      </div>

      <div className="section-title">
        <span>Категорії</span>
      </div>
      <div className="grid">
        {categories.map((cat) => (
          <div key={cat.id} className="card">
            <span className="emoji">{cat.emoji}</span>
            <span className="card-title">{cat.name}</span>
          </div>
        ))}

        <div className="card add-new">
          <Plus size={32} />
          <span className="card-title" style={{ marginTop: '8px' }}>Створити</span>
        </div>
      </div>
    </>
  )

  // --- ПРОФІЛЬ (Тут кнопку ПРИБРАЛИ) ---
  const renderProfile = () => (
    <>
      <div className="header-row">
        <h1>Профіль</h1>
        {/* Тут була кнопка, тепер пусто */}
      </div>

      <div className="profile-header">
        <div className="avatar">A</div>
        <div className="user-info">
          <h2>Alex</h2>
          <p>@alex_tg_user</p>
        </div>
      </div>

      <div className="section-title">
        <Star size={18} fill="gold" stroke="gold" />
        <span>Мої Топ Речі</span>
      </div>
      <div className="grid">
        {favorites.map(item => (
          <div key={item.id} className="card">
            <Star size={16} fill="gold" stroke="gold" style={{ position: 'absolute', top: '10px', right: '10px' }} />
            <span className="emoji">{item.emoji}</span>
            <span className="card-title">{item.name}</span>
          </div>
        ))}
      </div>
    </>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome()
      case 'add':
        return (
          <div style={{ marginTop: '20px' }}>
            <h2>Додати річ</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Оберіть спосіб:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button className="action-button">
                <div className="icon-wrapper blue"><Camera size={24} color="#fff" /></div>
                <div className="text-wrapper"><span className="btn-title">Сфотографувати</span><span className="btn-subtitle">Використати камеру</span></div>
              </button>
              <button className="action-button">
                <div className="icon-wrapper purple"><ImageIcon size={24} color="#fff" /></div>
                <div className="text-wrapper"><span className="btn-title">Завантажити з галереї</span><span className="btn-subtitle">Обрати готове фото</span></div>
              </button>
              <button className="action-button ai-button">
                <div className="icon-wrapper gold"><Sparkles size={24} color="#fff" /></div>
                <div className="text-wrapper"><span className="btn-title">AI Сканер</span><span className="btn-subtitle">Знайти річ в інтернеті</span></div>
              </button>
            </div>
          </div>
        )
      case 'profile': return renderProfile()
      default: return <div>Error</div>
    }
  }

  return (
    <div className="app-container">
      {renderContent()}
      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Home size={24} />
          <span>Головна</span>
        </button>
        <button className={`nav-item ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
          <PlusCircle size={24} />
          <span>Додати</span>
        </button>
        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={24} />
          <span>Профіль</span>
        </button>
      </nav>
    </div>
  )
}

export default App