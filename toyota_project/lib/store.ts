import { create } from "zustand"
import type { Car, CarFilters } from "@/types"

interface StoreState {
  filters: CarFilters
  setFilters: (filters: CarFilters) => void
  selectedCar: Car | null
  setSelectedCar: (car: Car | null) => void
  comparedCars: Car[]
  toggleComparisonCar: (car: Car) => void
  clearComparison: () => void
}

// Note: This uses localStorage in the client, implement with zustand/persist if needed
export const useStore = create<StoreState>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
  selectedCar: null,
  setSelectedCar: (car) => set({ selectedCar: car }),
  comparedCars: [],
  toggleComparisonCar: (car) =>
    set((state) => {
      const exists = state.comparedCars.find((c) => c.id === car.id)
      return {
        comparedCars: exists ? state.comparedCars.filter((c) => c.id !== car.id) : [...state.comparedCars, car],
      }
    }),
  clearComparison: () => set({ comparedCars: [] }),
}))
