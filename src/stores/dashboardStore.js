import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
const initialState = {
    timeRange: '30',
    chartType: 'line',
    selectedMetrics: ['weight', 'workouts'],
    showMovingAverage: true,
    showTrendLine: false,
    showPersonalRecords: true
};
export const useDashboardStore = create()(devtools(persist((set) => ({
    ...initialState,
    setTimeRange: (range) => set({ timeRange: range }, false, 'setTimeRange'),
    setChartType: (type) => set({ chartType: type }, false, 'setChartType'),
    toggleMetric: (metric) => set((state) => ({
        selectedMetrics: state.selectedMetrics.includes(metric)
            ? state.selectedMetrics.filter(m => m !== metric)
            : [...state.selectedMetrics, metric]
    }), false, 'toggleMetric'),
    setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }, false, 'setSelectedMetrics'),
    toggleMovingAverage: () => set((state) => ({ showMovingAverage: !state.showMovingAverage }), false, 'toggleMovingAverage'),
    toggleTrendLine: () => set((state) => ({ showTrendLine: !state.showTrendLine }), false, 'toggleTrendLine'),
    togglePersonalRecords: () => set((state) => ({ showPersonalRecords: !state.showPersonalRecords }), false, 'togglePersonalRecords'),
    resetFilters: () => set(initialState, false, 'resetFilters')
}), {
    name: 'dashboard-store',
    partialize: (state) => ({
        timeRange: state.timeRange,
        chartType: state.chartType,
        selectedMetrics: state.selectedMetrics,
        showMovingAverage: state.showMovingAverage,
        showTrendLine: state.showTrendLine,
        showPersonalRecords: state.showPersonalRecords
    })
}), {
    name: 'dashboard-store'
}));
// Selectors for common state combinations
export const useDashboardFilters = () => useDashboardStore((state) => ({
    timeRange: state.timeRange,
    chartType: state.chartType,
    selectedMetrics: state.selectedMetrics
}));
export const useDashboardSettings = () => useDashboardStore((state) => ({
    showMovingAverage: state.showMovingAverage,
    showTrendLine: state.showTrendLine,
    showPersonalRecords: state.showPersonalRecords
}));
export const useTimeRange = () => useDashboardStore((state) => state.timeRange);
export const useChartType = () => useDashboardStore((state) => state.chartType);
export const useSelectedMetrics = () => useDashboardStore((state) => state.selectedMetrics);
