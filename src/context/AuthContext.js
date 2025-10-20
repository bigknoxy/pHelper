import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { setToken as tokenSet, getToken as tokenGet, clearToken } from '../api/token';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { addTask } from '../api/tasks';
import { addWeight } from '../api/weights';
import { addWorkout } from '../api/workouts';
import { safeGet, safeSet } from '../utils/storage';
export const AuthContext = createContext(undefined);
function getLocalData() {
    const tasks = JSON.parse(safeGet('tasks') || '[]');
    const weights = JSON.parse(safeGet('weightEntries') || '[]');
    const workouts = JSON.parse(safeGet('workoutEntries') || '[]');
    return { tasks, weights, workouts };
}
export function AuthProvider({ children }) {
    const [userId, setUserId] = useState(null);
    const [tokenState, setTokenState] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [migrated, setMigrated] = useState(safeGet('migrationComplete') === 'true');
    useEffect(() => {
        try {
            const t = tokenGet();
            if (t) {
                setTokenState(t);
                setUserId('me');
            }
        }
        catch {
            // ignore
        }
    }, []);
    async function migrateLocalData() {
        const { tasks, weights, workouts } = getLocalData();
        setLoading(true);
        try {
            for (const t of tasks) {
                await addTask(t.title, t.description);
            }
            for (const w of weights) {
                await addWeight(w.weight, w.date, w.note);
            }
            for (const wo of workouts) {
                await addWorkout(wo.type, wo.duration, wo.date, wo.notes);
            }
            safeSet('migrationComplete', 'true');
            setMigrated(true);
        }
        catch (err) {
            void err;
            setError('Migration failed');
        }
        finally {
            setLoading(false);
        }
    }
    async function login(email, password, remember = false) {
        setLoading(true);
        setError(null);
        try {
            const res = await apiLogin(email, password);
            const jwt = (res?.token) ?? null;
            tokenSet(jwt, remember);
            setTokenState(jwt);
            setUserId('me');
            if (!safeGet('migrationComplete')) {
                if (window.confirm('Import your local data to the backend?')) {
                    await migrateLocalData();
                }
            }
        }
        catch (err) {
            let message = 'Login failed';
            if (typeof err === 'object' && err !== null) {
                const maybe = err;
                message = maybe.response?.data?.error || message;
            }
            setError(message);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }
    async function register(email, password, remember = false) {
        setLoading(true);
        setError(null);
        try {
            const res = await apiRegister(email, password);
            const jwt = (res?.token) ?? null;
            tokenSet(jwt, remember);
            setTokenState(jwt);
            setUserId('me');
            if (!safeGet('migrationComplete')) {
                if (window.confirm('Import your local data to the backend?')) {
                    await migrateLocalData();
                }
            }
        }
        catch (err) {
            let message = 'Registration failed';
            if (typeof err === 'object' && err !== null) {
                const maybe = err;
                message = maybe.response?.data?.error || message;
            }
            setError(message);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }
    function logout() {
        try {
            tokenSet(null, false);
            clearToken();
        }
        catch {
            // ignore
        }
        setTokenState(null);
        setUserId(null);
    }
    return (_jsx(AuthContext.Provider, { value: { userId, token: tokenState, loading, error, migrated, login, register, logout }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
