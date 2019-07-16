import * as fs from 'fs';

import {setCache} from './candidateNamesCache';
import {app} from './app';

export default function workerMain(): void {
    process.on('message', (message, sendHandle) => {
        setCache(message);
    });

    const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

    app.listen(config.port);
}
