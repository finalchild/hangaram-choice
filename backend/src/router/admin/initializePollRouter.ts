import * as Router from 'koa-router';
import {compareAdminPassword, getState, setCandidateNames, setPollName} from '../../database';
import {isValidCandidateNames} from '../../common/CandidateNames';
import InitializePollRequest from '../../common/request/admin/InitializePollRequest';
import {assertValidAdminPassword, isValidPollName} from '../../common/util';

const router = new Router({prefix: '/api/admin/initializepoll'});
export default router;

router.post('/', async (ctx, next) => {
    const request: InitializePollRequest = ctx.request.body;
    try {
        assertValidAdminPassword(request.adminPassword);
    } catch (e) {
        ctx.throw(401, e);
        return;
    }
    if (!isValidPollName(request.pollName)) {
        ctx.throw(400, '투표 이름이 잘못되었습니다!');
        return;
    }
    if (!isValidCandidateNames(request.candidateNames)) {
        ctx.throw(400, '후보자 정보가 잘못되었습니다!');
        return;
    }

    if (!await compareAdminPassword(request.adminPassword)) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }
    if (await getState() !== 'closed') {
        ctx.throw(400, '투표가 닫혀 있어야 합니다!');
        return;
    }
    await setPollName(request.pollName);
    await setCandidateNames(request.candidateNames);
    ctx.status = 200;
    ctx.body = '성공!';
});
