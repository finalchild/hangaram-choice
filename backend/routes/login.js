'use strict';
const express = require('express');
const router = express.Router();

const Promise = require('bluebird');

const assertValidKey = require('../database.js').assertValidKey;
const getStudent = require('../database.js').getStudent;
const getCandidates1M = require('../database.js').getCandidates1M;
const getCandidates1F = require('../database.js').getCandidates1F;
const getCandidates2 = require('../database.js').getCandidates2;


router.post('/', (req, res) => {
    const key = req.body.key;
    console.log(key);

    //TODO 후보자를 캐시할 수 있다면 서버 부하를 줄일 수 있을 듯.
    const candidatesCacheId = req.body.candidatesCacheId;

    try {
        assertValidKey(key);
    } catch (e) {
        res.status(400).send(e);
        return;
    }

    getStudent(key).then(student => {
        if (!student) {
            res.status(400).send('No such key found!');
            return;
        }
        if (student.voted === 1) {
            res.status(400).send('You\'ve already voted!');
            return;
        }

        return Promise.all([getCandidates1M(), getCandidates1F(), getCandidates2()]);
    }).then(results => {
        res.status(200).send({
            candidates1M: results[0].map(candidate => candidate.name),
            candidates1F: results[1].map(candidate => candidate.name),
            candidates2: results[2].map(candidate => candidate.name)
        });
    }).catch(e => {
        console.error(e.stack);
        res.status(500).send(e);
    });
});

module.exports = router;
