import StudentInfoes, {isValidStudentInfoes} from '../../StudentInfoes';
import {isValidAdminPassword} from '../../util';

export default interface GenerateKeysRequest {
    adminPassword: string;
    studentInfoes: StudentInfoes;
}

export function isValidGenerateKeysRequest(x: any): boolean {
    return typeof x === 'object' && x !== null
        && isValidAdminPassword(x.adminPassword)
        && isValidStudentInfoes(x.studentInfoes);
}
