import * as Router from 'koa-router';
import {crypto} from 'mz';
import {compareAdminPassword, setStudentKeys} from '../../database';
import GenerateKeysRequest from '../../common/request/admin/GenerateKeysRequest';
import {assertValidAdminPassword} from '../../common/util';

const router = new Router({prefix: '/api/generatekeys'});
export default router;

router.post('/', async (ctx, next) => {
    const request: GenerateKeysRequest = ctx.request.body;

    try {
        assertValidAdminPassword(request.adminPassword);
    } catch (e) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }

    if (!Number.isSafeInteger(request.firstGraders) || request.firstGraders < 0 || request.firstGraders >= 10000000
        || !Number.isSafeInteger(request.secondGraders) || request.secondGraders < 0 || request.secondGraders >= 10000000
        || !Number.isSafeInteger(request.thirdGraders) || request.thirdGraders < 0 || request.thirdGraders >= 10000000) {
        ctx.throw(400, '요청한 개수가 잘못되었습니다!');
        return;
    }

    if (!await compareAdminPassword(request.adminPassword)) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }

    const firstGradeKeys = new Set<number>();
    const secondGradeKeys = new Set<number>();
    const thirdGradeKeys = new Set<number>();
    for (let i = 0; i < request.firstGraders; i++) {
        firstGradeKeys.add(await generateNewRandomKey(firstGradeKeys, secondGradeKeys, thirdGradeKeys));
    }
    for (let i = 0; i < request.secondGraders; i++) {
        secondGradeKeys.add(await generateNewRandomKey(firstGradeKeys, secondGradeKeys, thirdGradeKeys));
    }
    for (let i = 0; i < request.thirdGraders; i++) {
        thirdGradeKeys.add(await generateNewRandomKey(firstGradeKeys, secondGradeKeys, thirdGradeKeys));
    }

    const keys = {
        firstGradeKeys: Array.from(firstGradeKeys.values()),
        secondGradeKeys: Array.from(secondGradeKeys.values()),
        thirdGradeKeys: Array.from(thirdGradeKeys.values())
    };

    await setStudentKeys(keys);

    ctx.status = 200;
    ctx.body = keys;
});

async function generateNewRandomKey(existingFirstGradeKeys: Set<number>, existingSecondGradeKeys: Set<number>, existingThirdGradeKeys: Set<number>): Promise<number> {
    const buf = await crypto.randomBytes(3);
    const randomInteger = parseInt(buf.toString('hex'), 16);
    if (randomInteger > 9999999 || existingFirstGradeKeys.has(randomInteger) || existingSecondGradeKeys.has(randomInteger) || existingThirdGradeKeys.has(randomInteger)) {
        return await generateNewRandomKey(existingFirstGradeKeys, existingSecondGradeKeys, existingThirdGradeKeys);
    } else {
        return randomInteger;
    }
}
