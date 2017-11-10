'use strict';
const express = require('express');
const router = express.Router();
const database = require('../database.js');

router.post('/', (req, res) => {
    const adminPassword = req.body.adminPassword;
    try {
        database.assertValidAdminPassword(adminPassword);
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

    const pollName = req.body.poll.pollName;
    const candidateNames1M = req.body.poll.candidateNames1M;
    const candidateNames1F = req.body.poll.candidateNames1F;
    const candidateNames2 = req.body.poll.candidateNames2;

    if (!isValidPollName(pollName)) {
        res.status(400).send({
            message: '투표 이름은 40자 이내의 문자열이여야 합니다!'
        });
        return;
    }
    if (!isValidCandidateNames(candidates1M) || isValidCandidateNames(candidates1F) || isValidCandidateNames(candidates2)) {
        res.status(400).send({
            message: '후보자 이름이 잘못되었습니다!'
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
        .then(() => database.setPollName(pollName))
        .then(() =>
            database.setCandidateNames({
                    candidateNames1M: candidateNames1M,
                    candidateNames1F: candidateNames1F,
                    candidateNames2: candidateNames2
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

function isValidPollName(name) {
    return typeof name === 'string' && name.length <= 40;
}

function isValidCandidateNames(candidateNames) {
    if (!Array.isArray(candidateNames)) {
        return false;
    }
    candidateNames.forEach(candidateName => {
        if (!candidateName || typeof candidateName !== 'string' || candidateName.length <= 10) {
            return false
        }
    });
    return true;
}

module.exports = router;
