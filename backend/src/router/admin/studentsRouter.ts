import StudentsRequest from '../../common/request/admin/StudentsRequest';
import Router = require('koa-router');
import {assertValidAdminPassword} from '../../common/util';
import {compareAdminPassword, getStudents} from '../../database';

const router = new Router({prefix: '/students'});
export default router;

router.post('/', async (ctx, next) => {
    const request = <StudentsRequest>ctx.request.body;

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
    ctx.body = await getStudents();
});
