'use strict';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite3', err => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    db.run('CREATE TABLE if not exists students (UniqueKey INT, Voted BIT, Grade TINYINT)');
    db.run('CREATE TABLE if not exists candidates1 (Name INT, Votes INT)');
    db.run('CREATE TABLE if not exists candidates2 (Name INT, Votes INT)');
});

const studentQuerySql = `SELECT UniqueKey AS key,
                         Voted AS voted,
                         Grade AS grade
                         FROM students
                         WHERE Key = ?`;
const setVotedSql = `UPDATE students
                   SET Voted = 1
                   WHERE UniqueKey = ?`;
const increment1Sql = `UPDATE candidates1
                      SET Votes = Votes + 1
                      WHERE Name = ?`;
const increment2Sql = `UPDATE candidates2
                      SET Votes = Votes + 1
                      WHERE Name = ?`;
const candidate1QuerySql = `SELECT Name AS name,
                                  Votes AS votes
                           FROM candidates1
                           WHERE Name = ?`;
const candidate2QuerySql = `SELECT Name AS name,
                                  Votes AS votes
                           FROM candidates2
                           WHERE Name = ?`;
const candidates1QuerySql = `SELECT Name AS name,
                                   Votes AS votes
                            FROM candidates1`;
const candidates2QuerySql = `SELECT Name AS name,
                                   Votes AS votes
                            FROM candidates2`;

function getStudent(key, callback) {
    if (!Number.isSafeInteger(key)) {
        throw 'Key has to be a safe integer!';
    }

    db.serialize(() => {
        db.get(studentQuerySql, [key], callback);
    });
}

/**
 * 투표
 * @param key 투표자 키
 * @param candidateName1 1학년 후보자 이름 (null인 경우 무시)
 * @param candidateName2 2학년 후보자 이름 (null인 경우 무시)
 * @param callback 콜백
 */
function vote(key, candidateName1, candidateName2, callback) {
    if (!Number.isSafeInteger(key)) {
        throw 'Key has to be a safe integer!';
    }

    db.serialize(() => {
        db.run(setVotedSql, [key], (err) => {
            if (err) {
                callback(err);
                return;
            }

            db.serialize(() => {
                if (candidateName1 !== null) {
                    db.run(increment1Sql, [candidateName1], (err) => {
                        if (err || candidateName2 === null) callback(err);
                        else db.serialize(() => db.run(increment2Sql, [candidateName2], callback))
                    });
                } else {
                    db.run(increment2Sql, [candidateName2], callback);
                }

            });
        });
    });
}

function getCandidate1(candidateName, callback) {
    db.serialize(() => {
        db.get(candidate1QuerySql, [candidateName], callback);
    });
}

function getCandidate2(candidateName, callback) {
    db.serialize(() => {
        db.get(candidate2QuerySql, [candidateName], callback);
    });
}

function getCandidates1(callback) {
    db.serialize(() => {
        db.all(candidates1QuerySql, callback);
    });
}

function getCandidates2(callback) {
    db.serialize(() => {
        db.all(candidates2QuerySql, callback);
    });
}

module.exports.db = db;
module.exports.getStudent = getStudent;
module.exports.getCandidate1 = getCandidate1;
module.exports.getCandidate2 = getCandidate2;
module.exports.getCandidates1 = getCandidates1;
module.exports.getCandidates2 = getCandidates2;

module.exports.vote = vote;
