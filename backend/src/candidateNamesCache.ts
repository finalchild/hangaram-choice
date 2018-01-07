import CandidateNamesCache from './common/CandidateNamesCache';

let candidateNamesCache: CandidateNamesCache;

export function getCache(): CandidateNamesCache {
    if (candidateNamesCache === undefined) {
        throw 'candidateNamesCache is undefined!';
    }
    return candidateNamesCache;
}

export function setCache(newCandidateNamesCache: CandidateNamesCache): void {
    candidateNamesCache = newCandidateNamesCache;
}
