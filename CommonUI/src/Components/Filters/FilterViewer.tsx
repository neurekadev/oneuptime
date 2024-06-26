import React, { ReactElement, useEffect, useState } from 'react';
import Filter from './Types/Filter';
import GenericObject from 'Common/Types/GenericObject';
import FilterData from './Types/FilterData';
import FilterViewerItem from './FilterViewerItem';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Button, { ButtonStyleType } from '../Button/Button';
import Modal, { ModalWidth } from '../Modal/Modal';
import FiltersForm from './FiltersForm';
import IconProp from 'Common/Types/Icon/IconProp';
import { SizeProp } from '../Icon/Icon';
import Search from 'Common/Types/BaseDatabase/Search';
import OneUptimeDate from 'Common/Types/Date';
import InBetween from 'Common/Types/BaseDatabase/InBetween';
import FieldType from '../Types/FieldType';
import { DropdownOption } from '../Dropdown/Dropdown';

export interface ComponentProps<T extends GenericObject> {
    filters: Array<Filter<T>>;
    singularLabel?: string;
    pluralLabel?: string;
    id: string;
    showFilterModal: boolean;
    onFilterChanged?: undefined | ((filterData: FilterData<T>) => void);
    filterError?: string | undefined;
    onFilterModalClose: () => void;
    onFilterModalOpen: () => void;
    isModalLoading?: boolean;
    onFilterRefreshClick?: undefined | (() => void);
}

type FilterComponentFunction = <T extends GenericObject>(
    props: ComponentProps<T>
) => ReactElement;

const FilterComponent: FilterComponentFunction = <T extends GenericObject>(
    props: ComponentProps<T>
): ReactElement => {
    const [filterData, setFilterData] = useState<FilterData<T>>({});
    const [tempFilterDataForModal, setTempFilterDataForModal] = useState<
        FilterData<T>
    >({});

    type ChangeFilterDataFunction = (filterData: FilterData<T>) => void;

    const changeFilterData: ChangeFilterDataFunction = (
        filterData: FilterData<T>
    ) => {
        setFilterData(filterData);
        setTempFilterDataForModal(filterData);
        props.onFilterChanged?.(filterData);
    };

    useEffect(() => {
        if (props.showFilterModal) {
            setTempFilterDataForModal({ ...filterData });
        }
    }, [props.showFilterModal]);

    type TranslateFilterToTextFunction = <T extends GenericObject>(data: {
        filters: Array<Filter<T>>;
        filterData: FilterData<T>;
    }) => Array<ReactElement>;

    const translateFilterToText: TranslateFilterToTextFunction = <
        T extends GenericObject
    >(data: {
        filters: Array<Filter<T>>;
        filterData: FilterData<T>;
    }): Array<ReactElement> => {
        const filterTexts: Array<ReactElement | null> = [];

        for (const filter of data.filters) {
            filterTexts.push(
                translateFilterItemToText({
                    filter: filter,
                    filterData: data.filterData,
                })
            );
        }

        return filterTexts.filter((filterText: ReactElement | null) => {
            return filterText !== null;
        }) as Array<ReactElement>;
    };

    type TranslateFilterItemToTextFunction = <T extends GenericObject>(data: {
        filter: Filter<T>;
        filterData: FilterData<T>;
    }) => ReactElement | null;

    const translateFilterItemToText: TranslateFilterItemToTextFunction = <
        T extends GenericObject
    >(data: {
        filter: Filter<T>;
        filterData: FilterData<T>;
    }): ReactElement | null => {
        let filterText: ReactElement = <></>;

        if (!data.filter.key) {
            return null;
        }

        if (
            data.filterData[data.filter.key] === undefined ||
            data.filterData[data.filter.key] === null
        ) {
            return null;
        }

        if (data.filter.type === FieldType.Boolean) {
            filterText = (
                <div>
                    {' '}
                    <span className="font-medium">
                        {data.filter.title}
                    </span> is{' '}
                    <span className="font-medium">
                        {data.filterData[data.filter.key] ? 'Yes' : 'No'}
                    </span>{' '}
                </div>
            );
            return filterText;
        }

        if (
            data.filter.type === FieldType.Text ||
            data.filter.type === FieldType.Number ||
            data.filter.type === FieldType.Email ||
            data.filter.type === FieldType.Phone ||
            data.filter.type === FieldType.URL ||
            data.filter.type === FieldType.Hostname
        ) {
            const key: keyof T = data.filter.key;

            if (
                data.filterData[key] &&
                data.filterData[key] instanceof Search
            ) {
                filterText = (
                    <div>
                        {' '}
                        <span className="font-medium">
                            {data.filter.title}
                        </span>{' '}
                        contains{' '}
                        <span className="font-medium">
                            {data.filterData[data.filter.key]?.toString()}
                        </span>{' '}
                    </div>
                );
            } else if (data.filterData[key]) {
                filterText = (
                    <div>
                        {' '}
                        <span className="font-medium">
                            {data.filter.title}
                        </span>{' '}
                        is{' '}
                        <span className="font-medium">
                            {data.filterData[data.filter.key]?.toString()}
                        </span>{' '}
                    </div>
                );
            }
            return filterText;
        }

        if (
            data.filter.type === FieldType.Date ||
            data.filter.type === FieldType.DateTime
        ) {
            const key: keyof T = data.filter.key;

            const startAndEndDates: InBetween = data.filterData[
                key
            ] as InBetween;

            if (
                OneUptimeDate.getDateAsLocalFormattedString(
                    startAndEndDates.startValue as Date,
                    data.filter.type === FieldType.Date
                ) ===
                OneUptimeDate.getDateAsLocalFormattedString(
                    startAndEndDates.endValue as Date,
                    data.filter.type === FieldType.Date
                )
            ) {
                return (
                    <div>
                        {' '}
                        <span className="font-medium">
                            {data.filter.title}
                        </span>{' '}
                        at{' '}
                        <span className="font-medium">
                            {OneUptimeDate.getDateAsLocalFormattedString(
                                startAndEndDates.startValue as Date,
                                data.filter.type === FieldType.Date
                            )}
                        </span>{' '}
                    </div>
                );
            }
            return (
                <div>
                    {' '}
                    <span className="font-medium">{data.filter.title}</span> is
                    in between{' '}
                    <span className="font-medium">
                        {OneUptimeDate.getDateAsLocalFormattedString(
                            startAndEndDates.startValue as Date,
                            data.filter.type === FieldType.Date
                        )}
                    </span>{' '}
                    and{' '}
                    <span className="font-medium">
                        {OneUptimeDate.getDateAsLocalFormattedString(
                            startAndEndDates.endValue as Date,
                            data.filter.type === FieldType.Date
                        )}
                    </span>{' '}
                </div>
            );
        }

        if (
            data.filter.type === FieldType.Dropdown ||
            data.filter.type === FieldType.Entity ||
            data.filter.type === FieldType.EntityArray
        ) {
            const key: keyof T = data.filter.key;

            let items: Array<string> = data.filterData[key] as Array<string>;

            if (typeof items === 'string') {
                items = [items];
            }

            const isMoreItems: boolean = items.length > 1;

            if (items && items instanceof Array) {
                const entityNames: string = (items as Array<string>)
                    .map((item: string) => {
                        // item is the id of the entity. We need to find the name of the entity from the list of entities.

                        const entity: DropdownOption | undefined =
                            data.filter.filterDropdownOptions?.find(
                                (entity: DropdownOption | undefined) => {
                                    return (
                                        entity?.value.toString() ===
                                        item.toString()
                                    );
                                }
                            );

                        if (entity) {
                            return entity.label.toString();
                        }

                        return null;
                    })
                    .filter((item: string | null) => {
                        return item !== null;
                    })
                    .join(', ');

                return (
                    <div>
                        <span className="font-medium">{data.filter.title}</span>
                        {isMoreItems ? ' is any of these values: ' : ' is '}
                        <span className="font-medium">{entityNames}</span>
                    </div>
                );
            }

            return filterText;
        }

        return filterText;
    };

    const filterTexts: Array<ReactElement> = translateFilterToText({
        filters: props.filters,
        filterData: filterData,
    });

    if (props.filterError) {
        return <ErrorMessage error={props.filterError} />;
    }

    const showViewer: boolean = filterTexts.length > 0;

    return (
        <div>
            {showViewer && (
                <div>
                    <div className="mt-5 mb-5 bg-gray-50 rounded rounded-xl p-5 border border-2 border-gray-100">
                        <div className="flex w-full mb-3 -mt-1">
                            <div className="flex">
                                <div className="flex-auto py-0.5 text-sm leading-5 text-gray-500">
                                    <span className="font-semibold text-xs text-gray-400">
                                        FILTER{' '}
                                        {props.pluralLabel?.toUpperCase() +
                                            ' ' || ''}
                                        BY
                                    </span>{' '}
                                </div>
                            </div>
                        </div>
                        <ul role="list" className="space-y-3">
                            {filterTexts.map(
                                (filterText: ReactElement, index: number) => {
                                    const isLastItem: boolean =
                                        index === filterTexts.length - 1;
                                    return (
                                        <li
                                            className="relative flex gap-x-2"
                                            key={index}
                                        >
                                            {!isLastItem && (
                                                <div className="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
                                                    <div className="w-px bg-gray-200"></div>
                                                </div>
                                            )}
                                            <div className="relative flex h-6 w-6  flex-none items-center justify-center bg-gray-50">
                                                <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300"></div>
                                            </div>
                                            <FilterViewerItem
                                                key={index}
                                                text={filterText}
                                            />{' '}
                                        </li>
                                    );
                                }
                            )}
                        </ul>

                        <div className="flex -ml-3 mt-3 -mb-2">
                            {/** Edit Filter Button */}
                            <Button
                                className="font-medium text-gray-900"
                                icon={IconProp.Filter}
                                onClick={props.onFilterModalOpen}
                                title="Edit Filters"
                                iconSize={SizeProp.Smaller}
                                buttonStyle={ButtonStyleType.SECONDARY_LINK}
                            />

                            {/** Clear Filter Button */}
                            <Button
                                onClick={() => {
                                    changeFilterData({});
                                    props.onFilterModalClose();
                                }}
                                className="font-medium text-gray-900"
                                icon={IconProp.Close}
                                title="Clear Filters"
                                buttonStyle={ButtonStyleType.SECONDARY_LINK}
                            />
                        </div>
                    </div>
                </div>
            )}

            {props.showFilterModal && (
                <Modal
                    modalWidth={ModalWidth.Large}
                    isLoading={props.isModalLoading}
                    title={`${props.singularLabel + ' ' || ''}Filters`}
                    description={`Filter ${
                        props.pluralLabel || ''
                    } by the following criteria:`}
                    submitButtonText={`Apply Filters`}
                    onClose={() => {
                        props.onFilterModalClose();
                    }}
                    onSubmit={() => {
                        setFilterData({ ...tempFilterDataForModal });
                        setTempFilterDataForModal({});
                        if (props.onFilterChanged) {
                            props.onFilterChanged({
                                ...tempFilterDataForModal,
                            });
                        }
                        props.onFilterModalClose();
                    }}
                >
                    <FiltersForm
                        onFilterRefreshClick={props.onFilterRefreshClick}
                        filterData={tempFilterDataForModal}
                        filters={props.filters}
                        id={props.id + '-form'}
                        showFilter={true}
                        onFilterChanged={(filterData: FilterData<T>) => {
                            setTempFilterDataForModal(filterData);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
};

export default FilterComponent;
