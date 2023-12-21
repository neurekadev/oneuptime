import {
    IsBillingEnabled,
    IsDevelopment,
} from 'CommonServer/EnvironmentConfig';
import RunCron from '../../Utils/Cron';
import { EVERY_DAY, EVERY_MINUTE } from 'Common/Utils/CronTime';
import LIMIT_MAX from 'Common/Types/Database/LimitMax';
import logger from 'CommonServer/Utils/Logger';
import Project from 'Model/Models/Project';
import ProjectService from 'CommonServer/Services/ProjectService';
import LogsDataIngestMeteredPlan from 'CommonServer/Types/Billing/MeteredPlan/LogsDataIngestMeteredPlan';
import Sleep from 'Common/Types/Sleep';

RunCron(
    'MeteredPlan:ReportTelemetryMeteredPlan',
    { schedule: IsDevelopment ? EVERY_MINUTE : EVERY_DAY, runOnStartup: false },
    async () => {
        if (!IsBillingEnabled) {
            logger.info(
                'MeteredPlan:ReportTelemetryMeteredPlan Billing is not enabled. Skipping job.'
            );
            return;
        }

        const projects: Array<Project> = await ProjectService.findBy({
            query: {
                
            },
            select: {
                _id: true,
            },
            skip: 0,
            limit: LIMIT_MAX,
            props: {
                isRoot: true,
            },
        });

        for (const project of projects) {
            if (project.id) {
                await LogsDataIngestMeteredPlan.reportQuantityToBillingProvider(project.id);
                await Sleep.sleep(1000);
            }
        }
    }
);


