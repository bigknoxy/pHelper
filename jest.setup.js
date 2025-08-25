if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => {
    // Basic polyfill for objects and arrays only
    if (obj === undefined) return undefined;
    return obj === null ? null : JSON.parse(JSON.stringify(obj));
  };
}
