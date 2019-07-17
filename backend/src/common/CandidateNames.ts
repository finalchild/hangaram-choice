import {isValidPollName} from './util';

export default interface CandidateNames {
    pollName: string;
    candidateNames1M: Array<string>;
    candidateNames1F: Array<string>;
    candidateNames2: Array<string>;
}

export function isValidCandidateNames(x: any): boolean {
    return typeof x === 'object' && x !== null
        && isValidPollName(x.pollName)
        && isValidCandidateNameArray(x.candidateNames1M)
        && isValidCandidateNameArray(x.candidateNames1F)
        && isValidCandidateNameArray(x.candidateNames2);
}

export function isValidCandidateNameArray(x: any): boolean {
    if (!Array.isArray(x)) {
        return false;
    }
    for (const candidateName of x) {
        if (!isValidStudentName(candidateName)) {
            return false;
        }
    }

    return true;
}

export function isValidStudentName(x: any): boolean {
    return typeof x === 'string' && x.length > 0 && x.length < 30;
}
