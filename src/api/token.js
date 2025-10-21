import { safeGet, safeSet, safeRemove } from '../utils/storage';
// Central JWT token helper
// Provides in-memory token storage and optional persistent storage when "remember me" is used
let memoryToken = null;
let remembered = false;
export function setToken(token, remember = false) {
    memoryToken = token;
    remembered = remember;
    if (remember && token) {
        safeSet('jwt', token);
        safeSet('jwt_remembered', 'true');
    }
    else {
        safeRemove('jwt');
        safeRemove('jwt_remembered');
    }
}
export function getToken() {
    // Prefer in-memory token first (set during app runtime)
    if (memoryToken)
        return memoryToken;
    const stored = safeGet('jwt');
    if (stored) {
        remembered = true;
        memoryToken = stored;
        return stored;
    }
    return null;
}
export function clearToken() {
    memoryToken = null;
    remembered = false;
    safeRemove('jwt');
    safeRemove('jwt_remembered');
}
export function isRemembered() {
    if (remembered)
        return true;
    return safeGet('jwt_remembered') === 'true';
}
