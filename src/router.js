import {session} from './session'
import {AfterMiddlewareManager, BeforeMiddlewareManager, Middleware} from './middleware'
import VueRouter from 'vue-router'

export default class Router extends VueRouter {
    constructor(options = {}) {
        super(options)

        this.routePathByNames = {}

        this.beforeDefault = 'beforeDefault' in this.options ? this.options.beforeDefault : []
        this.beforeRouting = 'beforeRouting' in this.options ? this.options.beforeRouting : null
        this.beforeEnabled = 'beforeEnabled' in this.options ? this.options.beforeEnabled : () => true
        this.afterDefault = 'afterDefault' in this.options ? this.options.afterDefault : []
        this.afterRouting = 'afterRouting' in this.options ? this.options.afterRouting : null
        this.afterEnabled = 'afterEnabled' in this.options ? this.options.afterEnabled : () => true
        this.authRoutes = 'authRoutes' in this.options ? this.options.authRoutes : null
        this.notAuthRoutes = 'notAuthRoutes' in this.options ? this.options.notAuthRoutes : null

        'beforeDefault' in this.options && delete this.options.beforeDefault
        'beforeRouting' in this.options && delete this.options.beforeRouting
        'beforeEnabled' in this.options && delete this.options.beforeEnabled
        'afterDefault' in this.options && delete this.options.afterDefault
        'afterRouting' in this.options && delete this.options.afterRouting
        'afterEnabled' in this.options && delete this.options.afterEnabled
        'authRoutes' in this.options && delete this.options.authRoutes
        'notAuthRoutes' in this.options && delete this.options.notAuthRoutes

        this.parseRoutes()

        this.beforeEach((to, from, next) => {
            this.beforeRouting && this.beforeRouting(to, from)

            if (this.beforeEnabled(to, from) && !session.skipping()) {
                const middlewareGroups = this.beforeDefault.slice(0)
                to.matched.forEach(route => {
                    if ('middleware' in route.meta) {
                        const add = middleware => {
                            if (middleware instanceof Middleware) {
                                middlewareGroups.push(middleware)
                                return
                            }
                            if (Array.isArray(middleware)) {
                                middleware.forEach(subMiddleware => add(subMiddleware))
                                return
                            }
                            if ('before' in middleware) {
                                add(middleware.before)
                            }
                        }
                        add(route.meta.middleware)
                    }
                })

                if (middlewareGroups.length) {
                    (new BeforeMiddlewareManager(middlewareGroups, this)).run(to, from, next)
                    return
                }
            }

            next()
        })

        this.afterEach((to, from) => {
            if (this.afterEnabled(to, from) && !session.skipping()) {
                const middlewareGroups = []
                to.matched.forEach(route => {
                    if ('middleware' in route.meta) {
                        const add = middleware => {
                            if (middleware instanceof Middleware) {
                                middlewareGroups.push(middleware)
                                return
                            }
                            if (Array.isArray(middleware)) {
                                middleware.forEach(subMiddleware => add(subMiddleware))
                                return
                            }
                            if ('after' in middleware) {
                                add(middleware.after)
                            }
                        }
                        add(route.meta.middleware)
                    }
                })
                middlewareGroups.push(...this.afterDefault.slice(0))
                if (middlewareGroups.length) {
                    (new AfterMiddlewareManager(middlewareGroups, this)).run(to, from)
                }
            }

            session.skipping() && session.abortSkipping()
            this.afterRouting && this.afterRouting(to, from)
        })
    }

    parseRoute(route, parentPath = '') {
        const routePath = '/' + (parentPath + '/' + route.path).replace(/\/+/g, '/').replace(/^\/|\/$/g, '')
        if (route.name) {
            this.routePathByNames[route.name] = routePath
        }
        route.children && route.children.length && route.children.forEach(childRoute => {
            this.parseRoute(childRoute, routePath)
        })
    }

    parseRoutes() {
        this.routePathByNames = {}
        this.options.routes.forEach(route => {
            this.parseRoute(route)
        })
    }

    getPathByName(name) {
        return name in this.routePathByNames ? this.routePathByNames[name] : null
    }

    replaceRoutes(routes) {
        this.options.routes = routes
        this.matcher = (new Router(this.options)).matcher

        this.parseRoutes()

        return this
    }

    switchToAuth() {
        if (this.authRoutes) {
            this.replaceRoutes(this.authRoutes)
            return true
        }
        return false
    }

    switchToNotAuth() {
        if (this.notAuthRoutes) {
            this.replaceRoutes(this.notAuthRoutes)
            return true
        }
        return false
    }

    softReplace(location, onComplete = null, onAbort = null) {
        session.skip()
        return this.replace(location, onComplete, () => {
            onAbort && onAbort()
        })
    }

    softPush(location, onComplete = null, onAbort = null) {
        session.skip()
        return this.push(location, onComplete, () => {
            onAbort && onAbort()
        })
    }

    catchSoftReplace(location, onComplete = null, onAbort = null) {
        session.skip()
        return this.replace(location, onComplete, onAbort)
    }

    catchSoftPush(location, onComplete = null, onAbort = null) {
        session.skip()
        return this.push(location, onComplete, onAbort)
    }
}
