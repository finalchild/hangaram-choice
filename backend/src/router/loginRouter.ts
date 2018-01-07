import * as Router from 'koa-router';
import {getCache} from '../candidateNamesCache';
import LoginRequest from '../common/request/LoginRequest';
import {assertValidKey} from '../common/util';
import {getState, getStudent} from '../database';

const router = new Router({prefix: '/api/login'});
export default router;

router.post('/', async (ctx, next) => {
    const request: LoginRequest = ctx.request.body;

    if (request.candidatesCacheId && typeof request.candidatesCacheId !== 'string') {
        ctx.throw(400, 'Cache id가 string이 아닙니다!');
        return;
    }

    try {
        assertValidKey(request.key);
    } catch (e) {
        ctx.throw(400, e);
        return;
    }

    const state = await getState();
    if (state !== 'open') {
        ctx.throw(400, '투표가 열려 있지 않습니다!');
        return;
    }

    const student = await getStudent(request.key);
    if (!student) {
        ctx.throw(401, '키가 잘못되었습니다!');
        return;
    }
    if (student.voted === 1) {
        ctx.throw(400, '이미 투표했습니다!');
        return;
    }

    const cache = getCache();
    if (cache.candidatesCacheId === request.candidatesCacheId) {
        ctx.status = 200;
        ctx.body = {
            grade: student.grade
        };
    } else {
        ctx.status = 200;
        ctx.body = {
            grade: student.grade,
            cache: cache
        };
    }
});
