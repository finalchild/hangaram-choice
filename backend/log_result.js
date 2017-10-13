'use strict';
const Promise = require('bluebird');
const fs = require('ws/fs');

function getNamesOfLogs() {
    return fs.readdir('./previous_results').then((files) => {
        return files.filter(file => file.endsWith('.json'));
    });
}

function getLog(name) {
    return fs.readFile('./previous_results/' + name + '.json', 'utf8').then((data) => {
        return JSON.parse(data);
    });
}

function saveLog(name, log) {
    return fs.writeFile('./previous_results/' + name + '.json', JSON.stringify(log));
}

module.exports.getNamesOfLogs = getNamesOfLogs;
module.exports.getLog = getLog;
module.exports.saveLog = saveLog;
