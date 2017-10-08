export class Result {

  candidates1M: Array<Candidate>;
  candidates1F: Array<Candidate>;
  candidates2: Array<Candidate>;
  numberOfFirstGradeNotVotedKeys: number;
  numberOfFirstGradeVotedKeys: number;
  numberOfSecondGradeNotVotedKeys: number;
  numberOfSecondGradeVotedKeys: number;

}

export class Candidate {

  name: string;
  votes: number;

}
