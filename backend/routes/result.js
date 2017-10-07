'use strict';
const express = require('express');
const router = express.Router();

const Promise = require('bluebird');

const assertValidAdminPassword = require('../database.js').assertValidAdminPassword;
const compareAdminPassword = require('../database.js').compareAdminPassword;
const getCandidates1M = require('../database.js').getCandidates1M;
const getCandidates1F = require('../database.js').getCandidates1F;
const getCandidates2 = require('../database.js').getCandidates2;


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
            throw '관리자 비밀번호가 잘못되었습니다!';
        }

        return Promise.all([getCandidates1M(), getCandidates1F(), getCandidates2()]);
    }).then(results => {
        res.status(200).send({
            candidates1M: results[0],
            candidates1F: results[1],
            candidates2: results[2]
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

module.exports = router;
