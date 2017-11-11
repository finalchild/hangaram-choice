'use strict';
const express = require('express');
const router = express.Router();

const Promise = require('bluebird');
const crypto = require('mz/crypto');

const assertValidAdminPassword = require('../../database.js').assertValidAdminPassword;
const compareAdminPassword = require('../../database.js').compareAdminPassword;
const setStudentKeys = require('../../database.js').setStudentKeys;

router.post('/', (req, res) => {
    const adminPassword = req.body.adminPassword;
    try {
        assertValidAdminPassword(adminPassword);
    } catch (e) {
        res.status(401).send(e);
        return;
    }

    const firstGraders = req.body.firstGraders;
    const secondGraders = req.body.secondGraders;
    const thirdGraders = req.body.thirdGraders;
    if (!Number.isSafeInteger(firstGraders) || firstGraders < 0 || firstGraders >= 10000000 || !Number.isSafeInteger(secondGraders) || secondGraders < 0 || secondGraders >= 10000000 || !Number.isSafeInteger(thirdGraders) || thirdGraders < 0 || thirdGraders >= 10000000) {
        res.status(400).send('Invalid request!')
    }

    compareAdminPassword(adminPassword).then(compareResult => {
        if (!compareResult) {
            throw '관리자 비밀번호가 잘못되었습니다!';
        }

        const firstGradeKeys = new Set();
        const secondGradeKeys = new Set();
        const thirdGradeKeys = new Set();
        let promise = Promise.resolve();
        for (let i = 0; i < firstGraders; i++) {
            promise = promise.then(() => {
                return generateNewRandomKey(firstGradeKeys, secondGradeKeys, thirdGradeKeys);
            }).then((result) => {
                firstGradeKeys.add(result);
            });
        }
        for (let i = 0; i < secondGraders; i++) {
            promise = promise.then(() => {
                return generateNewRandomKey(firstGradeKeys, secondGradeKeys, thirdGradeKeys);
            }).then((result) => {
                secondGradeKeys.add(result);
            });
        }
        for (let i = 0; i < thirdGraders; i++) {
            promise = promise.then(() => {
                return generateNewRandomKey(firstGradeKeys, secondGradeKeys, thirdGradeKeys);
            }).then((result) => {
                thirdGradeKeys.add(result);
            });
        }
        return promise.then(() => {
            return {
                firstGradeKeys: firstGradeKeys,
                secondGradeKeys: secondGradeKeys,
                thirdGradeKeys: thirdGradeKeys
            };
        });
    }).then(setStudentKeys).then(keys => {
        res.status(200).send({
            firstGradeKeys: Array.from(keys.firstGradeKeys.values()),
            secondGradeKeys: Array.from(keys.secondGradeKeys.values()),
            thirdGradeKeys: Array.from(keys.thirdGradeKeys.values())
        });
    }).catch(e => {
        if (e === '관리자 비밀번호가 잘못되었습니다!') {
            res.status(401).send({
                message: e
            });
            return;
        }
        console.error(e.stack);
        res.status(500).send(e);
    });
});

function generateNewRandomKey(existingFirstGradeKeys, existingSecondGradeKeys, existingThirdGradeKeys) {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(3).then(buf => {
            const randomInteger = parseInt(buf.toString('hex'), 16);
            if (randomInteger > 9999999 || existingFirstGradeKeys.has(randomInteger) || existingSecondGradeKeys.has(randomInteger) || existingThirdGradeKeys.has(randomInteger)) {
                resolve(generateNewRandomKey(existingFirstGradeKeys, existingSecondGradeKeys, existingThirdGradeKeys));
            } else {
                resolve(randomInteger);
            }
        });
    });
}

module.exports = router;
