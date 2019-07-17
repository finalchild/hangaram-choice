import * as Router from 'koa-router';
import {fs} from 'mz';
import {compareAdminPassword} from '../../database';
import {assertValidAdminPassword, isValidPollNameExtended} from '../../common/util';
import GetOldPollRequest from '../../common/request/admin/GetOldPollRequest';

const router = new Router({prefix: '/getoldpoll'});
export default router;

router.post('/', async (ctx, next) => {
    const request = <GetOldPollRequest>ctx.request.body;

    try {
        assertValidAdminPassword(request.adminPassword);
    } catch (e) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }
    if (!isValidPollNameExtended(request.oldPollName)) {
        ctx.throw(400, '투표 이름이 잘못되었습니다!');
    }

    if (!await compareAdminPassword(request.adminPassword)) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }

    const path = 'oldPolls/' + request.oldPollName + '.json';

    if (!await fs.exists(path)) {
        ctx.throw(400, '해당 투표가 없습니다!');
        return;
    }
    ctx.status = 200;
    ctx.body = JSON.parse(await fs.readFile('oldPolls/' + request.oldPollName + '.json', 'utf8'));
});
