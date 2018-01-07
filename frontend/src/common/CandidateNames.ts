export default interface CandidateNames {
  candidateNames1M: Array<string>;
  candidateNames1F: Array<string>;
  candidateNames2: Array<string>;
}

export function isValidCandidateNames(candidateNames: CandidateNames): boolean {
  return isValidCandidateNameArray(candidateNames.candidateNames1M)
    && isValidCandidateNameArray(candidateNames.candidateNames1F)
    && isValidCandidateNameArray(candidateNames.candidateNames2);
}

export function isValidCandidateNameArray(candidateNames: Array<string>): boolean {
  if (!Array.isArray(candidateNames)) {
    return false;
  }
  for (const candidateName in candidateNames) {
    if (!candidateName || typeof candidateName !== 'string' || candidateName.length > 30) {
      return false;
    }
  }

  return true;
}
