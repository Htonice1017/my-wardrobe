import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Wardrobe from './Wardrobe' // Імпортуємо твій збережений дизайн

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Якщо НЕМАЄ сесії (користувач не увійшов) -> показуємо екран входу
  if (!session) {
    return <Auth />
  }

  // Якщо Є сесія -> показуємо твій додаток (Гардероб)
  // Ми передаємо session всередину, раптом знадобиться id користувача
  return <Wardrobe key={session.user.id} session={session} />
}

export default App