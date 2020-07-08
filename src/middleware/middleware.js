export class Middleware {
    setManager(middlewareManager) {
        this.middlewareManager = middlewareManager
        return this
    }

    app() {
        return this.middlewareManager.getApp()
    }

    router() {
        return this.middlewareManager.getRouter()
    }

    to() {
        return this.middlewareManager.to
    }

    runBefore() {
        return this.middlewareManager.before
    }

    runAfter() {
        return this.middlewareManager.after
    }

    next() {
        this.middlewareManager.handle()
    }

    handle() {
        this.next()
    }

    redirect(location) {
        if ('query' in location) {
            location.query.time = new Date().getTime()
        } else {
            location.query = {
                time: new Date().getTime(),
            }
        }
        this.middlewareManager.next(location)
    }
}
