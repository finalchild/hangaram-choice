'use strict';
const express = require('express');
const router = express.Router();

const Promise = require('bluebird');

const assertValidKey = require('../database.js').assertValidKey;
const getStudent = require('../database.js').getStudent;
const getCandidateNames = require('../candidate_names.js').getCandidateNames;

router.post('/', (req, res) => {
    const key = req.body.key;

    const candidatesCacheId = req.body.candidatesCacheId;

    if (candidatesCacheId && typeof candidatesCacheId !== 'string') {
        res.status(400).send('Cache id is not a String!');
        return;
    }

    try {
        assertValidKey(key);
    } catch (e) {
        res.status(400).send(e);
        return;
    }

    getStudent(key).then(student => {
        if (!student) {
            throw '키가 잘못되었습니다!';
        }
        if (student.voted === 1) {
            throw '이미 투표했습니다!';
        }

        const candidateNames = getCandidateNames();
        if (candidateNames.candidatesCacheId === candidatesCacheId) {
            res.status(200).send({
                grade: student.grade
            });
        } else {
            res.status(200).send({
                grade: student.grade,
                candidateNames: getCandidateNames()
            });
        }
    }).catch(e => {
        if (e === '키가 잘못되었습니다!' || e === '이미 투표했습니다!') {
            res.status(401).send({
                message: e
            });
            return;
        }
        console.error(e.stack);
        res.status(500).send(e);
    });
});

module.exports = router;
