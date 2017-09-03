'use strict';
const express = require('express');
const router = express.Router();

const getStudent = require('../database').getStudent;
const getCandidate1 = require('../database').getCandidate1;
const getCandidate2 = require('../database').getCandidate2;
const vote = require('../database').vote;

router.post('/', function(req, res) {
    const key = req.body.key;
    const candidateName1 = req.body.candidateName1;
    const candidateName2 = req.body.candidateName2;
    if (!Number.isSafeInteger(key)) {
        res.status(400).send('Key has to be a safe integer!');
        return;
    }
    if ((candidateName1 !== null && candidateName1 !== undefined && typeof candidateName1 !== 'string') || (candidateName2 !== null && candidateName2 !== undefined && typeof candidateName2 !== 'string')) {
        res.status(400).send('Candidate names have to be strings!');
        return;
    }
    if (candidateName1 !== null && candidateName1 !== undefined && candidateName2 !== null && candidateName2 !== undefined) {
        let candidate1Checked = false;
        let candidate2Checked = false;
        let sentError = false;
        getCandidate1(candidateName1, (err, row) => {
            if (sentError) {
                return;
            }
            if (err) {
                sentError = true;
                res.status(500).send('Error in getCandidate1()');
                return;
            }
            if (!row) {
                sentError = true;
                res.status(400).send('First grade candidate not found!');
                return;
            }

            if (candidate2Checked) {
                afterCheck(res, key, candidateName1, candidateName2);
            } else {
                candidate1Checked = true;
            }
        });
        getCandidate2(candidateName2, (err, row) => {
            if (sentError) {
                return;
            }
            if (err) {
                sentError = true;
                res.status(500).send('Error in getCandidate2()');
                return;
            }
            if (!row) {
                sentError = true;
                res.status(400).send('Second grade candidate not found!');
                return;
            }

            if (candidate1Checked) {
                afterCheck(res, key, candidateName1, candidateName2);
            } else {
                candidate2Checked = true;
            }
        });
    } else if (candidateName1 !== null && candidateName1 !== undefined) {
        getCandidate1(candidateName1, (err, row) => {
            if (err) {
                res.status(500).send('Error in getCandidate1()');
                return;
            }
            if (!row) {
                res.status(400).send('First grade candidate not found!');
                return;
            }

            afterCheck(res, key, candidateName1, candidateName2);
        });
    } else if (candidateName2 !== null && candidateName2 !== undefined) {
        getCandidate2(candidateName2, (err, row) => {
            if (err) {
                res.status(500).send('Error in getCandidate2()');
                return;
            }
            if (!row) {
                res.status(400).send('Second grade candidate not found!');
                return;
            }

            afterCheck(res, key, candidateName1, candidateName2);
        });
    } else {
        afterCheck(res, key, candidateName1, candidateName2);
    }
});

function afterCheck(res, key, candidateName1, candidateName2) {
    getStudent(key, (err, row) => {
        if (err) {
            res.status(500).send(err);
            console.error('Error in getStudent()');
            return;
        } else if (row.voted) {
            res.status(403).send('You\'ve already voted!');
            return;
        }

        if (row.grade === 2 && candidateName1 !== null && candidateName1 !== undefined) {
            res.status(400).send('2nd graders can\'t vote for 1st grade candidates!');
            return;
        }

        vote(key, candidateName1, candidateName2, (err) => {
            if (err) {
                res.status(500).send(err);
                console.error('Error in vote()');
                return;
            }
            res.status(200).send('Vote successful!');
        });
    });
}

module.exports = router;
