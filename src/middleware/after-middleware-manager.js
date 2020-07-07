import MiddlewareManager from './middleware-manager'

export default class AfterMiddlewareManager extends MiddlewareManager {
    constructor(middlewareGroups, router) {
        super(middlewareGroups, router)
        this.after = true
    }

    run(to, from) {
        this.to = to
        this.from = from
        this.index = -1

        return this.handle()
    }

    handle() {
        if (0 === this.middlewareGroups.length || ++this.index === this.middlewareGroups.length) {
            return
        }
        this.middlewareGroups[this.index].handle(this)

        return super.handle()
    }
}
