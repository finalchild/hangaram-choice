import * as Router from 'koa-router';
import {fs} from 'mz';
import {compareAdminPassword} from '../../database';
import {assertValidAdminPassword} from '../../common/util';
import ListOldPollsRequest from '../../common/request/admin/ListOldPollsRequest';

const router = new Router({prefix: '/listoldpolls'});
export default router;

router.post('/', async (ctx, next) => {
    const request = <ListOldPollsRequest>ctx.request.body;

    try {
        assertValidAdminPassword(request.adminPassword);
    } catch (e) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }

    if (!await compareAdminPassword(request.adminPassword)) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }

    ctx.status = 200;
    ctx.body = (await fs.readdir('oldPolls')).map(name => name.slice(0, name.length - 5));
});
