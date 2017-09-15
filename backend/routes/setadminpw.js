'use strict';
const express = require('express');
const router = express.Router();

const assertValidAdminPassword = require('../database.js').assertValidAdminPassword;
const compareAdminPassword = require('../database.js').compareAdminPassword;
const setAdminPassword = require('../database.js').setAdminPassword;

router.post('/', (req, res) => {
    const adminPassword = req.body.adminPassword;
    const newAdminPassword = req.body.newAdminPassword;
    try {
        assertValidAdminPassword(adminPassword);
        assertValidAdminPassword(newAdminPassword);
    } catch (e) {
        res.status(401).send(e);
    }

    compareAdminPassword(adminPassword).then(compareResult => {
        if (!compareResult) {
            throw 'The administrator password is not correct!'
        }

        return setAdminPassword(newAdminPassword);
    }).then(e => {
        res.status(200).send('Success!');
    }).catch(e => {
        if (e === 'The administrator password is not correct!') {
            res.status(401).send(e);
            return;
        }
        console.error(e.stack);
        res.status(500).send(e);
    });
});

module.exports = router;
