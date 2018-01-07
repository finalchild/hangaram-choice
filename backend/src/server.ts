#!/usr/bin/env node

'use strict';

import * as cluster from 'cluster';
import CandidateNamesCache from './common/CandidateNamesCache';

if (cluster.isMaster) {
    masterMain();
} else {
    workerMain();
}

async function masterMain(): Promise<void> {
    const sqlite3 = require('sqlite3');
    const bcrypt = require('bcrypt');
    const uuidv4 = require('uuid/v4');
    const id = uuidv4();
    const database = require('./database');

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
            db.run('INSERT INTO admin_password SELECT ( ? ) WHERE NOT EXISTS (SELECT * FROM admin_password)', [bcrypt.hashSync('hangaram', database.saltRounds)]);
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

    const results = await Promise.all([database.getCandidates1M(), database.getCandidates1F(), database.getCandidates2()]);
    const cache: CandidateNamesCache = {
        candidateNames: await database.getCandidateNames(),
        candidatesCacheId: id
    };

    const cpuCount = require('os').cpus().length;
    for (let i = 0; i < cpuCount; i++) {
        const worker = cluster.fork();
        worker.send(cache);
    }

    cluster.on('exit', worker => {
        console.log(`Worker ${worker.id} died :(`);
        cluster.fork();
    });

    console.log(`HangaramChoiceBack running on port ${process.env.PORT || '3000'}`);
    return;
}

function workerMain(): void {
    const candidateNamesCache = require('./candidateNamesCache');
    process.on('message', msg => {
        candidateNamesCache.setCache(msg);
    });

    const app = require('./app').default;
    app.listen(process.env.PORT || '3000');
}
