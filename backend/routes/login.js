'use strict';
const express = require('express');
const router = express.Router();

const Promise = require('bluebird');

const assertValidKey = require('../database.js').assertValidKey;
const getStudent = require('../database.js').getStudent;
const getCandidateNames = require('../candidate_names.js').getCandidateNames;

router.post('/', (req, res) => {
    const key = req.body.key;
    console.log(key);

    const candidatesCacheId = req.body.candidatesCacheId;

    if (typeof candidatesCacheId !== 'string') {
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
            throw 'No such key found!';
        }
        if (student.voted === 1) {
            throw 'You\'ve already voted!';
        }

        const candidateNames = getCandidateNames();
        if (candidateNames.id === candidatesCacheId) {
            res.status(200).send('Cache id is identical.');
        } else {
            res.status(200).send(getCandidateNames());
        }
    }).catch(e => {
        if (e === 'No such key found!' || e === 'You\'ve already voted!') {
            res.status(401).send(e);
            return;
        }
        console.error(e.stack);
        res.status(500).send(e);
    });
});

module.exports = router;
