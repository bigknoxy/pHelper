import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type TimeRange = '7' | '30' | '90' | '365' | 'all'
export type ChartType = 'line' | 'bar' | 'area' | 'scatter'
export type MetricType = 'weight' | 'workouts' | 'tasks' | 'goals'

interface DashboardFilters {
  timeRange: TimeRange
  chartType: ChartType
  selectedMetrics: MetricType[]
  showMovingAverage: boolean
  showTrendLine: boolean
  showPersonalRecords: boolean
}

interface DashboardState extends DashboardFilters {
  // Actions
  setTimeRange: (range: TimeRange) => void
  setChartType: (type: ChartType) => void
  toggleMetric: (metric: MetricType) => void
  setSelectedMetrics: (metrics: MetricType[]) => void
  toggleMovingAverage: () => void
  toggleTrendLine: () => void
  togglePersonalRecords: () => void
  resetFilters: () => void
}

const initialState: DashboardFilters = {
  timeRange: '30',
  chartType: 'line',
  selectedMetrics: ['weight', 'workouts'],
  showMovingAverage: true,
  showTrendLine: false,
  showPersonalRecords: true
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setTimeRange: (range: TimeRange) =>
          set({ timeRange: range }, false, 'setTimeRange'),

        setChartType: (type: ChartType) =>
          set({ chartType: type }, false, 'setChartType'),

        toggleMetric: (metric: MetricType) =>
          set(
            (state) => ({
              selectedMetrics: state.selectedMetrics.includes(metric)
                ? state.selectedMetrics.filter(m => m !== metric)
                : [...state.selectedMetrics, metric]
            }),
            false,
            'toggleMetric'
          ),

        setSelectedMetrics: (metrics: MetricType[]) =>
          set({ selectedMetrics: metrics }, false, 'setSelectedMetrics'),

        toggleMovingAverage: () =>
          set(
            (state) => ({ showMovingAverage: !state.showMovingAverage }),
            false,
            'toggleMovingAverage'
          ),

        toggleTrendLine: () =>
          set(
            (state) => ({ showTrendLine: !state.showTrendLine }),
            false,
            'toggleTrendLine'
          ),

        togglePersonalRecords: () =>
          set(
            (state) => ({ showPersonalRecords: !state.showPersonalRecords }),
            false,
            'togglePersonalRecords'
          ),

        resetFilters: () =>
          set(initialState, false, 'resetFilters')
      }),
      {
        name: 'dashboard-store',
        partialize: (state) => ({
          timeRange: state.timeRange,
          chartType: state.chartType,
          selectedMetrics: state.selectedMetrics,
          showMovingAverage: state.showMovingAverage,
          showTrendLine: state.showTrendLine,
          showPersonalRecords: state.showPersonalRecords
        })
      }
    ),
    {
      name: 'dashboard-store'
    }
  )
)

// Selectors for common state combinations
export const useDashboardFilters = () => useDashboardStore((state) => ({
  timeRange: state.timeRange,
  chartType: state.chartType,
  selectedMetrics: state.selectedMetrics
}))

export const useDashboardSettings = () => useDashboardStore((state) => ({
  showMovingAverage: state.showMovingAverage,
  showTrendLine: state.showTrendLine,
  showPersonalRecords: state.showPersonalRecords
}))

export const useTimeRange = () => useDashboardStore((state) => state.timeRange)
export const useChartType = () => useDashboardStore((state) => state.chartType)
export const useSelectedMetrics = () => useDashboardStore((state) => state.selectedMetrics)