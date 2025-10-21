import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { safeGet } from '../utils/storage';
import { addTask } from '../api/tasks';
import { addWeight } from '../api/weights';
import { addWorkout } from '../api/workouts';
export default function DataMigrationPrompt() {
    const [conflicts, setConflicts] = useState([]);
    function getLocalData() {
        const tasks = JSON.parse(safeGet('tasks') || '[]');
        const weights = JSON.parse(safeGet('weightEntries') || '[]');
        const workouts = JSON.parse(safeGet('workoutEntries') || '[]');
        return { tasks, weights, workouts };
    }
    function exportBackup() {
        const data = getLocalData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'phelper-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    }
    async function doMigrate() {
        const { tasks, weights, workouts } = getLocalData();
        const foundConflicts = [];
        // simple conflict detection: duplicate title/date
        const seen = new Set();
        for (const t of tasks) {
            const key = `task:${t.title}`;
            if (seen.has(key)) {
                foundConflicts.push(t);
            }
            else {
                seen.add(key);
                await addTask(t.title, t.description);
            }
        }
        for (const w of weights) {
            const key = `weight:${w.date}`;
            if (seen.has(key)) {
                foundConflicts.push(w);
            }
            else {
                seen.add(key);
                await addWeight(w.weight, w.date, w.note);
            }
        }
        for (const wo of workouts) {
            const key = `workout:${wo.date}`;
            if (seen.has(key)) {
                foundConflicts.push(wo);
            }
            else {
                seen.add(key);
                await addWorkout(wo.type, wo.duration, wo.date, wo.notes);
            }
        }
        setConflicts(foundConflicts);
    }
    return (_jsxs("div", { children: [_jsx("h3", { children: "Data Migration" }), _jsx("p", { children: "Import your local items to the server. A backup will be created before migration." }), _jsx("button", { onClick: exportBackup, children: "Download Backup" }), _jsx("button", { onClick: doMigrate, children: "Migrate Now" }), conflicts.length > 0 && (_jsxs("div", { children: [_jsx("h4", { children: "Conflicts" }), _jsx("ul", { children: conflicts.map((c, i) => (_jsx("li", { children: c.title || c.date || 'item' }, i))) })] }))] }));
}
