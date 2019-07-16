import * as Router from 'koa-router';
import {compareAdminPassword, getState, setState} from '../../database';
import OpenPollRequest from '../../common/request/admin/OpenPollRequest';
import {assertValidAdminPassword} from '../../common/util';

const router = new Router({prefix: '/api/admin/openpoll'});
export default router;

router.post('/', async (ctx, next) => {
    const request: OpenPollRequest = ctx.request.body;

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
    if (await getState() !== 'closed') {
        ctx.throw(400, '투표가 이미 열려 있습니다!');
        return;
    }

    await setState('open');

    ctx.status = 200;
    ctx.body = {
        message: '성공.'
    };
});
