import KeyStatus from './KeyStatus';
import Candidates from './Candidates';

export default interface Status {
  candidates: Candidates;
  keyStatus: KeyStatus;
  state: string;
  pollName: string;
}
