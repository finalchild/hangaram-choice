export default interface VoteRequest {
    key: number;
    studentNumber: number;
    candidateName1M: string | null;
    candidateName1F: string | null;
    candidateName2: string;
}
