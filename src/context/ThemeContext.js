import { createContext, useContext, useLayoutEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('x8_theme')
    return saved === 'dark'
  })

  // useLayoutEffect applies before first paint — no flash of wrong theme
  useLayoutEffect(() => {
    document.body.classList.toggle('dark', dark)
  }, [dark])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('x8_theme', next ? 'dark' : 'light')
    // Enable transitions only during the toggle, then remove (keeps perf clean)
    document.body.classList.add('theme-transitioning')
    setTimeout(() => document.body.classList.remove('theme-transitioning'), 300)
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
