import 'ejs';
import logger from 'CommonServer/Utils/Logger';
import App from 'CommonServer/Utils/StartServer';
import Register from './Services/Register';
import { PromiseVoidFunction } from 'Common/Types/FunctionTypes';
import './Jobs/Alive';
import FetchListAndProbe from './Jobs/Monitor/FetchList';
import { PROBE_MONITORING_WORKERS } from './Config';
import Sleep from 'Common/Types/Sleep';

const APP_NAME: string = 'probe';

const init: PromiseVoidFunction = async (): Promise<void> => {
    try {
        // init the app
        await App.init({
            appName: APP_NAME,
            port: undefined,
            isFrontendApp: false,
            statusOptions: {
                liveCheck: async () => {},
                readyCheck: async () => {},
            },
        });

        // add default routes
        await App.addDefaultRoutes();

        try {
            // Register this probe.
            await Register.registerProbe();

            logger.info('Probe registered');

            await Register.reportIfOffline();
        } catch (err) {
            logger.error('Register probe failed');
            logger.error(err);
            throw err;
        }

        try {
            let workers: number = 0;

            while (workers < PROBE_MONITORING_WORKERS) {
                workers++;

                const currentWorker: number = workers;

                logger.info(`Starting worker ${currentWorker}`);

                new FetchListAndProbe('Worker ' + currentWorker)
                    .run()
                    .catch((err: any) => {
                        logger.error(`Worker ${currentWorker} failed: `);
                        logger.error(err);
                    });

                await Sleep.sleep(1000);
            }
        } catch (err) {
            logger.error('Starting workers failed');
            logger.error(err);
        }
    } catch (err) {
        logger.error('App Init Failed:');
        logger.error(err);
        throw err;
    }
};

init().catch((err: Error) => {
    logger.error(err);
    logger.info('Exiting node process');
    process.exit(1);
});
