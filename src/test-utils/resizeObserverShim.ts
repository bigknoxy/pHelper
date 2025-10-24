// Minimal ResizeObserver shim for Jest + JSDOM environment
class ResizeObserver {
  observers: any[] = []
  constructor(_callback?: any) {
    this.observers = []
    this.observe = this.observe.bind(this)
    this.unobserve = this.unobserve.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.takeRecords = this.takeRecords.bind(this)
  }
  observe(target: any) {
    this.observers.push(target)
  }
  unobserve(target: any) {
    this.observers = this.observers.filter(o => o !== target)
  }
  disconnect() {
    this.observers = []
  }
  takeRecords() {
    return []
  }
}

// @ts-ignore
if (typeof global.ResizeObserver === 'undefined') {
  // @ts-ignore
  global.ResizeObserver = ResizeObserver
}

export default ResizeObserver
