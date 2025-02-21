class Cache {
  constructor() {
    this.cache = {};
    this.timeouts = {};
  }

  set(key, value, ttl) {
    this.cache[key] = value;
    if (ttl) {
      if (this.timeouts[key]) {
        clearTimeout(this.timeouts[key]);
      }
      this.timeouts[key] = setTimeout(() => {
        delete this.cache[key];
      }, ttl);
    }
  }

  get(key) {
    return this.cache[key];
  }
  
  // invalidate method
  invalidate(key) {
    delete this.cache[key];
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
      delete this.timeouts[key];
    }
  }
}

module.exports = Cache;

