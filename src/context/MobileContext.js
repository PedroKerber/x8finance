import { createContext, useContext } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'

const MobileCtx = createContext(false)
export const useMobile = () => useContext(MobileCtx)

export function MobileProvider({ children }) {
  const isMobile = useIsMobile()
  return <MobileCtx.Provider value={isMobile}>{children}</MobileCtx.Provider>
}
