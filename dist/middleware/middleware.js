export default class Middleware{setManager(middlewareManager){this.middlewareManager=middlewareManager}app(){return this.middlewareManager.getApp()}router(){return this.middlewareManager.getRouter()}next(){this.middlewareManager.handle()}handle(){this.next()}redirect(path="/",query={},hash=""){query.time=new Date().getTime();this.middlewareManager.next({path:path,query:query,hash:hash})}}
//# sourceMappingURL=middleware.js.map