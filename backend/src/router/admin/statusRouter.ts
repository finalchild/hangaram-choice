import * as Router from 'koa-router';
import {compareAdminPassword, getStatus} from '../../database';
import StatusRequest from '../../common/request/admin/StatusRequest';
import {assertValidAdminPassword} from '../../common/util';

const router = new Router({prefix: '/api/admin/status'});
export default router;

router.post('/', async (ctx, next) => {
    const request: StatusRequest = ctx.request.body;

    try {
        assertValidAdminPassword(request.adminPassword);
    } catch (e) {
        ctx.throw(401, e);
        return;
    }
    if (!await compareAdminPassword(request.adminPassword)) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }

    ctx.status = 200;
    ctx.body = await getStatus();
});
