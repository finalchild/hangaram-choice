import * as Router from 'koa-router';
import {getCache} from '../candidateNamesCache';
import LoginRequest, {isValidLoginRequest} from '../common/request/LoginRequest';
import {getState, getStudent} from '../database';

const router = new Router({prefix: '/login'});
export default router;

router.post('/', async (ctx, next) => {
    const req = ctx.request.body;
    if (!isValidLoginRequest(req)) {
        ctx.throw(400, '요청이 잘못되었습니다!');
        return;
    }
    const request = req as LoginRequest;

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
    if (student.studentNumber !== request.studentNumber) {
        ctx.throw(401, '학번이 잘못되었습니다!');
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
