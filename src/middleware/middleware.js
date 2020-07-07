export default class Middleware {
    handle($middlewareManager) {
        $middlewareManager.handle()
    }

    redirect($middlewareManager, path = '/', query = {}, hash = '') {
        query.time = new Date().getTime()
        $middlewareManager.next({
            path: path,
            query: query,
            hash: hash,
        })
    }
}
