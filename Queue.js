/** @type {WeakMap<Queue, Internal>} */
const weakMap = new WeakMap();

class Internal {
    constructor(maxSimultaneously) {
        this.maxSimultaneously = maxSimultaneously;
        this._active = 0;
        this.queue = [];
    }

    get active() {
        return this._active;
    }

    set active(val) {
        this._active = val;
        
        while (this._active < this.maxSimultaneously && this.queue.length) {
            this._active++;
            this.queue.shift()();
        }
    }
}

class Queue {
    constructor(maxSimultaneously = 1) {
        weakMap.set(this, new Internal(maxSimultaneously));
    }

    /** @param { () => Promise<T> } func 
     * @template T
     * @returns {Promise<T>}
    */
    async enqueue(func) {
        const self = weakMap.get(this);

        if (self.active >= self.maxSimultaneously) {
            await new Promise(resolve => self.queue.push(resolve));
        } else {
            self.active++;
        }

        try {
            return await func();
        } catch (err) {
            throw err;
        } finally {
            self.active--;
        }
    }

    pause() {
        const self = weakMap.get(this);
        self.active += self.maxSimultaneously;
    }

    continue() {
        const self = weakMap.get(this);
        self.active -= self.maxSimultaneously;
    }
}

module.exports = Queue;