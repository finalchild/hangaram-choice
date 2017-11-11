'use strict';
const express = require('express');
const router = express.Router();

const Promise = require('bluebird');

const database = require('../../database.js');

router.post('/', (req, res) => {
    const adminPassword = req.body.adminPassword;
    try {
        database.assertValidAdminPassword(adminPassword);
    } catch (e) {
        res.status(401).send({
            message: e
        });
        return;
    }

    database.compareAdminPassword(adminPassword)
        .then(compareResult => {
            if (!compareResult) {
                throw '관리자 비밀번호가 잘못되었습니다!';
            }
        })
        .then(database.getResult)
        .then(result => {
            res.status(200).send(result);
        })
        .catch(e => {
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
