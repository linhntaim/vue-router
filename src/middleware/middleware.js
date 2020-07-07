export class Middleware {
    setManager(middlewareManager) {
        this.middlewareManager = middlewareManager
    }

    app() {
        return this.middlewareManager.getApp()
    }

    router() {
        return this.middlewareManager.getRouter()
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

    redirect(path = '/', query = {}, hash = '') {
        query.time = new Date().getTime()
        this.middlewareManager.next({
            path: path,
            query: query,
            hash: hash,
        })
    }
}
