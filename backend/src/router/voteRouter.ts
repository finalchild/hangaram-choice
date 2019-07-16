import * as Router from 'koa-router';
import VoteRequest from '../common/request/VoteRequest';
import {assertValidKey, assertValidStudentNumber} from '../common/util';
import {getCandidate1F, getCandidate1M, getCandidate2, getState, getStudent, vote} from '../database';

const router = new Router({prefix: '/api/vote'});
export default router;

router.post('/', async (ctx, next) => {
    const request: VoteRequest = ctx.request.body;
    try {
        assertValidKey(request.key);
        assertValidStudentNumber(request.studentNumber);
    } catch (e) {
        ctx.status = 400;
        ctx.body = {error: e};
        return;
    }
    if ((request.candidateName1M && typeof request.candidateName1M !== 'string') || (request.candidateName1F && typeof request.candidateName1F !== 'string') || (request.candidateName2 && typeof request.candidateName2 !== 'string')) {
        ctx.status = 400;
        ctx.body = {error: '후보자 이름이 string이 아닙니다!'};
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
        ctx.status = 401;
        ctx.body = {error: '이미 투표했습니다!'};
        return;
    }
    if (!request.candidateName2) {
        ctx.status = 401;
        ctx.body = {error: '2학년 후보자 이름을 입력해 주세요!'};
        return;
    }
    if (student.grade === 1) {
        if (!request.candidateName1M || !request.candidateName1F) {
            ctx.status = 401;
            ctx.body = {error: '1학년 후보자 이름을 입력해 주세요!'};
            return;
        }
    } else if (request.candidateName1M || request.candidateName1F) {
        ctx.status = 500;
        ctx.body = {error: '2학년과 3학년은 1학년 후보자에게 투표할 수 없습니다!'};
        return;
    }

    const promiseCandidate1M = getCandidate1M(request.candidateName1M);
    const promiseCandidate1F = getCandidate1F(request.candidateName1F);
    const promiseCandidate2 = getCandidate2(request.candidateName2);
    if (!await promiseCandidate1M || !await promiseCandidate1F || !await promiseCandidate2) {
        ctx.status = 401;
        ctx.body = {error: '후보자 이름이 잘못되었습니다!'};
        return;
    }

    await vote(request.key, request.candidateName1M, request.candidateName1F, request.candidateName2);
    ctx.status = 200;
    ctx.body = {
        message: '투표 완료!'
    };
});
