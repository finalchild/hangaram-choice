import * as cluster from 'cluster';
import * as sqlite3 from 'sqlite3';
import * as bcrypt from 'bcrypt';
import * as uuidv4 from 'uuid/v4';
import {cpus} from 'os'

import CandidateNamesCache from './common/CandidateNamesCache';
import {getCandidateNames, saltRounds} from './database';
import {fs} from 'mz';

export default async function masterMain(): Promise<void> {
    const id = uuidv4();
    const db = new sqlite3.Database('database.sqlite3', err => {
        if (err) {
            console.error(err.message);
        }
    });

    await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS student (unique_key INTEGER NOT NULL PRIMARY KEY, voted INTEGER NOT NULL DEFAULT 0, grade INTEGER NOT NULL)');
            db.run('CREATE TABLE IF NOT EXISTS candidate1M (name TEXT NOT NULL PRIMARY KEY, votes INTEGER NOT NULL)');
            db.run('CREATE TABLE IF NOT EXISTS candidate1F (name TEXT NOT NULL PRIMARY KEY, votes INTEGER NOT NULL)');
            db.run('CREATE TABLE IF NOT EXISTS candidate2 (name TEXT NOT NULL PRIMARY KEY, votes INTEGER NOT NULL)');
            db.run('CREATE TABLE IF NOT EXISTS admin_password (password TEXT NOT NULL)');
            db.run('CREATE TABLE IF NOT EXISTS poll_name (name TEXT NOT NULL)');
            db.run('CREATE TABLE IF NOT EXISTS state (state TEXT NOT NULL)');
            db.run('INSERT INTO admin_password SELECT ( ? ) WHERE NOT EXISTS (SELECT * FROM admin_password)', [bcrypt.hashSync('hangaram', saltRounds)]);
            db.run('INSERT INTO poll_name SELECT ( \'한가람고등학교 학생회장단 선거\' ) WHERE NOT EXISTS (SELECT * FROM poll_name)');
            db.run('INSERT INTO state SELECT ( \'closed\' ) WHERE NOT EXISTS (SELECT * FROM state)', [], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });

    const cache: CandidateNamesCache = {
        candidateNames: await getCandidateNames(),
        candidatesCacheId: id
    };

    if (!await fs.exists('oldPolls')){
        await fs.mkdir('oldPolls');
    }

    const cpuCount = cpus().length;
    const workers = [];
    for (let i = 0; i < cpuCount; i++) {
        const worker = cluster.fork();
        worker.send(cache);
        workers.push(worker);
    }

    cluster.on('message', (worker, message, handle) => {
        workers.forEach(worker => worker.send(message));
    });

    cluster.on('exit', worker => {
        console.log(`Worker ${worker.id} died :(`);
        cluster.fork();
    });

    console.log(`HangaramChoiceBack running on port ${process.env.PORT || '80'}`);
    return;
}
