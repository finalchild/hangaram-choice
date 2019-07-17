import {isValidKey, isValidStudentNumber} from '../util';

export default interface LoginRequest {
    key: number;
    studentNumber: number;
    candidatesCacheId: string | null;
}

export function isValidLoginRequest(x: any): boolean {
    return typeof x === 'object' && x !== null
        && isValidKey(x.key)
        && isValidStudentNumber(x.studentNumber)
        && (x.candidatesCacheId === null || typeof x.candidatesCacheId === 'string');
}
