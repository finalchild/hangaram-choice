import {isValidKey, isValidStudentNumber} from '../util';

export default interface LoginRequest {
    key: number;
    studentNumber: number;
    candidatesCacheId?: string;
}

export function isValidLoginRequest(x: any): boolean {
    return typeof x === 'object' && x !== null
        && isValidKey(x.key)
        && isValidStudentNumber(x.studentNumber)
        && typeof x.candidatesCacheId === 'string';
}
