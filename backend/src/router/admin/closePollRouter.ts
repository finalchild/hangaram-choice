import * as Router from 'koa-router';
import {fs} from 'mz';
import {compareAdminPassword, getState, getStatus, setState} from '../../database';
import ClosePollRequest from '../../common/request/admin/ClosePollRequest';
import {assertValidAdminPassword} from '../../common/util';

const router = new Router({prefix: '/closepoll'});
export default router;

router.post('/', async (ctx, next) => {
    const request = <ClosePollRequest>ctx.request.body;

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
    if (await getState() !== 'open') {
        ctx.throw(400, '투표가 열려 있지 않습니다!');
        return;
    }

    await setState('closed');

    const status = await getStatus();
    await fs.writeFile('oldPolls/' + '[' + new Date().toDateString() + '] ' + status.pollName + '.json', JSON.stringify(status));

    ctx.status = 200;
    ctx.body = {
        message: '성공.'
    };
});
