import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearFavoriteIds,
  isFavoriteId,
  readFavoriteIds,
  removeFavoriteId,
  subscribeFavoriteIds,
  toggleFavoriteId,
} from '../lib/favoritesStorage'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(() => readFavoriteIds())
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => subscribeFavoriteIds(setFavoriteIds), [])

  const value = useMemo(
    () => ({
      favoriteIds,
      count: favoriteIds.length,
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
      togglePanel: () => setPanelOpen((prev) => !prev),
      isFavorite: (id) => isFavoriteId(id, favoriteIds),
      toggleFavorite: (id) => {
        const next = toggleFavoriteId(id)
        setFavoriteIds(next)
        return next
      },
      removeFavorite: (id) => {
        const next = removeFavoriteId(id)
        setFavoriteIds(next)
        return next
      },
      clearFavorites: () => {
        const next = clearFavoriteIds()
        setFavoriteIds(next)
        return next
      },
    }),
    [favoriteIds, panelOpen]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return ctx
}
