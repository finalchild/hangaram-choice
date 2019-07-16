import * as Router from 'koa-router';
import {getCache} from '../candidateNamesCache';
import LoginRequest from '../common/request/LoginRequest';
import {assertValidKey, assertValidStudentNumber} from '../common/util';
import {getState, getStudent} from '../database';

const router = new Router({prefix: '/api/login'});
export default router;

router.post('/', async (ctx, next) => {
    const request: LoginRequest = ctx.request.body;

    if (request.candidatesCacheId && typeof request.candidatesCacheId !== 'string') {
        ctx.status = 400;
        ctx.body = {error: 'Cache id가 string이 아닙니다!'};
        return;
    }

    try {
        assertValidKey(request.key);
        assertValidStudentNumber(request.studentNumber);
    } catch (e) {
        ctx.status = 400;
        ctx.body = {error: e};
        return;
    }

    const state = await getState();
    if (state !== 'open') {
        ctx.status = 400;
        ctx.body = {error: '투표가 열려 있지 않습니다!'};
        return;
    }

    const student = await getStudent(request.key);
    if (!student) {
        ctx.status = 401;
        ctx.body = {error: '키가 잘못되었습니다!'};
        return;
    }
    if (student.studentNumber !== request.studentNumber) {
        ctx.status = 401;
        ctx.body = {error: '학번이 잘못되었습니다!'};
        return;
    }
    if (student.voted === 1) {
        ctx.status = 400;
        ctx.body = {error: '이미 투표했습니다!'};
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
