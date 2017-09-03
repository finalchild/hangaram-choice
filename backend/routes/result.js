'use strict';
const express = require('express');
const compareAdminPassword = require('../status').compareAdminPassword;
const getCandidates1 = require('../database').getCandidates1;
const getCandidates2 = require('../database').getCandidates2;

const router = express.Router();

router.post('/', function(req, res) {
    const adminPassword = req.body.adminPassword;

    if (typeof adminPassword !== 'string') {
        res.status(401).send('The administrator password has to be a string!');
        return;
    }
    if (adminPassword.length > 20) {
        res.status(401).send('The administrator password is too long!');
        return;
    }

    compareAdminPassword(adminPassword, (err, compareResult) => {
        if (err) {
            console.log(err);
            res.status(401).send(err);
            return;
        }
        if (!compareResult) {
            res.status(401).send('The administrator password is not correct!');
            return;
        }

        const resultToSend = {firstGrade: null, secondGrade: null};
        let sentError = false;
        getCandidates1((err, rows) => {
            if (sentError) {
                return;
            }
            if (err) {
                sentError = true;
                res.status(500).send('Error in getCandidates1()!');
                return;
            }

            if (resultToSend.secondGrade !== null) {
                resultToSend.firstGrade = rows;
                res.status(200).send(resultToSend);
                return;
            }
            resultToSend.firstGrade = rows;
        });
        getCandidates2((err, rows) => {
            if (sentError) {
                return;
            }
            if (err) {
                sentError = true;
                res.status(500).send('Error in getCandidates2()!');
                return;
            }

            if (resultToSend.firstGrade !== null) {
                resultToSend.secondGrade = rows;
                res.status(200).send(resultToSend);
                return;
            }
            resultToSend.secondGrade = rows;
        });
    });
});

module.exports = router;
