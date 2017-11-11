'use strict';
const express = require('express');
const router = express.Router();

const assertValidAdminPassword = require('../../database.js').assertValidAdminPassword;
const compareAdminPassword = require('../../database.js').compareAdminPassword;
const setAdminPassword = require('../../database.js').setAdminPassword;

router.post('/', (req, res) => {
    const adminPassword = req.body.adminPassword;
    const newAdminPassword = req.body.newAdminPassword;
    try {
        assertValidAdminPassword(adminPassword);
        assertValidAdminPassword(newAdminPassword);
    } catch (e) {
        res.status(401).send({
            message: e
        });
    }

    compareAdminPassword(adminPassword).then(compareResult => {
        if (!compareResult) {
            throw '관리자 비밀번호가 잘못되었습니다!'
        }

        return setAdminPassword(newAdminPassword);
    }).then(e => {
        res.status(200).send({
            message: '비밀번호가 변경되었습니다.'
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
