import CandidateNames from '../../CandidateNames';

export default interface InitializePollRequest {
    adminPassword: string;
    candidateNames: CandidateNames;
}
