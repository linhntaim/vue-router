export class MiddlewareManager {
    constructor(middlewareGroups, router) {
        this.middlewareGroups = middlewareGroups
        this.router = router
        this.index = -1
    }

    getApp() {
        return this.router.app
    }

    getRouter() {
        return this.router
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
