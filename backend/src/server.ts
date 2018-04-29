import * as cluster from 'cluster';
import masterMain from './masterMain';
import workerMain from './workerMain';

if (cluster.isMaster) {
    masterMain();
} else {
    workerMain();
}

