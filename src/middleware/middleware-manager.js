export default class MiddlewareManager {
    constructor(middlewareGroups, router) {
        this.middlewareGroups = middlewareGroups
        this.router = router
        this.index = -1
    }

    run() {
        return this
    }

    handle() {
        return this
    }

    skip() {
        this.index = this.middlewareGroups.length
        return this
    }
}
