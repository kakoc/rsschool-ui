import { compose } from 'redux';

export { checkFor, checkers } from './checkers';
// export { checkers, checkFor };

export function toVerifiableData(columns: any) {
    return Object.keys(columns).reduce((checkingData: any, column: any) => {
        return { ...checkingData, [columns[column].assignmentsField]: column };
    }, {});
}

export function isAllNeedData(data: any, needFields: any) {
    const fields = Object.keys(data).map((k: any) => data[k].assignmentsField);
    return needFields.filter((f: any) => !fields.includes(f)).length === 0;
}

function prepareCheckers(needData: any) {
    return (checkers: any) => {
        return checkers.map((checker: any) => checker(needData));
    };
}

export const prepareForChecking = compose(
    prepareCheckers,
    toVerifiableData,
);

// @ts-ignore
export async function checkTable([tableHeaders, ...taskResults]: any, checkers: any) {
    const errors = [];
    for (const checker of checkers) {
        errors.push(...(await checker(taskResults)));
    }

    return errors.filter((errType: string[]) => !!errType.length);
}
