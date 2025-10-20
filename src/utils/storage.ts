export function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (_err) {
    return null
  }
}

export function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (_err) {
    // ignore
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (_err) {
    // ignore
  }
}
