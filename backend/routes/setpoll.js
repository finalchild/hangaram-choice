'use strict';
const express = require('express');
const router = express.Router();
const database = require('database');
const assertValidAdminPassword = require('../database.js').assertValidAdminPassword;

router.post('/', (req, res) => {
    const adminPassword = req.body.adminPassword;
    try {
        assertValidAdminPassword(adminPassword);
    } catch (e) {
        res.status(401).send(e);
        return;
    }

    if (!req.body.poll) {
        res.status(400).send({
            message: '투표 정보가 잘못되었습니다!'
        });
        return;
    }

    const name = req.body.poll.name;
    const candidates1M = req.body.poll.candidates1M;
    const candidates1F = req.body.poll.candidates1F;
    const candidates2 = req.body.poll.candidates2;

    if (!isValidName(name)) {
        res.status(400).send({
            message: '투표 이름은 40자 이내의 문자열이여야 합니다!'
        });
        return;
    }
    if (!isValidCandidates(candidates1M) || isValidCandidates(candidates1F) || isValidCandidates(candidates2)) {
        res.status(400).send({
            message: '후보자 정보가 잘못되었습니다!'
        });
        return;
    }

    database.compareAdminPassword(adminPassword)
        .then(compareResult => {
            if (!compareResult) {
                throw '관리자 비밀번호가 잘못되었습니다!';
            }
        })
        .then(database.getStatus)
        .then(status => {
            if (status !== 'closed') {
                throw '투표가 닫혀 있어야 합니다!'
            }
        })
        .then(() => database.setPollName(name))
        .then(() =>
            database.setCandidates({
                    candidates1M: candidates1M,
                    candidates1F: candidates1F,
                    candidates2: candidates2
                }))
        .then(() => {
            res.status(200).send({
                message: '성공!'
            });
        })
        .catch(e => {
            if (e === '관리자 비밀번호가 잘못되었습니다!') {
                res.status(401).send({
                    message: e
                });
                return;
            }
            if (e === '투표가 닫혀 있어야 합니다!') {
                res.status(400).send({
                    message: e
                });
                return;
            }
            console.error(e.stack);
            res.status(500).send(e);
        });
});

function isValidName(name) {
    return typeof name === 'string' && name.length <= 40;
}

function isValidCandidates(candidates) {
    return typeof candidates === 'object'; // TODO
}

module.exports = router;
