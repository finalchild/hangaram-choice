'use strict';
const fs = require('mz/fs');
const bcrypt = require('bcrypt');
const Promise = require('bluebird');

const saltRounds = 10;
fs.writeFileSync('config.json', JSON.stringify({
    adminPassword: bcrypt.hashSync("hangaram", saltRounds)
}));
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

function isValidAdminPassword(plaintextPassword) {
    return typeof plaintextPassword === 'string' && plaintextPassword.length <= 20;
}

function assertValidAdminPassword(plaintextPassword) {
    if (!isValidAdminPassword(plaintextPassword)) throw 'Invalid admin password!';
}

function compareAdminPassword(plaintextPassword) {
    return new Promise((resolve, reject) => {
        assertValidAdminPassword(plaintextPassword);
        resolve(plaintextPassword);
    }).then((result) => {
        return bcrypt.compare(result, config.adminPassword);
    });
}

function setAdminPassword(newPlaintextPassword) {
    return new Promise((resolve, reject) => {
        assertValidAdminPassword(newPlaintextPassword);
        resolve(newPlaintextPassword);
    }).then(result => {
        return bcrypt.hash(result, saltRounds)
    }).then(result => {
        config.adminPassword = result;
        return config;
    }).then(result => {
        return fs.writeFile('config.json', JSON.stringify(result));
    });
}

module.exports.saltRounds = saltRounds;
module.exports.config = config;
module.exports.isValidAdminPassword = isValidAdminPassword;
module.exports.assertValidAdminPassword = assertValidAdminPassword;
module.exports.compareAdminPassword = compareAdminPassword;
module.exports.setAdminPassword = setAdminPassword;
