import { useState, useEffect, useRef } from 'react'
import './App.css'
import {
  Home, PlusCircle, User, Camera, Image as ImageIcon, Sparkles,
  Sun, Moon, Eye, X, CheckCircle, Layers, RotateCcw,
  CalendarCheck, Plus, Dices, Watch, Save, Ban, Trash2, Settings
} from 'lucide-react'

// --- CONSTANTS ---
const ALL_SEASONS = ['summer', 'autumn', 'winter', 'spring'];

const SEASONS_CONFIG = [
  { id: 'summer', icon: '☀️', label: 'Літо' },
  { id: 'autumn', icon: '🍂', label: 'Осінь' },
  { id: 'winter', icon: '❄️', label: 'Зима' },
  { id: 'spring', icon: '🌱', label: 'Весна' }
]

const initialCategories = [
  { id: 'head', name: 'Голова', emoji: '🧢', type: 'head' },
  { id: 'torso', name: 'Верх (База)', emoji: '👕', type: 'torso' },
  { id: 'outerwear', name: 'Верхній одяг', emoji: '🧥', type: 'torso' },
  { id: 'legs', name: 'Низ', emoji: '👖', type: 'legs' },
  { id: 'feet', name: 'Взуття', emoji: '👟', type: 'feet' },
  { id: 'accessories', name: 'Аксесуари', emoji: '⌚', type: 'acc' }
]

const initialDatabase = {
  head: [{ id: 'h1', emoji: '🧢', name: 'Кепка', type: 'head', seasons: ['summer', 'spring'] }],
  torso: [{ id: 't1', emoji: '👕', name: 'Футболка', type: 'torso', seasons: ['summer'] }],
  outerwear: [{ id: 'o1', emoji: '🧥', name: 'Пальто', type: 'torso', seasons: ['winter', 'autumn'] }],
  legs: [{ id: 'l1', emoji: '👖', name: 'Джинси', type: 'legs', seasons: ['summer', 'autumn', 'winter', 'spring'] }],
  feet: [{ id: 'f1', emoji: '👟', name: 'Кроси', type: 'feet', seasons: ['spring', 'summer', 'autumn'] }],
  accessories: [{ id: 'a1', emoji: '⌚', name: 'Годинник', type: 'acc', seasons: ['summer', 'autumn', 'winter', 'spring'] }]
}

function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('home')
  const [theme, setTheme] = useState('dark')
  const [toast, setToast] = useState(null)

  const [categories, setCategories] = useState(initialCategories)
  const [wardrobe, setWardrobe] = useState(initialDatabase)

  const fileInputRef = useRef(null)
  const [newItemImage, setNewItemImage] = useState(null)
  const [newItemCategory, setNewItemCategory] = useState('torso')
  const [newItemSeasons, setNewItemSeasons] = useState(['summer'])

  const [showCatModal, setShowCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState('torso')

  // Стан для редагування/видалення категорії (Шестірня)
  const [editingCategory, setEditingCategory] = useState(null)

  const [viewingCategory, setViewingCategory] = useState(null)
  const [selectionSlot, setSelectionSlot] = useState(null)

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all')
  const [activeSeasonFilter, setActiveSeasonFilter] = useState('all')

  const [outfit, setOutfit] = useState({
    head: null, torsoBase: null, torsoOuter: null, legs: null, feet: null, accLeft: null, accRight: null
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const triggerAction = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  // --- ACTIONS ---

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const newId = `custom_${Date.now()}`;
    const newCategory = { id: newId, name: newCatName, emoji: '✨', type: newCatType };

    setCategories([...categories, newCategory]);
    setWardrobe(prev => ({ ...prev, [newId]: [] }));
    setShowCatModal(false);
    setNewCatName('');
    triggerAction(`📂 Створено: ${newCatName}`);
  }

  const handleDeleteCategory = () => {
    if (!editingCategory) return;
    if (window.confirm(`Видалити категорію "${editingCategory.name}" і всі речі в ній?`)) {
      setCategories(prev => prev.filter(c => c.id !== editingCategory.id));
      setWardrobe(prev => {
        const newW = { ...prev };
        delete newW[editingCategory.id];
        return newW;
      });
      setEditingCategory(null); // Закрити модалку
      triggerAction('🗑️ Категорію видалено');
    }
  }

  const handleDeleteItem = (e, catId, itemId) => {
    e.stopPropagation();
    if (window.confirm('Видалити цю річ?')) {
      setWardrobe(prev => ({
        ...prev,
        [catId]: prev[catId].filter(i => i.id !== itemId)
      }));

      // Зняти з манекена, якщо вдягнено
      setOutfit(prev => {
        const newOutfit = { ...prev };
        Object.keys(newOutfit).forEach(slot => {
          if (newOutfit[slot]?.id === itemId) {
            newOutfit[slot] = null;
          }
        });
        return newOutfit;
      });

      triggerAction('🗑️ Річ видалено');
    }
  }

  const toggleNewItemSeason = (seasonId) => {
    setNewItemSeasons(prev => {
      if (prev.includes(seasonId)) return prev.filter(s => s !== seasonId);
      return [...prev, seasonId];
    });
  }

  const toggleAllSeasons = () => {
    if (newItemSeasons.length === 4) setNewItemSeasons([]);
    else setNewItemSeasons([...ALL_SEASONS]);
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewItemImage(URL.createObjectURL(file));
      setNewItemSeasons(['summer']);
    }
  };

  const saveNewItem = () => {
    if (!newItemImage) return;
    const newItem = {
      id: Date.now().toString(),
      emoji: null,
      imageSrc: newItemImage,
      name: 'Річ',
      type: newItemCategory,
      seasons: newItemSeasons.length > 0 ? newItemSeasons : ALL_SEASONS
    };

    setWardrobe(prev => ({
      ...prev,
      [newItemCategory]: [...(prev[newItemCategory] || []), newItem]
    }));

    triggerAction('✅ Річ додано!');
    setNewItemImage(null);
    setActiveTab('studio');
  };

  const smartRandomize = () => {
    const getItems = (type) => {
      const relevantCategories = categories.filter(c => c.type === type);
      let all = [];
      relevantCategories.forEach(cat => {
        if (wardrobe[cat.id]) all = [...all, ...wardrobe[cat.id]];
      });
      return all;
    };
    const rand = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    setOutfit({
      head: rand(getItems('head')),
      torsoBase: rand(getItems('torso')),
      torsoOuter: Math.random() > 0.5 ? rand(getItems('torso')) : null,
      legs: rand(getItems('legs')),
      feet: rand(getItems('feet')),
      accLeft: Math.random() > 0.3 ? rand(getItems('acc')) : null,
      accRight: Math.random() > 0.5 ? rand(getItems('acc')) : null
    });
    triggerAction('🎲 Образ підібрано!');
  }

  const getFilteredItems = (slotType, categoryId, seasonId) => {
    const relevantCategories = categories.filter(c => c.type === slotType);
    let items = [];

    if (categoryId === 'all') {
      relevantCategories.forEach(cat => {
        items = [...items, ...(wardrobe[cat.id] || [])];
      });
    } else {
      items = wardrobe[categoryId] || [];
    }

    if (seasonId !== 'all') {
      items = items.filter(i => i.seasons && i.seasons.includes(seasonId));
    }

    return { items, relevantCategories };
  }

  const openSelector = (slotKey, typeKey) => {
    setSelectionSlot({ slot: slotKey, type: typeKey });
    setActiveCategoryFilter('all');
    setActiveSeasonFilter('all');
  }

  const selectItem = (item) => {
    if (selectionSlot) {
      setOutfit(prev => ({ ...prev, [selectionSlot.slot]: item }));
      setSelectionSlot(null);
    }
  }

  const renderItemVisual = (item, size) => {
    if (!item) return null;
    if (item.imageSrc) return <img src={item.imageSrc} alt="item" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }} />
    return <span style={{ fontSize: size }}>{item.emoji}</span>
  }

  // --- VIEWS ---

  const renderHome = () => (
    <>
      <div className="header-row">
        <h1>Гардероб</h1>
        <button className="theme-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <div className="card studio-banner" onClick={() => setActiveTab('studio')}>
        <div className="icon-circle"><Layers size={24} color="white" /></div>
        <div><div className="banner-title">Створити Образ</div><div className="banner-subtitle">Збери аутфіт на завтра</div></div>
      </div>

      <div className="section-title">Ваші Категорії</div>
      <div className="grid">
        {categories.map(cat => (
          <div key={cat.id} className="card" onClick={() => setViewingCategory(cat.id)}>
            {/* Кнопка налаштувань (Шестірня) */}
            <div className="card-actions">
              <button
                className="settings-btn"
                onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); }}
              >
                <Settings size={18} />
              </button>
            </div>

            <span className="emoji">{cat.emoji}</span>
            <span className="card-title">{cat.name}</span>
            <span className="card-count">{wardrobe[cat.id]?.length || 0} речей</span>
          </div>
        ))}
        <div className="card add-cat-card" onClick={() => setShowCatModal(true)}>
          <Plus size={32} color="var(--accent-color)" />
          <span className="card-title" style={{ color: 'var(--accent-color)', marginTop: '8px' }}>Створити</span>
        </div>
      </div>
    </>
  )

  const renderStudio = () => (
    <div className="studio-container">
      <div className="studio-header">
        <h2 style={{ fontSize: '24px', margin: 0 }}>Конструктор</h2>
        <button className="random-btn" onClick={smartRandomize}><Dices size={18} /><span>Авто</span></button>
      </div>

      <div className="mannequin-grid">
        <div className={`slot head ${outfit.head ? 'filled' : ''}`} onClick={() => openSelector('head', 'head')}>
          {outfit.head ? renderItemVisual(outfit.head, '40px') : <div className="slot-icon">🧢</div>}
        </div>

        <div className="split-slot-container">
          <div className={`slot half ${outfit.torsoBase ? 'filled' : ''}`} onClick={() => openSelector('torsoBase', 'torso')}>
            {outfit.torsoBase ? renderItemVisual(outfit.torsoBase, '50px') : (
              <>
                <div className="slot-icon">👕</div>
                <span style={{ fontSize: 10, opacity: 0.6 }}>Шар 1</span>
              </>
            )}
          </div>
          <div className={`slot half ${outfit.torsoOuter ? 'filled' : ''}`} onClick={() => openSelector('torsoOuter', 'torso')}>
            {outfit.torsoOuter ? renderItemVisual(outfit.torsoOuter, '50px') : (
              <>
                <div className="slot-icon">🧥</div>
                <span style={{ fontSize: 10, opacity: 0.6 }}>Шар 2</span>
              </>
            )}
          </div>
        </div>

        <div className="body-row">
          <div className={`slot accessory-slot ${outfit.accLeft ? 'filled' : ''}`} onClick={() => openSelector('accLeft', 'acc')}>
            {outfit.accLeft ? renderItemVisual(outfit.accLeft, '25px') : <Watch size={20} className="slot-icon" />}
          </div>

          <div className={`slot legs ${outfit.legs ? 'filled' : ''}`} onClick={() => openSelector('legs', 'legs')}>
            {outfit.legs ? renderItemVisual(outfit.legs, '70px') : <div className="slot-icon">👖</div>}
          </div>

          <div className={`slot accessory-slot ${outfit.accRight ? 'filled' : ''}`} onClick={() => openSelector('accRight', 'acc')}>
            {outfit.accRight ? renderItemVisual(outfit.accRight, '25px') : <span className="slot-icon">💍</span>}
          </div>
        </div>

        <div className="slot feet" onClick={() => openSelector('feet', 'feet')}>
          <div className="shoe-box">{outfit.feet ? renderItemVisual(outfit.feet, '30px') : <span className="slot-icon">👟</span>}</div>
          <div className="shoe-box">{outfit.feet ? renderItemVisual(outfit.feet, '30px') : <span className="slot-icon">👟</span>}</div>
        </div>
      </div>

      <div className="studio-actions">
        <button className="action-button icon-only" onClick={() => setOutfit({ head: null, torsoBase: null, torsoOuter: null, legs: null, feet: null, accLeft: null, accRight: null })}>
          <RotateCcw size={22} />
        </button>
        <button className="action-button primary" onClick={() => triggerAction('Образ збережено!')}><CalendarCheck size={20} /><span>Готово</span></button>
      </div>
    </div>
  )

  const renderAdd = () => (
    <div style={{ paddingTop: '10px' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />
      {!newItemImage ? (
        <>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Додати річ</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button className="card action-card" onClick={() => fileInputRef.current.click()}>
              <div className="icon-box blue"><Camera color="white" size={24} /></div>
              <div className="text-box"><div className="title">Зробити фото</div></div>
            </button>
            <button className="card action-card" onClick={() => fileInputRef.current.click()}>
              <div className="icon-box purple"><ImageIcon color="white" size={24} /></div>
              <div className="text-box"><div className="title">З галереї</div></div>
            </button>
          </div>
        </>
      ) : (
        <div className="preview-container fade-in">
          <div className="header-row">
            <h2 style={{ margin: 0 }}>Деталі</h2>
            <button className="action-button icon-only" onClick={() => setNewItemImage(null)}><X size={24} /></button>
          </div>
          <div className="image-preview-box"><img src={newItemImage} alt="Preview" /></div>

          <div>
            <label className="sub-label">Сезонність</label>
            <div className="season-selector">
              <button className={`season-btn ${newItemSeasons.length === 4 ? 'active' : ''}`} onClick={toggleAllSeasons} title="Весь рік">♾️</button>
              {SEASONS_CONFIG.map(s => (
                <button key={s.id} className={`season-btn ${newItemSeasons.includes(s.id) ? 'active' : ''}`} onClick={() => toggleNewItemSeason(s.id)}>
                  {s.icon}
                </button>
              ))}
            </div>

            <label className="sub-label">Категорія</label>
            <div className="category-selector">
              {categories.map(cat => (
                <button key={cat.id} className={`cat-btn ${newItemCategory === cat.id ? 'active' : ''}`} onClick={() => setNewItemCategory(cat.id)}>
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>
          <button className="action-button primary" style={{ marginTop: '30px' }} onClick={saveNewItem}>
            <Save size={20} /><span>Зберегти річ</span>
          </button>
        </div>
      )}
    </div>
  )

  const selectorData = selectionSlot
    ? getFilteredItems(selectionSlot.type, activeCategoryFilter, activeSeasonFilter)
    : { items: [], relevantCategories: [] };

  return (
    <div className="app-container">
      {toast && <div className="toast-container"><CheckCircle size={18} /> {toast}</div>}

      {activeTab === 'home' && renderHome()}
      {activeTab === 'studio' && renderStudio()}
      {activeTab === 'add' && renderAdd()}
      {activeTab === 'profile' && <div style={{ paddingTop: 50 }} className="center">Профіль (В розробці)</div>}

      {/* MODAL: NEW CATEGORY */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Нова категорія</h3>
              <button className="action-button icon-only" style={{ width: 30, height: 30 }} onClick={() => setShowCatModal(false)}><X size={20} /></button>
            </div>
            <input className="modal-input" placeholder="Назва (напр. 'Шарфи')..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
            <label className="sub-label" style={{ marginTop: 0 }}>Тип:</label>
            <select value={newCatType} onChange={(e) => setNewCatType(e.target.value)} className="modal-input">
              <option value="head">Голова</option>
              <option value="torso">Верх</option>
              <option value="legs">Низ</option>
              <option value="feet">Взуття</option>
              <option value="acc">Аксесуари</option>
            </select>
            <div className="modal-actions">
              <button className="action-button primary" onClick={handleCreateCategory}>Створити</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CATEGORY SETTINGS (Нове) */}
      {editingCategory && (
        <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>Налаштування: {editingCategory.name}</h3>
            </div>

            <div className="danger-zone">
              <button className="delete-cat-btn" onClick={handleDeleteCategory}>
                <Trash2 size={20} />
                Видалити категорію
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              <button className="action-button icon-only" style={{ width: '100%', borderRadius: 12 }} onClick={() => setEditingCategory(null)}>Скасувати</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW CATEGORY (WITH CLEAN X BUTTON) */}
      {viewingCategory && (
        <div className="modal-overlay" onClick={() => setViewingCategory(null)}>
          <div className="modal-content" style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>{categories.find(c => c.id === viewingCategory)?.name}</h3>
              <button className="action-button icon-only" onClick={() => setViewingCategory(null)}><X size={24} /></button>
            </div>
            <div className="selector-grid">
              {wardrobe[viewingCategory]?.length > 0 ? wardrobe[viewingCategory].map(item => (
                <div key={item.id} className="selector-item">
                  {/* Гарна кнопка X */}
                  <button className="delete-item-btn" onClick={(e) => handleDeleteItem(e, viewingCategory, item.id)}>
                    <X size={14} />
                  </button>

                  {item.imageSrc ? <img src={item.imageSrc} className="selector-img" /> : <span className="selector-emoji">{item.emoji}</span>}
                  <div className="item-tag">
                    {item.seasons?.length === 4 ? '♾️' : item.seasons?.map(sid => SEASONS_CONFIG.find(s => s.id === sid)?.icon)}
                  </div>
                </div>
              )) : <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: 20 }}>Тут поки пусто 🍃</div>}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ITEM SELECTOR */}
      {selectionSlot && (
        <div className="modal-overlay" onClick={() => setSelectionSlot(null)}>
          <div className="modal-content" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Вибір</h3>
              <button className="action-button icon-only" onClick={() => setSelectionSlot(null)}><X size={24} /></button>
            </div>

            <div className="modal-filters">
              <button className={`filter-chip-modal ${activeCategoryFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveCategoryFilter('all')}>Всі</button>
              {selectorData.relevantCategories?.map(cat => (
                <button key={cat.id} className={`filter-chip-modal ${activeCategoryFilter === cat.id ? 'active' : ''}`} onClick={() => setActiveCategoryFilter(cat.id)}>
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>

            <div className="modal-filters" style={{ marginTop: '-5px' }}>
              <button className={`filter-chip-modal ${activeSeasonFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveSeasonFilter('all')}>Всі сезони</button>
              {SEASONS_CONFIG.map(s => (
                <button key={s.id} className={`filter-chip-modal ${activeSeasonFilter === s.id ? 'active' : ''}`} onClick={() => setActiveSeasonFilter(s.id)}>
                  {s.icon}
                </button>
              ))}
            </div>

            <button className="empty-slot-btn" onClick={() => selectItem(null)}><Ban size={16} /> Зняти річ</button>

            <div className="selector-grid">
              {selectorData.items && selectorData.items.length > 0 ? selectorData.items.map(item => (
                <div key={item.id} className="selector-item" onClick={() => selectItem(item)}>
                  {item.imageSrc ? <img src={item.imageSrc} className="selector-img" /> : <span className="selector-emoji">{item.emoji}</span>}
                  {(outfit.torsoBase?.id === item.id || outfit.torsoOuter?.id === item.id || outfit[selectionSlot.slot]?.id === item.id) &&
                    <div style={{ position: 'absolute', top: 4, right: 4, background: 'var(--accent-color)', borderRadius: '50%', padding: '2px', display: 'flex' }}><CheckCircle size={14} color="white" /></div>
                  }
                  <div className="item-tag">
                    {item.seasons?.length === 4 ? '♾️' : item.seasons?.map(sid => SEASONS_CONFIG.find(s => s.id === sid)?.icon)}
                  </div>
                </div>
              )) : <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: 20 }}>Нічого не знайдено 🔍</div>}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}><Home size={24} /></button>
        <button className={`nav-item ${activeTab === 'studio' ? 'active' : ''}`} onClick={() => setActiveTab('studio')}><Layers size={24} /></button>
        <button className={`nav-item ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}><PlusCircle size={24} /></button>
        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><User size={24} /></button>
      </nav>
    </div>
  )
}

export default App