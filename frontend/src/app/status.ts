import XLSX from 'xlsx-populate/browser/xlsx-populate';
import {saveAs} from 'file-saver';
import Status from '../common/Status';
import Student from '../common/Student';
import {toKeyWithCheckDigit} from './admin-create-student-keys-dialog.component';

export async function downloadResultImpl(result: Status): Promise<void> {
  const workbook = await XLSX.fromBlankAsync();
  const sheet2 = workbook.addSheet('2학년 회장단');
  sheet2.cell('A1').value('후보자');
  sheet2.cell('B1').value('전체 득표수');
  sheet2.cell('C1').value('1학년 득표수');
  sheet2.cell('D1').value('2학년 득표수');
  sheet2.cell('E1').value('3학년 득표수');
  for (let i = 0; i < result.candidates.candidates2.length; i++) {
    sheet2.row(i + 1).cell(1).value(result.candidates.candidates2[i].name);
    sheet2.row(i + 1).cell(2).value(result.candidates.candidates2[i].votes);
    sheet2.row(i + 1).cell(3).value(result.candidates.candidates2[i].firstGradeVotes);
    sheet2.row(i + 1).cell(4).value(result.candidates.candidates2[i].secondGradeVotes);
    sheet2.row(i + 1).cell(5).value(result.candidates.candidates2[i].thirdGradeVotes);
  }
  const sheet1M = workbook.addSheet('1학년 남자 부회장');
  sheet1M.cell('A1').value('후보자');
  sheet1M.cell('B1').value('전체 득표수');
  sheet1M.cell('C1').value('1학년 득표수');
  sheet1M.cell('D1').value('2학년 득표수');
  sheet1M.cell('E1').value('3학년 득표수');
  for (let i = 0; i < result.candidates.candidates1M.length; i++) {
    sheet1M.row(i + 1).cell(1).value(result.candidates.candidates1M[i].name);
    sheet1M.row(i + 1).cell(2).value(result.candidates.candidates1M[i].votes);
    sheet1M.row(i + 1).cell(3).value(result.candidates.candidates1M[i].firstGradeVotes);
    sheet1M.row(i + 1).cell(4).value(result.candidates.candidates1M[i].secondGradeVotes);
    sheet1M.row(i + 1).cell(5).value(result.candidates.candidates1M[i].thirdGradeVotes);
  }
  const sheet1F = workbook.addSheet('1학년 여자 부회장');
  sheet1F.cell('A1').value('후보자');
  sheet1F.cell('B1').value('전체 득표수');
  sheet1F.cell('C1').value('1학년 득표수');
  sheet1F.cell('D1').value('2학년 득표수');
  sheet1F.cell('E1').value('3학년 득표수');
  for (let i = 0; i < result.candidates.candidates1F.length; i++) {
    sheet1F.row(i + 1).cell(1).value(result.candidates.candidates1F[i].name);
    sheet1F.row(i + 1).cell(2).value(result.candidates.candidates1F[i].votes);
    sheet1F.row(i + 1).cell(3).value(result.candidates.candidates1F[i].firstGradeVotes);
    sheet1F.row(i + 1).cell(4).value(result.candidates.candidates1F[i].secondGradeVotes);
    sheet1F.row(i + 1).cell(5).value(result.candidates.candidates1F[i].thirdGradeVotes);
  }
  workbook.deleteSheet(0);

  const wbout = await workbook.outputAsync();
  saveAs(new Blob([wbout], {type: 'application/octet-stream'}), '투표결과.xlsx');
}

export async function downloadStudents(result: Array<Student>): Promise<void> {
  const workbook = await XLSX.fromBlankAsync();
  const firstGradeSheet = workbook.addSheet('1학년');
  const secondGradeSheet = workbook.addSheet('2학년');
  const thirdGradeSheet = workbook.addSheet('3학년');
  workbook.deleteSheet(0);

  const firstGradeStudents = result.filter(student => student.grade === 1);
  const secondGradeStudents = result.filter(student => student.grade === 2);
  const thirdGradeStudents = result.filter(student => student.grade === 3);

  for (let i = 0; i < firstGradeStudents.length; i++) {
    firstGradeSheet.row(i + 1).cell(1).value(firstGradeStudents[i].name);
    firstGradeSheet.row(i + 1).cell(2).value(firstGradeStudents[i].studentNumber);
    firstGradeSheet.row(i + 1).cell(3).value(toKeyWithCheckDigit(firstGradeStudents[i].key));
    firstGradeSheet.row(i + 1).cell(4).value(firstGradeStudents[i].voted === 1 ? '투표 완료' : '투표 미완료');
  }
  for (let i = 0; i < secondGradeStudents.length; i++) {
    secondGradeSheet.row(i + 1).cell(1).value(secondGradeStudents[i].name);
    secondGradeSheet.row(i + 1).cell(2).value(secondGradeStudents[i].studentNumber);
    secondGradeSheet.row(i + 1).cell(3).value(toKeyWithCheckDigit(secondGradeStudents[i].key));
    secondGradeSheet.row(i + 1).cell(4).value(secondGradeStudents[i].voted === 1 ? '투표 완료' : '투표 미완료');
  }
  for (let i = 0; i < thirdGradeStudents.length; i++) {
    thirdGradeSheet.row(i + 1).cell(1).value(thirdGradeStudents[i].name);
    thirdGradeSheet.row(i + 1).cell(2).value(thirdGradeStudents[i].studentNumber);
    thirdGradeSheet.row(i + 1).cell(3).value(toKeyWithCheckDigit(thirdGradeStudents[i].key));
    thirdGradeSheet.row(i + 1).cell(4).value(thirdGradeStudents[i].voted === 1 ? '투표 완료' : '투표 미완료');
  }

  const wbout = await workbook.outputAsync();
  saveAs(new Blob([wbout], {type: 'application/octet-stream'}), '학생키.xlsx');
}
