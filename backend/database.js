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

function setCandidates(candidates) {
    return new Promise((resolve, reject) => {
        const candidates1M = candidates.candidates1M.map(candidate => {
            return `(${candidate.name}, ${candidate.vote})`;
        }).join(', ');
        const candidates1F = candidates.candidates1F.map(candidate => {
            return `(${candidate.name}, ${candidate.vote})`;
        }).join(', ');
        const candidates2 = candidates.candidate2.map(candidate => {
            return `(${candidate.name}, ${candidate.vote})`;
        }).join(', ');

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            db.run('DELETE FROM candidate1M');
            db.run('DELETE FROM candidate1F');
            db.run('DELETE FROM candidate2');
            if (candidates1M !== '') {
                db.run('INSERT INTO candidate1M (name, voted) VALUES ' + candidates1M);
            }
            if (candidates1F !== '') {
                db.run('INSERT INTO candidate1F (name, voted) VALUES ' + candidates1F);
            }
            if (candidates2 !== '') {
                db.run('INSERT INTO candidate2 (name, voted) VALUES' + candidates2);
            }
            db.run('COMMIT', [], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(candidates);
            });
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
        const thirdGradeStudents = Array.from(keys.thirdGradeKeys.values()).map(key => {
            return `(${key}, 0, 3)`;
        });
        const values = firstGradeStudents.concat(secondGradeStudents).concat(thirdGradeStudents).join(', ');

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
    const thirdGradeNotVotedPromise = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 3 and voted = 0', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        })
    });
    const thirdGradeVotedPromise = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 3 and voted = 1', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        })
    });

    return Promise.all([firstGradeNotVotedPromise, firstGradeVotedPromise, secondGradeNotVotedPromise, secondGradeVotedPromise, thirdGradeNotVotedPromise, thirdGradeVotedPromise]).then(results => {
        return {
            numberOfFirstGradeNotVotedKeys: results[0],
            numberOfFirstGradeVotedKeys: results[1],
            numberOfSecondGradeNotVotedKeys: results[2],
            numberOfSecondGradeVotedKeys: results[3],
            numberOfThirdGradeNotVotedKeys: results[4],
            numberOfThirdGradeVotedKeys: results[5]
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

function getPollName() {
    return new Promise((resolve, reject) => {
        db.get('SELECT * from poll_name', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row.name);
        });
    });
}

function setPollName(name) {
    return new Promise((resolve, reject) => {
        db.get('UPDATE poll_name SET name = ?', [name], err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function getStatus() {
    return new Promise((resolve, reject) => {
        db.get('SELECT * from status', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row.status);
        });
    });
}

function setStatus(status) {
    return new Promise((resolve, reject) => {
        db.get('UPDATE status SET status = ?', [status], err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
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
module.exports.setCandidates = setCandidates;
module.exports.setStudentKeys = setStudentKeys;
module.exports.getNumberOfKeys = getNumberOfKeys;
module.exports.isValidAdminPassword = isValidAdminPassword;
module.exports.assertValidAdminPassword = assertValidAdminPassword;
module.exports.compareAdminPassword = compareAdminPassword;
module.exports.setAdminPassword = setAdminPassword;
module.exports.getPollName = getPollName;
module.exports.setPollName = setPollName;
module.exports.getStatus = getStatus;
module.exports.setStatus = setStatus;
