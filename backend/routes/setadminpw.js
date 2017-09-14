'use strict';
const express = require('express');
const router = express.Router();

const assertValidAdminPassword = require('../status.js').assertValidAdminPassword;
const compareAdminPassword = require('../status.js').compareAdminPassword;
const setAdminPassword = require('../status.js').setAdminPassword;

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
            res.status(401).send('The administrator password is not correct!');
            return;
        }

        return setAdminPassword(newAdminPassword);
    }).then(e => {
        res.status(200).send('Success!');
    }).catch(e => {
        console.error(e.stack);
        res.status(500).send(e);
    });
});

module.exports = router;
