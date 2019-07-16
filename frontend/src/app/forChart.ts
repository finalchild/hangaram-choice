import Candidate from '../common/Candidate';

export function forChart(candidates: Array<Candidate>): Array<{ name: string, value: number }> {
  const result =  candidates.map(candidate => ({
    name: candidate.name,
    value: candidate.votes
  }));
  if (result.every(candidate => candidate.value === 0)) {
    return [
      {
        name: '아직 투표자 없음',
        value: 1
      }
    ];
  } else {
    return result;
  }
}
