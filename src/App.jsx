import { useState, useEffect } from 'react'
// 👇 ВАЖЛИВО: Імпортуємо вже налаштований клієнт з твого файлу
import { supabase } from './supabaseClient'
import Wardrobe from './Wardrobe'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [telegramUser, setTelegramUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Налаштування Телеграму
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const user = tg.initDataUnsafe?.user;
      if (user) setTelegramUser(user);
    }

    // 2. Автоматичний вхід (Анонімний)
    const handleAuth = async () => {
      // Перевіряємо, чи ми вже залогінені
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        console.log("Вже є сесія:", session.user.id)
        setSession(session)
      } else {
        console.log("Спроба анонімного входу...")
        const { data, error } = await supabase.auth.signInAnonymously()

        if (error) {
          console.error("Помилка входу:", error.message)
          alert("Помилка входу: " + error.message)
        } else {
          console.log("Успішний анонімний вхід!", data)
          setSession(data.session)
        }
      }
      setLoading(false)
    }

    handleAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
        Завантаження гардеробу... 🧥
      </div>
    )
  }

  return (
    <div className="app-container">
      {session ? (
        <Wardrobe session={session} telegramUser={telegramUser} />
      ) : (
        <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
          Не вдалося увійти. Оновіть сторінку.
        </div>
      )}
    </div>
  )
}

export default App