import * as Router from 'koa-router';
import {compareAdminPassword, setAdminPassword} from '../../database';
import SetAdminPwRequest from '../../common/request/admin/SetAdminPwRequest';
import {assertValidAdminPassword} from '../../common/util';

const router = new Router({prefix: '/api/admin/setadminpw'});
export default router;

router.post('/', async (ctx, next) => {
    const request: SetAdminPwRequest = ctx.request.body;

    try {
        assertValidAdminPassword(request.adminPassword);
    } catch (e) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }
    try {
        assertValidAdminPassword(request.newAdminPassword);
    } catch (e) {
        ctx.throw(400, '새 비밀번호가 잘못되었습니다!');
        return;
    }

    if (!await compareAdminPassword(request.adminPassword)) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }

    await setAdminPassword(request.newAdminPassword);
    ctx.status = 200;
    ctx.body = '성공.';
});
