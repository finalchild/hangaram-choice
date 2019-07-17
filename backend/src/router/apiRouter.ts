import * as Router from 'koa-router';
import loginRouter from './loginRouter';
import voteRouter from './voteRouter';
import adminRouter from './admin/adminRouter';

const router = new Router({prefix: '/api'});
export default router;

router.use(loginRouter.routes());
router.use(loginRouter.allowedMethods());
router.use(voteRouter.routes());
router.use(voteRouter.allowedMethods());
router.use(adminRouter.routes());
router.use(adminRouter.allowedMethods());
