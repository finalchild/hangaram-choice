'use strict';
const express = require('express');
const router = express.Router();

const assertValidAdminPassword = require('../status').assertValidAdminPassword;
const compareAdminPassword = require('../status').compareAdminPassword;
const setAdminPassword = require('../status').setAdminPassword;

router.post('/', (req, res) => {
    const adminPassword = req.body.adminPassword;
    const newAdminPassword = req.body.newAdminPassword;
    try {
        assertValidAdminPassword(adminPassword);
        assertValidAdminPassword(newAdminPassword);
    } catch (e) {
        res.status(401).send(e);
    }

    return compareAdminPassword(adminPassword).then(compareResult => {
        if (!compareResult) {
            res.status(401).send('The administrator password is not correct!');
            return;
        }

        return setAdminPassword(newAdminPassword);
    });
});

module.exports = router;
