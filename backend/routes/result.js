'use strict';
const express = require('express');
const assertValidAdminPassword = require('../status').assertValidAdminPassword;
const compareAdminPassword = require('../status').compareAdminPassword;
const getCandidates1M = require('../database').getCandidates1M;
const getCandidates1F = require('../database').getCandidates1F;
const getCandidates2 = require('../database').getCandidates2;

const router = express.Router();

router.post('/', (req, res) => {
    const adminPassword = req.body.adminPassword;
    try {
        assertValidAdminPassword(adminPassword);
    } catch (e) {
        res.status(401).send(e);
        return;
    }

    compareAdminPassword(adminPassword).then(compareResult => {
        if (!compareResult) {
            res.status(401).send('The administrator password is not correct!');
            return;
        }

        Promise.all([getCandidates1M(), getCandidates1F(), getCandidates2()])
            .then(results => {
                res.status(200).send({
                    firstGradeM: results[0],
                    firstGradeF: results[1],
                    secondGrade: results[2]
                });
            });
    }).catch(e => {
        res.status(500).send(e);
    });
});

module.exports = router;
