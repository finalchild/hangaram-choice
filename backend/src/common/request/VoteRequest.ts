export default interface VoteRequest {
    key: number;
    candidateName1M: string | null;
    candidateName1F: string | null;
    candidateName2: string;
}
