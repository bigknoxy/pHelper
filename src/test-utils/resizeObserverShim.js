// Minimal ResizeObserver shim for Jest + JSDOM environment
class ResizeObserver {
    observers = [];
    constructor(_callback) {
        this.observers = [];
        this.observe = this.observe.bind(this);
        this.unobserve = this.unobserve.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.takeRecords = this.takeRecords.bind(this);
    }
    observe(target) {
        this.observers.push(target);
    }
    unobserve(target) {
        this.observers = this.observers.filter(o => o !== target);
    }
    disconnect() {
        this.observers = [];
    }
    takeRecords() {
        return [];
    }
}
// @ts-ignore
if (typeof global.ResizeObserver === 'undefined') {
    // @ts-ignore
    global.ResizeObserver = ResizeObserver;
}
export default ResizeObserver;
