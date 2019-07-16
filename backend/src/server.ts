import * as cluster from 'cluster';

main();

async function main() {
    if (cluster.isMaster) {
        (await import('./masterMain')).default();
    } else {
        (await import('./workerMain')).default();
    }
}

