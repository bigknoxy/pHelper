import { safeGet, safeSet } from './storage';
export function loadLocalData() {
    const tasks = JSON.parse(safeGet('tasks') || '[]');
    const weights = JSON.parse(safeGet('weightEntries') || '[]');
    const workouts = JSON.parse(safeGet('workoutEntries') || '[]');
    return { tasks, weights, workouts };
}
export function backupData() {
    const data = loadLocalData();
    safeSet('migration_backup', JSON.stringify(data));
    return data;
}
export function detectConflicts(itemsA, itemsB, key) {
    const set = new Set(itemsB.map(i => i[key]));
    return itemsA.filter(i => set.has(i[key]));
}
