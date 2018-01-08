import {setCache} from './candidateNamesCache';

export default function workerMain(): void {
    process.on('message', msg => {
        setCache(msg);
    });

    const app = require('./app').default;
    app.listen(process.env.PORT || '3000');
}
