import {setCache} from './candidateNamesCache';
import {app} from './app';

export default function workerMain(): void {
    process.on('message', msg => {
        setCache(msg);
    });

    app.listen(process.env.PORT || '80');
}
