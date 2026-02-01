import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')

    const handleLogin = async (event) => {
        event.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.signInWithOtp({ email })

        if (error) {
            alert(error.error_description || error.message)
        } else {
            alert('Перевір свою пошту! Ми надіслали посилання для входу.')
        }
        setLoading(false)
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#121212',
            color: 'white'
        }}>
            <div style={{ width: '300px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '20px' }}>Гардероб 🧢</h1>
                <p style={{ marginBottom: '20px', color: '#aaa' }}>Введи пошту, щоб увійти без пароля</p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="email"
                        placeholder="Твоя пошта"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            backgroundColor: '#2a2a2a',
                            color: 'white'
                        }}
                    />
                    <button
                        disabled={loading}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#646cff',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? 'Надсилаю...' : 'Отримати посилання'}
                    </button>
                </form>
            </div>
        </div>
    )
}