export function safeGet(key) {
    try {
        return localStorage.getItem(key);
    }
    catch (err) {
        // In some environments (SSR/test runners) localStorage may throw; return null to degrade gracefully
        void err;
        return null;
    }
}
export function safeSet(key, value) {
    try {
        localStorage.setItem(key, value);
    }
    catch (err) {
        void err;
        // ignore write failures
    }
}
export function safeRemove(key) {
    try {
        localStorage.removeItem(key);
    }
    catch (err) {
        void err;
        // ignore
    }
}
// exported low-level wrappers are intentionally minimal and purposefully avoid runtime side-effects in tests
