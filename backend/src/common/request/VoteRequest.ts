import {isValidKey, isValidStudentNumber} from '../util';
import {isValidStudentName} from '../CandidateNames';

export default interface VoteRequest {
    key: number;
    studentNumber: number;
    candidateName1M: string | null;
    candidateName1F: string | null;
    candidateName2: string;
}

export function isValidVoteRequest(x: any): boolean {
    return typeof x === 'object' && x !== null
        && isValidKey(x.key)
        && isValidStudentNumber(x.studentNumber)
        && (x.candidateName1M === null || isValidStudentName(x.candidateName1M))
        && (x.candidateName1F === null || isValidStudentName(x.candidateName1F))
        && isValidStudentName(x.candidateName2);
}
