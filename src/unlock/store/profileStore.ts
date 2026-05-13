import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AssetKey } from '../types'

export interface ProfilePersisted {
  selectedAssets: AssetKey[]
  savedOpportunities: string[]
  completedOpportunities: string[]
  lastUpdated: string
}

interface ProfileState extends ProfilePersisted {
  toggleAsset: (key: AssetKey) => void
  setAssets: (keys: AssetKey[]) => void
  toggleSave: (id: string) => void
  toggleComplete: (id: string) => void
}

function stamp() {
  return new Date().toISOString()
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      selectedAssets: [],
      savedOpportunities: [],
      completedOpportunities: [],
      lastUpdated: stamp(),
      toggleAsset: (key) =>
        set((s) => ({
          selectedAssets: s.selectedAssets.includes(key)
            ? s.selectedAssets.filter((k) => k !== key)
            : [...s.selectedAssets, key],
          lastUpdated: stamp(),
        })),
      setAssets: (keys) => set({ selectedAssets: keys, lastUpdated: stamp() }),
      toggleSave: (id) =>
        set((s) => ({
          savedOpportunities: s.savedOpportunities.includes(id)
            ? s.savedOpportunities.filter((x) => x !== id)
            : [...s.savedOpportunities, id],
          lastUpdated: stamp(),
        })),
      toggleComplete: (id) =>
        set((s) => ({
          completedOpportunities: s.completedOpportunities.includes(id)
            ? s.completedOpportunities.filter((x) => x !== id)
            : [...s.completedOpportunities, id],
          lastUpdated: stamp(),
        })),
    }),
    {
      name: 'unlock_profile',
      partialize: (s) => ({
        selectedAssets: s.selectedAssets,
        savedOpportunities: s.savedOpportunities,
        completedOpportunities: s.completedOpportunities,
        lastUpdated: s.lastUpdated,
      }),
    },
  ),
)
