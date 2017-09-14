'use strict';
const express = require('express');
const router = express.Router();

const crypto = require('mz/crypto');

router.post('/', (req, res) => {
    const adminPassword = req.body.adminPassword;
    const firstGraders = req.body.firstGraders;
    const secondGraders = req.body.secondGraders;
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

        const keySet = new Set();
        for (let i = 0; i < firstGraders; i++) {
            // TODO
            getRandomKey()
        }
    }).catch(e => {
        res.status(500).send(e);
    });
});

function getRandomKey() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(24).then(result => {
            if (result > 9999999) {
                resolve(getRandomKey());
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = router;
