'use strict';

let candidateNamesCache;

function getCache() {
    if (candidateNamesCache === undefined) {
        throw 'candidateNamesCache is undefined!';
    }
    return candidateNamesCache;
}

function setCache(newCandidateNamesCache) {
    candidateNamesCache = newCandidateNamesCache
}

module.exports.getCache = getCache;
module.exports.setCache = setCache;
