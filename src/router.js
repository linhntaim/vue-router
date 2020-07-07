import {AfterMiddlewareManager, BeforeMiddlewareManager, Middleware} from './middleware'
import session from './session'
import VueRouter from 'vue-router'

export default class Router extends VueRouter {
    constructor(options = {}) {
        super(options)

        this.routePathByNames = {}

        this.beforeDefault = this.options.beforeDefault ? this.options.beforeDefault : []
        this.beforeRouting = this.options.beforeRouting ? this.options.beforeRouting : null
        this.beforeEnabled = this.options.beforeEnabled ? this.options.beforeEnabled : () => true
        this.afterDefault = this.options.afterDefault ? this.options.afterDefault : []
        this.afterRouting = this.options.afterRouting ? this.options.afterRouting : null
        this.afterEnabled = this.options.afterEnabled ? this.options.afterEnabled : () => true
        this.authRoutes = this.options.authRoutes ? this.options.authRoutes : null
        this.notAuthRoutes = this.options.notAuthRoutes ? this.options.notAuthRoutes : null

        delete this.options.beforeDefault
        delete this.options.beforeRouting
        delete this.options.beforeEnabled
        delete this.options.afterDefault
        delete this.options.afterRouting
        delete this.options.afterEnabled
        delete this.options.authRoutes
        delete this.options.notAuthRoutes

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
        this.replace(location, onComplete, () => {
            onAbort && onAbort()
        })
    }

    catchSoftReplace(location, onComplete = null, onAbort = null) {
        session.skip()
        return this.replace(location, onComplete, onAbort)
    }
}
