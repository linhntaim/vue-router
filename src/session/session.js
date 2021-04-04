export class Session {
    constructor() {
        this.storeHandler = null
        this.accessTime = 0
        this.nextAccessTime = 1
        this.storeHandlerKey = process.env.SESSION_STORE_HANDLER_KEY ?
            process.env.SESSION_STORE_HANDLER_KEY : '__session'

        this.data = {}
    }

    /**
     *
     * @param {StoreHandler} storeHandler
     */
    attachStoreHandler(storeHandler) {
        this.storeHandler = storeHandler
        return this.sync('save')
    }

    /**
     *
     * @param {StoreHandler} storeHandler
     */
    fromStoreHandler(storeHandler) {
        this.storeHandler = storeHandler
        return this.sync()
    }

    /**
     *
     * @param {String|null} action
     */
    sync(action = null) {
        if (!this.storeHandler) return this

        if (action === 'save') {
            this.storeHandler.setJson(this.storeHandlerKey, this.data)
        } else {
            const data = this.storeHandler.getJson(this.storeHandlerKey)
            if (data) this.data = data
        }
        return this
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
        return this.sync('save')
    }

    retrieve(key, def = null) {
        if (!(key in this.data)) return def

        const data = this.data[key]
        if (data.flash) {
            delete this.data[key]
        }
        return data.value
    }

    forgot(key) {
        delete this.data[key]
        return this.sync('save')
    }
}
