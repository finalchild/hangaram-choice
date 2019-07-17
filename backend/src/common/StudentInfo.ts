import {isValidStudentName} from './CandidateNames';
import {isValidStudentNumber} from './util';

export default interface StudentInfo {
    name: string;
    studentNumber: number;
}

export function isValidStudentInfo(x: any): boolean {
    return typeof x === 'object' && x !== null
        && isValidStudentName(x.name)
        && isValidStudentNumber(x.studentNumber);
}

