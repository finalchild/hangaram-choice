'use strict';
const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');

const getCandidates1M = require('./database.js').getCandidates1M;
const getCandidates1F = require('./database.js').getCandidates1F;
const getCandidates2 = require('./database.js').getCandidates2;

let candidateNames;
Promise.all([getCandidates1M(), getCandidates1F(), getCandidates2()]).then(results => {
    candidateNames = {
        candidateNames1M: results[0].map(candidate => candidate.name),
        candidateNames1F: results[1].map(candidate => candidate.name),
        candidateNames2: results[2].map(candidate => candidate.name),
        candidatesCacheId: process.env.candidatesCacheId
    };
});

function getCandidateNames() {
    if (candidateNames === undefined) {
        throw 'candidateNames is undefined!';
    }
    return candidateNames;
}

module.exports.getCandidateNames = getCandidateNames;
