import * as Router from 'koa-router';
import VoteRequest, {isValidVoteRequest} from '../common/request/VoteRequest';
import {getCandidate1F, getCandidate1M, getCandidate2, getState, getStudent, vote} from '../database';

const router = new Router({prefix: '/vote'});
export default router;

router.post('/', async (ctx, next) => {
    const req = ctx.request.body;
    if (!isValidVoteRequest(req)) {
        ctx.throw(400, '요청이 잘못되었습니다!');
        return;
    }
    const request = req as VoteRequest;

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
        ctx.throw(401, '이미 투표했습니다!');
        return;
    }
    if (student.grade === 1) {
        if (request.candidateName1M === null || !request.candidateName1F === null) {
            ctx.throw(400, '1학년 후보자 이름을 입력해 주세요!')
            return;
        }
    } else if (request.candidateName1M !== null || request.candidateName1F !== null) {
        ctx.throw(401, '2학년과 3학년은 1학년 후보자에게 투표할 수 없습니다!');
        return;
    }

    const promiseCandidate1M = getCandidate1M(request.candidateName1M);
    const promiseCandidate1F = getCandidate1F(request.candidateName1F);
    const promiseCandidate2 = getCandidate2(request.candidateName2);
    if (!await promiseCandidate1M || !await promiseCandidate1F || !await promiseCandidate2) {
        ctx.throw(400, '후보자 이름이 잘못되었습니다!');
        return;
    }

    await vote(request.key, student.grade, request.candidateName1M, request.candidateName1F, request.candidateName2);
    ctx.status = 200;
    ctx.body = {
        message: '투표 완료!'
    };
});
