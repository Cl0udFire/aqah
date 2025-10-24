import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'


export const useAppStore = create()(
  persist(
    (set) => ({
      user: null,
      setUser: (v) => set({ user: v }),
    }),
    {
      name: 'app', // 저장 키
      storage: createJSONStorage(() => localStorage), // 필요 시 IndexedDB 등으로 교체
      partialize: (s) => ({ user: s.user }),       // 선택적: 일부만 저장
    }
  )
)