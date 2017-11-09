'use strict';
const express = require('express');
const router = express.Router();

const Promise = require('bluebird');
const database = require('../database.js');
const getCandidateNames = require('../candidate_names.js').getCandidateNames;

router.post('/', (req, res) => {
    const key = req.body.key;

    const candidatesCacheId = req.body.candidatesCacheId;

    if (candidatesCacheId && typeof candidatesCacheId !== 'string') {
        res.status(400).send('Cache id is not a String!');
        return;
    }

    try {
        database.assertValidKey(key);
    } catch (e) {
        res.status(400).send(e);
        return;
    }

    database.getStatus()
        .then(status => {
            if (status !== 'open') {
                throw '투표가 열려 있지 않습니다!';
            }
        })
        .then(() => database.getStudent(key))
        .then(student => {
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
                    candidateNames: database.getCandidateNames()
                });
            }
        })
        .catch(e => {
            if (e === '투표가 열려 있지 않습니다!' || e === '키가 잘못되었습니다!' || e === '이미 투표했습니다!') {
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
