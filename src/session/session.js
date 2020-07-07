export default class Session {
    constructor() {
        this.accessTime = 0
        this.nextAccessTime = 1

        this.data = {}
    }

    start() {
        this.nextAccessTime = ++this.accessTime + 1
        return this
    }

    restart() {
        this.accessTime = 1
        this.nextAccessTime = 2
        return this
    }

    skip() {
        this.nextAccessTime = this.accessTime
        return this
    }

    abortSkipping() {
        this.nextAccessTime = this.accessTime + 1
        return this
    }

    skipping() {
        return this.nextAccessTime <= this.accessTime
    }

    isFresh() {
        return this.accessTime === 1
    }

    isNotFresh() {
        return this.accessTime > 1
    }

    flash(key, value) {
        return this.store(key, value, true)
    }

    store(key, value, flash = false) {
        this.data[key] = {
            value: value,
            flash: flash,
        }
        return this
    }

    retrieve(key) {
        if (!(key in this.data)) return null

        let data = this.data[key]
        if (data.flash) {
            delete this.data[key]
        }
        return data.value
    }
}
