// app/store/geo.ts v2.6.0
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GeoLocation {
  city: string;
  country: string;
  ip?: string;
}

export interface GeoStoreState {
  // 状态数据
  geo: GeoLocation | null;
  isLoading: boolean;
  
  // 状态更新方法
  setGeo: (geo: GeoLocation | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  // 操作方法
  clearGeo: () => void;
}

export const useGeoStore = create<GeoStoreState>()(
  persist(
    (set) => ({
      // 初始状态
      geo: null,
      isLoading: false,
      
      // 状态更新方法
      setGeo: (geo) => set({ geo }),
      setIsLoading: (isLoading) => set({ isLoading }),
      
      // 操作方法
      clearGeo: () => set({ geo: null }),
    }),
    {
      name: 'geo-storage',
      partialize: (state) => ({
        geo: state.geo
      }),
    }
  )
);
