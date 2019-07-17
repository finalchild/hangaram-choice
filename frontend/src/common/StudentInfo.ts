import {isValidStudentName} from './CandidateNames';

export default interface StudentInfo {
    name: string;
    studentNumber: number;
}

export function isValidStudentInfo(x: any): boolean {
    return typeof x === 'object' && x !== null
        && isValidStudentName(x.name)
        && isValidStudentName(x.studentNumber);
}

