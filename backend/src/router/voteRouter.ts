import * as Router from 'koa-router';
import VoteRequest from '../common/request/VoteRequest';
import {assertValidKey} from '../common/util';
import {getCandidate1F, getCandidate1M, getCandidate2, getState, getStudent, vote} from '../database';

const router = new Router({prefix: '/api/vote'});
export default router;

router.post('/', async (ctx, next) => {
    const request: VoteRequest = ctx.request.body;

    try {
        assertValidKey(request.key);
    } catch (e) {
        ctx.throw(400, e);
        return;
    }
    if ((request.candidateName1M && typeof request.candidateName1M !== 'string') || (request.candidateName1F && typeof request.candidateName1F !== 'string') || (request.candidateName2 && typeof request.candidateName2 !== 'string')) {
        ctx.throw(400, '후보자 이름이 string이 아닙니다!');
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
        ctx.throw(401, '이미 투표했습니다!');
        return;
    }
    if (!request.candidateName2) {
        ctx.throw(401, '2학년 후보자 이름을 입력해 주세요!');
        return;
    }
    if (student.grade === 1) {
        if (!request.candidateName1M || !request.candidateName1F) {
            ctx.throw(401, '1학년 후보자 이름을 입력해 주세요!');
            return;
        }
    } else if (request.candidateName1M || request.candidateName1F) {
        ctx.throw('2학년과 3학년은 1학년 후보자에게 투표할 수 없습니다!');
        return;
    }
    const results = await Promise.all([getCandidate1M(request.candidateName1M), getCandidate1F(request.candidateName1F), getCandidate2(request.candidateName2)]);
    if (!results[0] || !results[1] || !results[2]) {
        ctx.throw(401, '후보자 이름이 잘못되었습니다!');
        return;
    }

    await vote(request.key, request.candidateName1M, request.candidateName1F, request.candidateName2);
    ctx.status = 200;
    ctx.body = {
        message: '성공.'
    };
});
