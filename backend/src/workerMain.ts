import {setCache} from './candidateNamesCache';
import {app} from './app';

export default function workerMain(): void {
    process.on('message', (message, sendHandle) => {
        setCache(message);
    });

    app.listen(process.env.PORT || '80');
}
