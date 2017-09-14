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
    db.run('CREATE TABLE if not exists candidates1M (Name INT, Votes INT)');
    db.run('CREATE TABLE if not exists candidates1F (Name INT, Votes INT)');
    db.run('CREATE TABLE if not exists candidates2 (Name INT, Votes INT)');
});

function isValidKey(key) {
    return Number.isSafeInteger(key) && key > 0 && key < 10000000;
}

function assertValidKey(key) {
    if (!isValidKey(key)) throw 'Invalid key!';
}

function getStudent(key) {
    return new Promise((resolve, reject) => {
        assertValidKey(key);
        db.serialize(() => {
            db.get(`SELECT UniqueKey AS key,
                       Voted AS voted,
                       Grade AS grade
                       FROM students
                       WHERE Key = ?`, [key], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        })
    });
}

function tryToSetVoted(key) {
    return new Promise((resolve, reject) => {
        assertValidKey(key);
        db.serialize(() => {
            db.run(`UPDATE students
                    SET Voted = 1
                    WHERE UniqueKey = ? AND Voted = 0`, [key], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                if (this.changes === 0) {
                    reject('Couldn\'t set Voted. Maybe you have already voted?');
                    return;
                }
                resolve();
            });
        })
    })
}

/**
 * 투표
 * @param key 투표자 키
 * @param candidateName1M 1학년 남자 후보자 이름 (falsy인 경우 무시)
 * @param candidateName1F 1학년 여자 후보자 이름 (falsy인 경우 무시)
 * @param candidateName2 2학년 후보자 이름 (falsy인 경우 무시)
 */
function vote(key, candidateName1M, candidateName1F, candidateName2) {
    return new Promise((resolve, reject) => {
        assertValidKey(key);
        tryToSetVoted(key)
            .then(() => {
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');
                    if (candidateName1M) {
                        db.run(`UPDATE candidates1M
                        SET Votes = Votes + 1
                        WHERE Name = ?`, [candidateName1M]);
                    }
                    if (candidateName1F) {
                        db.run(`UPDATE candidates1F
                        SET Votes = Votes + 1
                        WHERE Name = ?`, [candidateName1F]);
                    }
                    if (candidateName2) {
                        db.run(`UPDATE candidates2
                        SET Votes = Votes + 1
                        WHERE Name = ?`, [candidateName2]);
                    }
                    db.run('COMMIT', [], (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    })
                })
            });
    });
}

function getCandidate1M(candidateName) {
    return new Promise((resolve, reject) => {
        if (candidateName) {
            db.serialize(() => {
                db.get(`SELECT Name AS name,
                Votes AS votes
                FROM candidates1M
                WHERE Name = ?`, [candidateName], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(row);
                });
            });
        } else {
            // candidateName이 falsy면 truthy 값을 반환.
            resolve('truthy');
        }
    })
}

function getCandidate1F(candidateName) {
    return new Promise((resolve, reject) => {
        if (candidateName) {
            db.serialize(() => {
                db.get(`SELECT Name AS name,
                Votes AS votes
                FROM candidates1F
                WHERE Name = ?`, [candidateName], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(row);
                });
            });
        } else {
            // candidateName이 falsy면 truthy 값을 반환.
            resolve('truthy');
        }
    })
}

function getCandidate2(candidateName) {
    return new Promise((resolve, reject) => {
        if (candidateName) {
            db.serialize(() => {
                db.get(`SELECT Name AS name,
                Votes AS votes
                FROM candidates2
                WHERE Name = ?`, [candidateName], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(row);
                });
            });
        } else {
            // candidateName이 falsy면 truthy 값을 반환.
            resolve('truthy');
        }
    })
}

function getCandidates1M() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Name AS name,
                    Votes AS votes
                    FROM candidates1M`, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            })
        })
    });
}

function getCandidates1F() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Name AS name,
                    Votes AS votes
                    FROM candidates1F`, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            })
        })
    });
}

function getCandidates2() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Name AS name,
                    Votes AS votes
                    FROM candidates2`, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            })
        })
    });
}

module.exports.db = db;
module.exports.isValidKey = isValidKey;
module.exports.assertValidKey = assertValidKey;
module.exports.getStudent = getStudent;
module.exports.getCandidate1M = getCandidate1M;
module.exports.getCandidate1F = getCandidate1F;
module.exports.getCandidate2 = getCandidate2;
module.exports.getCandidates1M = getCandidates1M;
module.exports.getCandidates1F = getCandidates1F;
module.exports.getCandidates2 = getCandidates2;

module.exports.vote = vote;
