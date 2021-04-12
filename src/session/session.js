export class Session {
    constructor() {
        this.storeHandler = null
        this.storeHandlerKey = process.env.VUE_APP_SESSION_STORE_HANDLER_KEY ?
            process.env.VUE_APP_SESSION_STORE_HANDLER_KEY : '__session'

        this.sequenceAccess = 0
        this.nextSequenceAccess = 1

        this.data = {}
    }

    /**
     *
     * @param {StoreHandler} storeHandler
     */
    toStoreHandler(storeHandler) {
        this.storeHandler = storeHandler
        return this.syncTo()
    }

    /**
     *
     * @param {StoreHandler} storeHandler
     */
    fromStoreHandler(storeHandler) {
        this.storeHandler = storeHandler
        return this.syncFrom()
    }

    syncTo() {
        if (this.storeHandler) {
            this.storeHandler.setJson(this.storeHandlerKey, this.data)
        }
        return this
    }

    syncFrom() {
        if (this.storeHandler) {
            const data = this.storeHandler.getJson(this.storeHandlerKey)
            data && (this.data = data)
        }
        return this
    }

    start() {
        return this.sequenceStart()
    }

    restart() {
        return this.sequenceRestart()
    }

    sequenceStart() {
        this.nextSequenceAccess = ++this.sequenceAccess + 1
        return this
    }

    sequenceRestart() {
        this.sequenceAccess = 1
        this.nextSequenceAccess = 2
        return this
    }

    sequenceSkip() {
        this.nextSequenceAccess = this.sequenceAccess
        return this
    }

    sequenceAbortSkipping() {
        this.nextSequenceAccess = this.sequenceAccess + 1
        return this
    }

    sequenceSkipping() {
        return this.nextSequenceAccess <= this.sequenceAccess
    }

    isFreshSequence() {
        return this.sequenceAccess === 1
    }

    isNotFreshSequence() {
        return this.sequenceAccess > 1
    }

    flash(key, value) {
        return this.store(key, value, true)
    }

    store(key, value, flash = false) {
        this.data[key] = {
            value: value,
            flash: flash,
        }
        return this.syncTo()
    }

    retrieve(key, def = null) {
        if (!(key in this.data)) return def

        const data = this.data[key]
        data.flash && this.forget(key)
        return data.value
    }

    forget(key) {
        delete this.data[key]
        return this.syncTo()
    }
}
