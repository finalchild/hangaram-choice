'use strict';
const fs = require('fs');
const bcrypt = require('bcrypt');

const saltRounds = 10;
fs.writeFileSync('config.json', JSON.stringify({
    adminPassword: bcrypt.hashSync("hangaram", saltRounds)
}));
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

function compareAdminPassword(plaintextPassword, callback) {
    bcrypt.compare(plaintextPassword, config.adminPassword, callback)
}

module.exports.config = config;
module.exports.compareAdminPassword = compareAdminPassword;
