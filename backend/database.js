'use strict';
const Promise = require('bluebird');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite3', err => {
    if (err) {
        console.error(err.message);
    }
});

const saltRounds = 10;

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS student (unique_key INTEGER NOT NULL PRIMARY KEY, voted INTEGER NOT NULL DEFAULT 0, grade INTEGER NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS candidate1M (name TEXT NOT NULL PRIMARY KEY, votes INTEGER NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS candidate1F (name TEXT NOT NULL PRIMARY KEY, votes INTEGER NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS candidate2 (name TEXT NOT NULL PRIMARY KEY, votes INTEGER NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS admin_password (password TEXT NOT NULL)');
    db.run(`INSERT INTO admin_password SELECT ? WHERE NOT EXISTS (SELECT * FROM admin_password)`, [bcrypt.hashSync("hangaram", saltRounds)]);
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
            db.get('SELECT unique_key AS key, voted, grade FROM student WHERE Key = ?', [key], (err, row) => {
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
            db.run('UPDATE student SET voted = 1 WHERE unique_key = ? AND voted = 0', [key], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                if (this.changes === 0) {
                    reject('Couldn\'t set voted. Maybe you have already voted?');
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
                        db.run(`UPDATE candidate1M
                        SET votes = votes + 1
                        WHERE name = ?`, [candidateName1M]);
                    }
                    if (candidateName1F) {
                        db.run(`UPDATE candidate1F
                        SET votes = votes + 1
                        WHERE name = ?`, [candidateName1F]);
                    }
                    if (candidateName2) {
                        db.run(`UPDATE candidate2
                        SET votes = votes + 1
                        WHERE name = ?`, [candidateName2]);
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
                db.get('SELECT * FROM candidate1M WHERE name = ?', [candidateName], (err, row) => {
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
                db.get('SELECT * FROM candidate1F WHERE name = ?', [candidateName], (err, row) => {
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
                db.get('SELECT * FROM candidate2 WHERE name = ?', [candidateName], (err, row) => {
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
            db.all('SELECT * FROM candidate1M', [], (err, rows) => {
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
            db.all('SELECT * FROM candidate1F', [], (err, rows) => {
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
            db.all('SELECT * FROM candidate2', [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            })
        })
    });
}

// SQL Injection 체크를 하지 않습니다. 절대로 입력받은 것을 인자로 넣지 마세요.
function setStudentKeys(keys) {
    return new Promise((resolve, reject) => {
        const firstGradeStudents = Array.from(keys.firstGradeKeys.values()).map(key => {
            return `(${key}, 0, 1)`;
        });
        const secondGradeStudents = Array.from(keys.secondGradeKeys.values()).map(key => {
            return `(${key}, 0, 2)`;
        });
        const values = firstGradeStudents.concat(secondGradeStudents).join(', ');

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            db.run('DELETE FROM student');
            if (values !== '') {
                db.run('INSERT INTO student (unique_key, voted, grade) VALUES ' + values);
            }
            db.run('COMMIT', [], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(keys);
            });
        });
    });
}

function getNumberOfKeys() {
    const firstGradeNotVotedPromise = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 1 and voted = 0', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        })
    });
    const firstGradeVotedPromise = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 1 and voted = 1', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        })
    });
    const secondGradeNotVotedPromise = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 2 and voted = 0', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        })
    });
    const secondGradeVotedPromise = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 2 and voted = 1', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        })
    });

    return Promise.all([firstGradeNotVotedPromise, firstGradeVotedPromise, secondGradeNotVotedPromise, secondGradeVotedPromise]).then(results => {
        return {
            numberOfFirstGradeNotVotedKeys: results[0],
            numberOfFirstGradeVotedKeys: results[1],
            numberOfSecondGradeNotVotedKeys: results[2],
            numberOfSecondGradeVotedKeys: results[3]
        }
    });
}

function getAdminPassword() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT * from admin_password', [], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row.password);
            });
        });
    });
}

function isValidAdminPassword(plaintextPassword) {
    return typeof plaintextPassword === 'string' && plaintextPassword.length <= 20;
}

function assertValidAdminPassword(plaintextPassword) {
    if (!isValidAdminPassword(plaintextPassword)) throw 'Invalid admin password!';
}

function compareAdminPassword(plaintextPassword) {
    return new Promise((resolve, reject) => {
        assertValidAdminPassword(plaintextPassword);
        resolve();
    }).then(getAdminPassword).then(adminPassword => bcrypt.compare(plaintextPassword, adminPassword));
}

function setAdminPassword(newPlaintextPassword) {
    return new Promise((resolve, reject) => {
        assertValidAdminPassword(newPlaintextPassword);
        resolve(newPlaintextPassword);
    }).then(result => {
        return bcrypt.hash(result, saltRounds)
    }).then(result => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('UPDATE admin_password SET password = ?', [result], err => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    });
}

module.exports.db = db;
module.exports.isValidKey = isValidKey;
module.exports.assertValidKey = assertValidKey;
module.exports.getStudent = getStudent;
module.exports.tryToSetVoted = tryToSetVoted;
module.exports.vote = vote;
module.exports.getCandidate1M = getCandidate1M;
module.exports.getCandidate1F = getCandidate1F;
module.exports.getCandidate2 = getCandidate2;
module.exports.getCandidates1M = getCandidates1M;
module.exports.getCandidates1F = getCandidates1F;
module.exports.getCandidates2 = getCandidates2;
module.exports.setStudentKeys = setStudentKeys;
module.exports.getNumberOfKeys = getNumberOfKeys;
module.exports.isValidAdminPassword = isValidAdminPassword;
module.exports.assertValidAdminPassword = assertValidAdminPassword;
module.exports.compareAdminPassword = compareAdminPassword;
module.exports.setAdminPassword = setAdminPassword;
