import StudentInfo, {isValidStudentInfo} from './StudentInfo';

export default interface StudentInfoes {
  firstGradeStudentInfoes: Array<StudentInfo>;
  secondGradeStudentInfoes: Array<StudentInfo>;
  thirdGradeStudentInfoes: Array<StudentInfo>;
}

export function isValidStudentInfoes(x: any): boolean {
  return typeof x === 'object' && x !== null
    && isValidStudentInfoArray(x.firstGradeStudentInfoes)
    && isValidStudentInfoArray(x.secondGradeStudentInfoes)
    && isValidStudentInfoArray(x.thirdGradeStudentInfoes);
}

function isValidStudentInfoArray(x: any): boolean {
  return Array.isArray(x) && x.every(isValidStudentInfo);
}
