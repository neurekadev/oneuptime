import React, {
    Fragment,
    FunctionComponent,
    ReactElement,
    useState,
} from 'react';
import PageComponentProps from '../../PageComponentProps';
import Navigation from 'CommonUI/src/Utils/Navigation';
import ObjectID from 'Common/Types/ObjectID';
import Monitor from 'Model/Models/Monitor';
import useAsyncEffect from 'use-async-effect';
import ModelAPI from 'CommonUI/src/Utils/ModelAPI/ModelAPI';
import API from 'CommonUI/src/Utils/API/API';
import DisabledWarning from '../../../Components/Monitor/DisabledWarning';
import MonitorType from 'Common/Types/Monitor/MonitorType';
import IncomingMonitorLink from '../../../Components/Monitor/IncomingRequestMonitor/IncomingMonitorLink';
import { PromiseVoidFunction } from 'Common/Types/FunctionTypes';
import ServerMonitorDocumentation from '../../../Components/Monitor/ServerMonitor/Documentation';
import ErrorMessage from 'CommonUI/src/Components/ErrorMessage/ErrorMessage';
import PageLoader from 'CommonUI/src/Components/Loader/PageLoader';

const MonitorDocumentation: FunctionComponent<PageComponentProps> = (
    _props: PageComponentProps
): ReactElement => {
    const modelId: ObjectID = Navigation.getLastParamAsObjectID(1);

    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [monitorType, setMonitorType] = useState<MonitorType | undefined>(
        undefined
    );

    const [monitor, setMonitor] = useState<Monitor | null>(null);

    useAsyncEffect(async () => {
        await fetchItem();
    }, []);

    const fetchItem: PromiseVoidFunction = async (): Promise<void> => {
        setIsLoading(true);
        setError('');

        try {
            const item: Monitor | null = await ModelAPI.getItem({
                modelType: Monitor,
                id: modelId,
                select: {
                    monitorType: true,
                    incomingRequestSecretKey: true,
                    serverMonitorSecretKey: true,
                },
            });

            setMonitor(item);

            if (!item) {
                setError(`Monitor not found`);

                return;
            }

            setMonitorType(item.monitorType);
        } catch (err) {
            setError(API.getFriendlyMessage(err));
        }

        setIsLoading(false);
    };

    if (error) {
        return <ErrorMessage error={error} />;
    }

    if (isLoading) {
        return <PageLoader isVisible={true} />;
    }

    return (
        <Fragment>
            <DisabledWarning monitorId={modelId} />

            {/* Heartbeat URL */}
            {monitorType === MonitorType.IncomingRequest &&
            monitor?.incomingRequestSecretKey ? (
                <IncomingMonitorLink
                    secretKey={monitor?.incomingRequestSecretKey}
                />
            ) : (
                <></>
            )}

            {monitorType === MonitorType.Server &&
            monitor?.serverMonitorSecretKey ? (
                <ServerMonitorDocumentation
                    secretKey={monitor?.serverMonitorSecretKey}
                />
            ) : (
                <></>
            )}
        </Fragment>
    );
};

export default MonitorDocumentation;
