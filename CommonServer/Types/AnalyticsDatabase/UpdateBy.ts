import AnalyticsBaseModel from 'Common/AnalyticsModels/BaseModel';
import DatabaseCommonInteractionProps from 'Common/Types/BaseDatabase/DatabaseCommonInteractionProps';
import Query from './Query';

export default interface UpdateBy<TBaseModel extends AnalyticsBaseModel> {
    data: TBaseModel;
    query: Query<TBaseModel>;
    props: DatabaseCommonInteractionProps;
}
