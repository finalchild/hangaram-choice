'use strict';
const express = require('express');
const router = express.Router();

const Promise = require('bluebird');

const assertValidKey = require('../database.js').assertValidKey;
const getStudent = require('../database.js').getStudent;
const getCandidate1M = require('../database.js').getCandidate1M;
const getCandidate1F = require('../database.js').getCandidate1F;
const getCandidate2 = require('../database.js').getCandidate2;
const vote = require('../database.js').vote;

router.post('/', (req, res) => {
    const key = req.body.key;
    const candidateName1M = req.body.candidateName1M;
    const candidateName1F = req.body.candidateName1F;
    const candidateName2 = req.body.candidateName2;

    try {
        assertValidKey(key);
    } catch (e) {
        res.status(400).send(e);
        return;
    }

    if ((candidateName1M && typeof candidateName1M !== 'string') || (candidateName1F && typeof candidateName1F !== 'string') || (candidateName2 && typeof candidateName2 !== 'string')) {
        res.status(400).send('Candidate names have to be strings!');
        return;
    }

    getStudent(key).then(student => {
        if (!student) {
            throw '키가 잘못되었습니다!!';
        }
        if (student.voted === 1) {
            throw '이미 투표했습니다!';
        }
        if (student.grade === 2 && (candidateName1M || candidateName1F)) {
            throw '2nd graders can\'t vote for 1st grade candidates!';
        }

        return Promise.all([getCandidate1M(candidateName1M), getCandidate1F(candidateName1F), getCandidate2(candidateName2)]);
    }).then(results => {
        if (!results[0] || !results[1] || !results[2]) {
            throw 'Invalid candidate name!';
        }

        return vote(key, candidateName1M, candidateName1F, candidateName2);
    }).then(() => {
        res.status(200).send({
            message: '투표를 완료했습니다'
        });
    }).catch(e => {
        if (e === '키가 잘못되었습니다!' || e === '이미 투표했습니다!') {
            res.status(401).send({
                message: e
            });
            return;
        }
        if (e === 'Invalid candidate name!') {
            res.status(400).send(e);
            return;
        }
        console.error(e.stack);
        res.status(500).send(e);
    });
});

module.exports = router;
