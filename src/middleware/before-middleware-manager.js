import {MiddlewareManager} from './middleware-manager'

export class BeforeMiddlewareManager extends MiddlewareManager {
    constructor(middlewareGroups, router) {
        super(middlewareGroups, router)
        this.before = true
    }

    run(to, from, next) {
        this.to = to
        this.from = from
        this.next = next
        this.index = -1

        return this.handle()
    }

    handle() {
        if (0 === this.middlewareGroups.length || ++this.index === this.middlewareGroups.length) {
            this.next()
        } else {
            this.middlewareGroups[this.index].setManager(this).handle(this)
        }
        return super.handle()
    }
}
