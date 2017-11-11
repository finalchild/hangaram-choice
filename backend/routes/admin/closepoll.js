'use strict';
const express = require('express');
const router = express.Router();
const fs = require('mz/fs');
const database = require('../../database.js');

router.post('/', (req, res) => {
    const adminPassword = req.body.adminPassword;
    try {
        database.assertValidAdminPassword(adminPassword);
    } catch (e) {
        res.status(401).send(e);
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
            if (status !== 'open') {
                throw '투표가 열려 있지 않습니다!'
            }
        })
        .then(() => {
            return database.setStatus('closed');
        })
        .then(database.getResult)
        .then(result => {
            return fs.writeFile(result.pollName + ' result at ' + new Date().toDateString() + '.json', JSON.stringify(result));
        })
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
            if (e === '투표가 열려 있지 않습니다!') {
                res.status(400).send({
                    message: e
                });
                return;
            }
            console.error(e.stack);
            res.status(500).send(e);
        });
});

module.exports = router;
