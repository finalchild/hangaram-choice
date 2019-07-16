import * as Router from 'koa-router';
import {crypto} from 'mz';
import {compareAdminPassword, setStudentKeys} from '../../database';
import GenerateKeysRequest from '../../common/request/admin/GenerateKeysRequest';
import {assertValidAdminPassword} from '../../common/util';
import Keys from '../../common/Keys';

const router = new Router({prefix: '/api/admin/generatekeys'});
export default router;

router.post('/', async (ctx, next) => {
    const request: GenerateKeysRequest = ctx.request.body;

    try {
        assertValidAdminPassword(request.adminPassword);
    } catch (e) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }

    if (typeof request.studentInfoes !== 'object' || !Array.isArray(request.studentInfoes.firstGradeStudentInfoes) || !Array.isArray(request.studentInfoes.secondGradeStudentInfoes) || !Array.isArray(request.studentInfoes.thirdGradeStudentInfoes)) {
        ctx.throw(401, '학생 정보가 잘못되었습니다!');
    }

    if (!await compareAdminPassword(request.adminPassword)) {
        ctx.throw(401, '관리자 비밀번호가 잘못되었습니다!');
        return;
    }

    const firstGradeKeySet = new Set<number>();
    const firstGradeKeys = [];
    const secondGradeKeySet = new Set<number>();
    const secondGradeKeys = [];
    const thirdGradeKeySet = new Set<number>();
    const thirdGradeKeys = [];
    for (let i = 0; i < request.studentInfoes.firstGradeStudentInfoes.length; i++) {
        const newKey = await generateNewRandomKey(firstGradeKeySet, secondGradeKeySet, thirdGradeKeySet);
        firstGradeKeySet.add(newKey);
        firstGradeKeys.push(newKey);
    }
    for (let i = 0; i < request.studentInfoes.secondGradeStudentInfoes.length; i++) {
        const newKey = await generateNewRandomKey(firstGradeKeySet, secondGradeKeySet, thirdGradeKeySet);
        secondGradeKeySet.add(newKey);
        secondGradeKeys.push(newKey);
    }
    for (let i = 0; i < request.studentInfoes.thirdGradeStudentInfoes.length; i++) {
        const newKey = await generateNewRandomKey(firstGradeKeySet, secondGradeKeySet, thirdGradeKeySet);
        thirdGradeKeySet.add(newKey);
        thirdGradeKeys.push(newKey);
    }

    const keys: Keys = {
        firstGradeKeys: firstGradeKeys,
        secondGradeKeys: secondGradeKeys,
        thirdGradeKeys: thirdGradeKeys
    };

    await setStudentKeys(keys, request.studentInfoes);

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
