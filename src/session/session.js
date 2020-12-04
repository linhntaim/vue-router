export default class Session {
    constructor() {
        this.storeHandler = null
        this.accessTime = 0
        this.nextAccessTime = 1

        this.data = {}
    }

    /**
     *
     * @param {StoreHandler} storeHandler
     */
    attachStoreHandler(storeHandler) {
        this.storeHandler = storeHandler
        this.sync('save')
        return this
    }

    /**
     *
     * @param {StoreHandler} storeHandler
     */
    fromStoreHandler(storeHandler) {
        this.storeHandler = storeHandler
        this.sync()
        return this
    }

    /**
     *
     * @param {String|null} action
     */
    sync(action = null) {
        if (!this.storeHandler) return

        if (action === 'save') {
            this.storeHandler.setJson('__session', this.data)
        } else {
            const data = this.storeHandler.getJson('__session')
            if (data) this.data = data
        }
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
        this.sync('save')
        return this
    }

    retrieve(key, def = null) {
        if (!(key in this.data)) return def

        const data = this.data[key]
        if (data.flash) {
            delete this.data[key]
        }
        return data.value
    }
}
