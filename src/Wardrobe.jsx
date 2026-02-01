import { useState, useEffect, useRef } from 'react'
import Compressor from 'compressorjs';
import { supabase } from './supabaseClient'
import './App.css'
import {
    Home, PlusCircle, User, Camera, Image as ImageIcon,
    Sun, Moon, X, CheckCircle, Layers, RotateCcw, Star,
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

function App() {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState('home')
    const [theme, setTheme] = useState('dark')
    const [toast, setToast] = useState(null)
    const [loading, setLoading] = useState(false)

    // Дані з бази
    const [categories, setCategories] = useState([])
    const [wardrobe, setWardrobe] = useState({}) // Формат: { category_id: [items...] }

    // Стан для додавання нової речі
    const fileInputRef = useRef(null)
    const [newItemImageFile, setNewItemImageFile] = useState(null) // Сам файл для завантаження
    const [newItemPreview, setNewItemPreview] = useState(null) // Прев'ю для показу
    const [newItemCategory, setNewItemCategory] = useState('')
    const [newItemSeasons, setNewItemSeasons] = useState(['summer'])

    // Стан для модалок
    const [showCatModal, setShowCatModal] = useState(false)
    const [newCatName, setNewCatName] = useState('')
    const [newCatType, setNewCatType] = useState('torso')

    const [editingCategory, setEditingCategory] = useState(null)
    const [viewingCategory, setViewingCategory] = useState(null)
    const [selectionSlot, setSelectionSlot] = useState(null)

    // Фільтри
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all')
    const [activeSeasonFilter, setActiveSeasonFilter] = useState('all')

    // Манекен (Outfit)
    const [outfit, setOutfit] = useState({
        head: null, torsoBase: null, torsoOuter: null, legs: null, feet: null, accLeft: null, accRight: null
    })

    // --- INITIALIZATION ---
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    useEffect(() => {
        fetchData()
    }, [])

    const triggerAction = (message) => {
        setToast(message)
        setTimeout(() => setToast(null), 3000)
    }

    // --- SUPABASE DATA FETCHING ---
    async function fetchData() {
        setLoading(true)
        try {
            // 1. Отримуємо категорії
            const { data: catsData, error: catsError } = await supabase
                .from('categories')
                .select('*')
                .order('created_at', { ascending: true })

            if (catsError) throw catsError
            setCategories(catsData)

            // Встановлюємо дефолтну категорію для додавання
            if (catsData.length > 0) setNewItemCategory(catsData[0].id)

            // 2. Отримуємо речі (Сортування: спочатку улюблені, потім нові)
            const { data: itemsData, error: itemsError } = await supabase
                .from('wardrobe_items')
                .select('*')
                .order('is_favorite', { ascending: false }) // 🔥 Спочатку зірочки
                .order('created_at', { ascending: false })  // Потім нові

            if (itemsError) throw itemsError

            // Групуємо речі по категоріях для зручності
            const grouped = {}
            itemsData.forEach(item => {
                if (!grouped[item.category_id]) grouped[item.category_id] = []
                grouped[item.category_id].push(item)
            })
            setWardrobe(grouped)

        } catch (error) {
            console.error('Error fetching data:', error)
            triggerAction('Помилка завантаження даних ❌')
        } finally {
            setLoading(false)
        }
    }

    // --- ACTIONS ---

    // 0. Toggle Favorite (Зірочка)
    const toggleFavorite = async (e, item) => {
        e.stopPropagation();
        e.preventDefault();

        const newStatus = !item.is_favorite;

        // 1. Оптимістичне оновлення стейту (щоб було миттєво)
        setWardrobe(prev => {
            const catId = item.category_id;
            const currentList = prev[catId] || [];

            // Оновлюємо елемент
            const updatedList = currentList.map(i =>
                i.id === item.id ? { ...i, is_favorite: newStatus } : i
            );

            // Пересортовуємо: спочатку улюблені
            updatedList.sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite));

            return { ...prev, [catId]: updatedList };
        });

        // 2. Відправка в базу
        const { error } = await supabase
            .from('wardrobe_items')
            .update({ is_favorite: newStatus })
            .eq('id', item.id);

        if (error) {
            console.error('Favorite error:', error);
            fetchData(); // Якщо помилка - перезавантажуємо, щоб скинути
        }
    };

    // 1. Створити категорію
    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return

        // Отримуємо ID користувача
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            // Спробуємо анонімний, якщо немає (але зазвичай App вже залогінив)
            return triggerAction('Помилка авторизації 🔒')
        }

        const { error } = await supabase
            .from('categories')
            .insert([{
                user_id: user.id,
                name: newCatName,
                type: newCatType,
                emoji: '✨'
            }])

        if (error) {
            console.error(error)
            triggerAction('Помилка створення ❌')
        } else {
            triggerAction(`📂 Створено: ${newCatName}`)
            setShowCatModal(false)
            setNewCatName('')
            fetchData()
        }
    }

    // 2. Видалити категорію
    const handleDeleteCategory = async () => {
        if (!editingCategory) return
        if (window.confirm(`Видалити категорію "${editingCategory.name}"?`)) {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', editingCategory.id)

            if (error) {
                triggerAction('Помилка видалення ❌')
            } else {
                triggerAction('🗑️ Категорію видалено')
                setEditingCategory(null)
                fetchData()
            }
        }
    }

    // 3. Зберегти нову річ (з фото)
    const saveNewItem = async () => {
        if (!newItemImageFile) return triggerAction('Будь ласка, додайте фото 📷')
        if (!newItemCategory) return triggerAction('Оберіть категорію 📂')

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user')

            // А. Завантажуємо фото в Storage
            const fileExt = newItemImageFile.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('wardrobe_files')
                .upload(filePath, newItemImageFile)

            if (uploadError) throw uploadError

            // Б. Отримуємо публічне посилання
            const { data: { publicUrl } } = supabase.storage
                .from('wardrobe_files')
                .getPublicUrl(filePath)

            // В. Записуємо в базу даних
            const { error: dbError } = await supabase
                .from('wardrobe_items')
                .insert([{
                    user_id: user.id,
                    category_id: newItemCategory,
                    image_url: publicUrl,
                    seasons: newItemSeasons.length > 0 ? newItemSeasons : ALL_SEASONS,
                    is_favorite: false // За замовчуванням
                }])

            if (dbError) throw dbError

            triggerAction('✅ Річ збережено!')

            // Скидаємо форму
            setNewItemImageFile(null)
            setNewItemPreview(null)
            setNewItemSeasons(['summer'])

            // Оновлюємо дані і йдемо в студію
            await fetchData()
            setActiveTab('studio')

        } catch (error) {
            console.error(error)
            triggerAction('Помилка збереження ❌')
        } finally {
            setLoading(false)
        }
    }

    // 4. Видалити річ
    const handleDeleteItem = async (e, itemId) => {
        e.stopPropagation()
        if (!window.confirm('Видалити цю річ?')) return

        const { error } = await supabase
            .from('wardrobe_items')
            .delete()
            .eq('id', itemId)

        if (error) {
            triggerAction('Помилка видалення ❌')
        } else {
            // Видаляємо локально
            const newWardrobe = { ...wardrobe }
            Object.keys(newWardrobe).forEach(key => {
                newWardrobe[key] = newWardrobe[key].filter(i => i.id !== itemId)
            })
            setWardrobe(newWardrobe)

            // Очищаємо манекен
            setOutfit(prev => {
                const next = { ...prev }
                Object.keys(next).forEach(slot => {
                    if (next[slot]?.id === itemId) next[slot] = null
                })
                return next
            })

            triggerAction('🗑️ Річ видалено')
        }
    }

    // --- HELPER FUNCTIONS ---

    // --- HELPER FUNCTIONS ---

    const handleFileSelect = (event) => {
        const file = event.target.files[0]
        if (!file) return

        // 🔥 СТИСНЕННЯ ФОТО
        new Compressor(file, {
            quality: 0.6,      // Знижуємо якість до 60% (економія місця ~90%)
            maxWidth: 1200,    // Зменшуємо розмір, якщо фото величезне
            success(result) {
                // result - це вже стиснений файл
                setNewItemImageFile(result)
                setNewItemPreview(URL.createObjectURL(result))
            },
            error(err) {
                console.error('Помилка стиснення:', err.message)
                triggerAction('Помилка обробки фото ❌')
            },
        })
    }

    const toggleNewItemSeason = (seasonId) => {
        setNewItemSeasons(prev => {
            if (prev.includes(seasonId)) return prev.filter(s => s !== seasonId)
            return [...prev, seasonId]
        })
    }

    const toggleAllSeasons = () => {
        if (newItemSeasons.length === 4) setNewItemSeasons([])
        else setNewItemSeasons([...ALL_SEASONS])
    }

    // Розумний рандомайзер
    const smartRandomize = () => {
        const getItemsByType = (type) => {
            const relevantCats = categories.filter(c => c.type === type)
            let allItems = []
            relevantCats.forEach(cat => {
                if (wardrobe[cat.id]) {
                    allItems = [...allItems, ...wardrobe[cat.id]]
                }
            })
            return allItems
        }

        const rand = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null

        setOutfit({
            head: rand(getItemsByType('head')),
            torsoBase: rand(getItemsByType('torso')),
            torsoOuter: Math.random() > 0.5 ? rand(getItemsByType('torso')) : null,
            legs: rand(getItemsByType('legs')),
            feet: rand(getItemsByType('feet')),
            accLeft: Math.random() > 0.3 ? rand(getItemsByType('acc')) : null,
            accRight: Math.random() > 0.5 ? rand(getItemsByType('acc')) : null
        })
        triggerAction('🎲 Образ підібрано!')
    }

    // Фільтрація речей для модалки вибору
    const getFilteredItemsForSelector = () => {
        if (!selectionSlot) return { items: [], relevantCategories: [] }

        const slotType = selectionSlot.type
        const relevantCategories = categories.filter(c => c.type === slotType)

        let items = []

        if (activeCategoryFilter === 'all') {
            relevantCategories.forEach(cat => {
                if (wardrobe[cat.id]) items = [...items, ...wardrobe[cat.id]]
            })
        } else {
            items = wardrobe[activeCategoryFilter] || []
        }

        // Фільтр по сезону
        if (activeSeasonFilter !== 'all') {
            items = items.filter(i => i.seasons && i.seasons.includes(activeSeasonFilter))
        }

        return { items, relevantCategories }
    }

    const openSelector = (slotKey, typeKey) => {
        setSelectionSlot({ slot: slotKey, type: typeKey })
        setActiveCategoryFilter('all')
        setActiveSeasonFilter('all')
    }

    const selectItem = (item) => {
        if (selectionSlot) {
            setOutfit(prev => ({ ...prev, [selectionSlot.slot]: item }))
            setSelectionSlot(null)
        }
    }

    const renderItemVisual = (item, size) => {
        if (!item) return null
        if (item.image_url) return <img src={item.image_url} alt="item" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
        return <span style={{ fontSize: size }}>{item.emoji || '👕'}</span>
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
                        {outfit.torsoBase ? renderItemVisual(outfit.torsoBase, '50px') : <div className="slot-icon">👕</div>}
                    </div>
                    <div className={`slot half ${outfit.torsoOuter ? 'filled' : ''}`} onClick={() => openSelector('torsoOuter', 'torso')}>
                        {outfit.torsoOuter ? renderItemVisual(outfit.torsoOuter, '50px') : <div className="slot-icon">🧥</div>}
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
            {!newItemPreview ? (
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
                        <button className="action-button icon-only" onClick={() => { setNewItemPreview(null); setNewItemImageFile(null); }}><X size={24} /></button>
                    </div>
                    <div className="image-preview-box"><img src={newItemPreview} alt="Preview" /></div>

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
                    <button className="action-button primary" style={{ marginTop: '30px' }} onClick={saveNewItem} disabled={loading}>
                        <Save size={20} /><span>{loading ? 'Збереження...' : 'Зберегти річ'}</span>
                    </button>
                </div>
            )}
        </div>
    )

    const selectorData = getFilteredItemsForSelector()

    return (
        <div className="app-container">
            {toast && <div className="toast-container"><CheckCircle size={18} /> {toast}</div>}
            {loading && <div className="loading-overlay">Завантаження...</div>}

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
                        <label className="sub-label" style={{ marginTop: 10 }}>Тип:</label>
                        <select value={newCatType} onChange={(e) => setNewCatType(e.target.value)} className="modal-input">
                            <option value="head">Голова (Кепки, шапки)</option>
                            <option value="torso">Верх (Футболки, куртки)</option>
                            <option value="legs">Низ (Штани, шорти)</option>
                            <option value="feet">Взуття</option>
                            <option value="acc">Аксесуари</option>
                        </select>
                        <div className="modal-actions">
                            <button className="action-button primary" onClick={handleCreateCategory}>Створити</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT CATEGORY */}
            {editingCategory && (
                <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="settings-modal-header">
                            <h3>Налаштування: {editingCategory.name}</h3>
                        </div>
                        <div className="danger-zone">
                            <button className="delete-cat-btn" onClick={handleDeleteCategory}>
                                <Trash2 size={20} /> Видалити категорію
                            </button>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <button className="action-button icon-only" style={{ width: '100%', borderRadius: 12 }} onClick={() => setEditingCategory(null)}>Скасувати</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: VIEW CATEGORY (ITEMS LIST) */}
            {viewingCategory && (
                <div className="modal-overlay" onClick={() => setViewingCategory(null)}>
                    <div className="modal-content" style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <h3>{categories.find(c => c.id === viewingCategory)?.name}</h3>
                            <button className="action-button icon-only" onClick={() => setViewingCategory(null)}><X size={24} /></button>
                        </div>
                        <div className="selector-grid">
                            {wardrobe[viewingCategory]?.length > 0 ? wardrobe[viewingCategory].map(item => (
                                <div
                                    key={item.id}
                                    className="selector-item"
                                    style={{
                                        position: 'relative',
                                        touchAction: 'manipulation',
                                        zIndex: 1
                                    }}
                                >
                                    {/* ⭐ ЗІРОЧКА ⭐ */}
                                    <div
                                        onClick={(e) => toggleFavorite(e, item)}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            padding: '8px',
                                            zIndex: 20,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Star
                                            size={20}
                                            fill={item.is_favorite ? "#FFD700" : "rgba(0,0,0,0.3)"}
                                            color={item.is_favorite ? "#FFD700" : "white"}
                                            strokeWidth={2}
                                        />
                                    </div>

                                    {/* ❌ КНОПКА ВИДАЛЕННЯ (посунув трохи вправо, щоб не заважала зірці) */}
                                    <button
                                        className="delete-item-btn"
                                        onClick={(e) => handleDeleteItem(e, item.id)}
                                        style={{ zIndex: 20 }}
                                    >
                                        <X size={14} />
                                    </button>

                                    {renderItemVisual(item)}

                                    <div className="item-tag">
                                        {item.seasons?.length === 4 ? '♾️' : item.seasons?.map(sid => SEASONS_CONFIG.find(s => s.id === sid)?.icon)}
                                    </div>
                                </div>
                            )) : <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: 20 }}>Тут пусто 🍃</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: SELECTOR (FOR OUTFIT) */}
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

                        <button className="empty-slot-btn" onClick={() => selectItem(null)}><Ban size={16} /> Зняти річ</button>

                        <div className="selector-grid">
                            {selectorData.items && selectorData.items.length > 0 ? selectorData.items.map(item => (
                                <div
                                    key={item.id}
                                    className="selector-item"
                                    onClick={() => selectItem(item)}
                                    style={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        touchAction: 'manipulation' // 🔥 Фікс кліку
                                    }}
                                >
                                    {/* Також показуємо зірочку в конструкторі, щоб швидко знайти улюблене */}
                                    {item.is_favorite && (
                                        <div style={{ position: 'absolute', top: 5, left: 5, zIndex: 10 }}>
                                            <Star size={16} fill="#FFD700" color="#FFD700" />
                                        </div>
                                    )}

                                    {renderItemVisual(item)}
                                    {(outfit.torsoBase?.id === item.id || outfit.torsoOuter?.id === item.id || outfit[selectionSlot.slot]?.id === item.id) &&
                                        <div style={{ position: 'absolute', top: 4, right: 4, background: 'var(--accent-color)', borderRadius: '50%', padding: '2px', display: 'flex' }}><CheckCircle size={14} color="white" /></div>
                                    }
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