'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Eye, EyeOff, ShieldCheck, Zap, FileText } from 'lucide-react'
import styles from './login.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message || 'Error al iniciar sesión')
        setLoading(false)
        return
      }

      router.push('/')
    } catch (err) {
      setError('Ocurrió un error inesperado')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Decorative background elements */}
      <div className={styles.bgGradient}></div>
      <div className={styles.bgOrb1}></div>
      <div className={styles.bgOrb2}></div>

      <div className={styles.wrapper}>
        {/* Left panel - branding */}
        <div className={styles.brandPanel}>
          <div className={styles.brandContent}>
            <div className={styles.brandLogo}>
              <ShieldCheck size={48} strokeWidth={1.5} />
            </div>
            <h1 className={styles.brandTitle}>Tesis AI</h1>
            <p className={styles.brandDescription}>
              Sistema inteligente de revisión de tesis con IA. Automatiza la evaluación académica con precisión y eficiencia.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <Zap size={18} />
                <span>Revisión automatizada con IA</span>
              </div>
              <div className={styles.feature}>
                <FileText size={18} />
                <span>Análisis detallado por secciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - login form */}
        <div className={styles.formPanel}>
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <h2 className={styles.title}>Bienvenido</h2>
              <p className={styles.subtitle}>Ingresa tus credenciales para acceder al panel</p>
            </div>

            <form onSubmit={handleSignIn} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  Contraseña
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`${styles.input} ${styles.passwordInput}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className={styles.error}>
                  <span className={styles.errorIcon}>!</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className={styles.button}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
