import { useState, useEffect } from 'react'
import './App.css'
import {
  Home,
  PlusCircle,
  User,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Sun,
  Moon,
  Star,
  ArrowUpRight,
  CheckCircle,
  Layers,
  RotateCcw,
  CalendarCheck,
  Plus,
  Dices,
  Watch
} from 'lucide-react'

// --- БАЗА ДАНИХ (ДЕМО) ---
const wardrobeDatabase = {
  head: [
    { id: 'h1', emoji: '🧢', name: 'Кепка NY', type: 'head' },
    { id: 'h2', emoji: '👒', name: 'Панама', type: 'head' },
    { id: 'h3', emoji: '🕶️', name: 'Окуляри', type: 'head' }
  ],
  torso: [
    { id: 't1', emoji: '👕', name: 'Біла футболка', type: 'torso' },
    { id: 't2', emoji: '🧥', name: 'Джинсовка', type: 'torso' },
    { id: 't3', emoji: '👔', name: 'Сорочка', type: 'torso' },
    { id: 't4', emoji: '👘', name: 'Худі', type: 'torso' }
  ],
  legs: [
    { id: 'l1', emoji: '👖', name: 'Джинси Blue', type: 'legs' },
    { id: 'l2', emoji: '🩳', name: 'Шорти', type: 'legs' },
    { id: 'l3', emoji: '👖', name: 'Карго', type: 'legs' }
  ],
  feet: [
    { id: 'f1', emoji: '👟', name: 'Nike Air', type: 'feet' },
    { id: 'f2', emoji: '👞', name: 'Черевики', type: 'feet' },
    { id: 'f3', emoji: '🧦', name: 'Шкарпетки', type: 'feet' }
  ],
  accessories: [
    { id: 'a1', emoji: '⌚', name: 'Apple Watch', type: 'acc' },
    { id: 'a2', emoji: '👜', name: 'Сумка', type: 'acc' },
    { id: 'a3', emoji: '💍', name: 'Перстень', type: 'acc' },
    { id: 'a4', emoji: '🎧', name: 'Навушники', type: 'acc' },
    { id: 'a5', emoji: '🧣', name: 'Шарф', type: 'acc' }
  ]
}

// Масив "Всього", щоб у бічні слоти можна було пхати що завгодно (Свобода вибору)
const allItemsArray = [
  ...wardrobeDatabase.head,
  ...wardrobeDatabase.torso,
  ...wardrobeDatabase.legs,
  ...wardrobeDatabase.feet,
  ...wardrobeDatabase.accessories
];

function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('home')
  const [activeFilter, setActiveFilter] = useState('Все')
  const [theme, setTheme] = useState('dark')
  const [toast, setToast] = useState(null)

  // Стан конструктора (що вдягнено)
  const [outfit, setOutfit] = useState({
    head: null,
    torso: null,
    legs: null,
    feet: null,
    accLeft: null,
    accRight: null
  })

  // --- EFFECTS ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // --- ACTIONS ---
  const triggerAction = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  // Логіка 1: Ручне перемикання (Клік)
  const cycleItem = (slotKey, preferredCategory) => {
    // Якщо клікаємо на бокові слоти (аксесуари) — беремо із загальної купи
    // Якщо на тіло — беремо тільки відповідний одяг
    let itemsSource = (slotKey === 'accLeft' || slotKey === 'accRight')
      ? allItemsArray
      : wardrobeDatabase[preferredCategory];

    const currentItem = outfit[slotKey];

    const currentIndex = currentItem
      ? itemsSource.findIndex(i => i.id === currentItem.id)
      : -1;

    const nextIndex = (currentIndex + 1) % itemsSource.length;

    // Якщо дійшли до кінця списку - знімаємо річ (обнуляємо)
    if (currentIndex === itemsSource.length - 1) {
      setOutfit(prev => ({ ...prev, [slotKey]: null }));
    } else {
      setOutfit(prev => ({ ...prev, [slotKey]: itemsSource[nextIndex] }));
    }
  }

  // Логіка 2: Розумний Рандомайзер (Авто)
  const smartRandomize = () => {
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    setOutfit({
      head: getRandom(wardrobeDatabase.head),
      torso: getRandom(wardrobeDatabase.torso),
      legs: getRandom(wardrobeDatabase.legs),
      feet: getRandom(wardrobeDatabase.feet),
      // Аксесуари додаються з певною ймовірністю, щоб не завжди були
      accLeft: Math.random() > 0.3 ? getRandom(wardrobeDatabase.accessories) : null,
      accRight: Math.random() > 0.5 ? getRandom(wardrobeDatabase.accessories) : null
    });

    triggerAction('🎲 Образ підібрано!');
  }

  // --- RENDERS ---

  const renderHome = () => (
    <>
      <div className="header-row">
        <h1>Мій Гардероб</h1>
        <button className="theme-btn" onClick={() => {
          const newTheme = theme === 'dark' ? 'light' : 'dark';
          setTheme(newTheme);
          triggerAction(newTheme === 'dark' ? '🌙 Нічна тема' : '☀️ Денна тема');
        }}>
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>

      <div className="filters-row">
        {['Все', '🌞 Літо', '🍂 Осінь', '❄️ Зима', '🌱 Весна'].map(f => (
          <div key={f} className={`filter-chip ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</div>
        ))}
      </div>

      {/* Банер для швидкого переходу в Студію */}
      <div className="card studio-banner" onClick={() => setActiveTab('studio')}>
        <div className="icon-circle"><Layers size={24} color="white" /></div>
        <div>
          <div className="banner-title">Створити Образ</div>
          <div className="banner-subtitle">Збери аутфіт на завтра</div>
        </div>
      </div>

      <div className="section-title"><Star size={18} fill="gold" stroke="gold" /> Улюблене</div>
      <div className="favorites-row">
        {['Nike Air', 'Levi\'s 501'].map(item => (
          <div key={item} className="fav-card" onClick={() => triggerAction(`Відкриваю ${item}`)}>
            <Star size={14} fill="gold" stroke="gold" className="star-icon" />
            <span className="emoji">{item.includes('Nike') ? '👟' : '👖'}</span>
            <span className="fav-name">{item}</span>
          </div>
        ))}
      </div>

      <div className="section-title">Категорії</div>
      <div className="grid">
        {[
          { name: 'Взуття', emoji: '👟' }, { name: 'Верх', emoji: '👕' },
          { name: 'Низ', emoji: '👖' }, { name: 'Аксесуари', emoji: '⌚' },
        ].map(cat => (
          <div key={cat.name} className="card" onClick={() => triggerAction(`Розділ: ${cat.name}`)}>
            <ArrowUpRight size={18} className="category-arrow" />
            <span className="emoji">{cat.emoji}</span>
            <span className="card-title">{cat.name}</span>
          </div>
        ))}

        {/* Кнопка створення категорії */}
        <div className="card add-cat-card" onClick={() => triggerAction('Створення категорії...')}>
          <Plus size={30} color="var(--accent-color)" />
          <span className="card-title" style={{ color: 'var(--accent-color)', marginTop: '8px' }}>Створити</span>
        </div>
      </div>
    </>
  )

  const renderStudio = () => (
    <div className="studio-container">
      <div className="studio-header">
        <h2 style={{ fontSize: '24px', margin: 0 }}>Конструктор</h2>
        <button className="random-btn" onClick={smartRandomize}>
          <Dices size={20} />
          <span>Авто</span>
        </button>
      </div>

      {/* СІТКА МАНЕКЕНА (3 колонки) */}
      <div className="mannequin-grid">

        {/* ЛІВА КОЛОНКА (Аксесуар) */}
        <div className="side-column">
          <div className="slot accessory-slot" onClick={() => cycleItem('accLeft', 'accessories')}>
            {outfit.accLeft ? <span style={{ fontSize: '30px' }}>{outfit.accLeft.emoji}</span> : <Watch size={20} className="slot-icon" />}
          </div>
          {outfit.accLeft && <div className="item-label-mini">{outfit.accLeft.name}</div>}
        </div>

        {/* ЦЕНТРАЛЬНА КОЛОНКА (Тіло) */}
        <div className="center-column">
          {/* Голова */}
          <div className={`slot head ${outfit.head ? 'filled' : ''}`} onClick={() => cycleItem('head', 'head')}>
            {outfit.head ? <span style={{ fontSize: '40px' }}>{outfit.head.emoji}</span> : <div className="slot-icon">🎩</div>}
          </div>

          {/* Тулуб */}
          <div className={`slot torso ${outfit.torso ? 'filled' : ''}`} onClick={() => cycleItem('torso', 'torso')}>
            {outfit.torso ? <span style={{ fontSize: '60px' }}>{outfit.torso.emoji}</span> : <div className="slot-icon">👕</div>}
          </div>

          {/* Ноги */}
          <div className={`slot legs ${outfit.legs ? 'filled' : ''}`} onClick={() => cycleItem('legs', 'legs')}>
            {outfit.legs ? <span style={{ fontSize: '60px' }}>{outfit.legs.emoji}</span> : <div className="slot-icon">👖</div>}
          </div>

          {/* Взуття (два слоти поруч) */}
          <div className="slot feet" onClick={() => cycleItem('feet', 'feet')}>
            <div className="shoe-box">{outfit.feet ? <span style={{ fontSize: '25px' }}>{outfit.feet.emoji}</span> : <span className="slot-icon">👟</span>}</div>
            <div className="shoe-box">{outfit.feet ? <span style={{ fontSize: '25px' }}>{outfit.feet.emoji}</span> : <span className="slot-icon">👟</span>}</div>
          </div>
        </div>

        {/* ПРАВА КОЛОНКА (Аксесуар) */}
        <div className="side-column">
          <div className="slot accessory-slot" style={{ marginTop: '40px' }} onClick={() => cycleItem('accRight', 'accessories')}>
            {outfit.accRight ? <span style={{ fontSize: '30px' }}>{outfit.accRight.emoji}</span> : <span className="slot-icon">💍</span>}
          </div>
          {outfit.accRight && <div className="item-label-mini">{outfit.accRight.name}</div>}
        </div>
      </div>

      <div className="studio-actions">
        <button className="action-button icon-only" onClick={() => {
          setOutfit({ head: null, torso: null, legs: null, feet: null, accLeft: null, accRight: null });
          triggerAction('Очищено');
        }}>
          <RotateCcw size={20} />
        </button>

        <button className="action-button primary" onClick={() => triggerAction('Збережено в Календар! 📅')}>
          <CalendarCheck size={20} />
          <span>Зберегти образ</span>
        </button>
      </div>

      <p className="hint-text">Натискай на зони для зміни. "Авто" підбере образ.</p>
    </div>
  )

  const renderAdd = () => (
    <div style={{ paddingTop: '20px' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Додати річ</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Виберіть спосіб</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button className="card action-card" onClick={() => triggerAction('📸 Камера...')}>
          <div className="icon-box blue"><Camera color="white" size={24} /></div>
          <div className="text-box">
            <div className="title">Камера</div>
            <div className="sub">Зробити знімок</div>
          </div>
        </button>
        <button className="card action-card" onClick={() => triggerAction('🖼️ Галерея...')}>
          <div className="icon-box purple"><ImageIcon color="white" size={24} /></div>
          <div className="text-box">
            <div className="title">Галерея</div>
            <div className="sub">Вибрати з альбому</div>
          </div>
        </button>
        <button className="card action-card ai-card" onClick={() => triggerAction('✨ AI Сканер...')}>
          <div className="icon-box orange"><Sparkles color="white" size={24} /></div>
          <div className="text-box">
            <div className="title orange-text">AI Сканер</div>
            <div className="sub orange-text">Авто-розпізнавання</div>
          </div>
        </button>
      </div>
    </div>
  )

  const renderProfile = () => (
    <div style={{ paddingTop: '20px' }}>
      <div className="profile-card">
        <div className="avatar">A</div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '20px' }}>Alex User</div>
          <div style={{ color: 'var(--accent-color)', fontSize: '14px', fontWeight: '600' }}>Top Stylist</div>
        </div>
      </div>
      <div className="section-title">Статистика</div>
      <div className="grid">
        <div className="card center"><div className="big-num">47</div><div className="small-label">Речі</div></div>
        <div className="card center"><div className="big-num">12</div><div className="small-label">Образи</div></div>
      </div>
    </div>
  )

  return (
    <div className="app-container">
      {toast && <div className="toast-container"><CheckCircle size={16} /> {toast}</div>}

      {activeTab === 'home' && renderHome()}
      {activeTab === 'studio' && renderStudio()}
      {activeTab === 'add' && renderAdd()}
      {activeTab === 'profile' && renderProfile()}

      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Home size={24} /><span>Головна</span>
        </button>
        <button className={`nav-item ${activeTab === 'studio' ? 'active' : ''}`} onClick={() => setActiveTab('studio')}>
          <Layers size={24} /><span>Студія</span>
        </button>
        <button className={`nav-item ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
          <PlusCircle size={24} /><span>Додати</span>
        </button>
        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={24} /><span>Профіль</span>
        </button>
      </nav>
    </div>
  )
}

export default App