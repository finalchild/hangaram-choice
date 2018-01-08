import CandidateNames from '../../CandidateNames';

export default interface InitializePollRequest {
    adminPassword: string;
    pollName: string;
    candidateNames: CandidateNames;
}
