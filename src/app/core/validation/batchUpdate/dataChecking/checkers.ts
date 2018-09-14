import { compose } from 'redux';
import { clearFromDuplications } from 'core/util';

const floatCheck = (checkedData: string) => !Number.isInteger(parseFloat(checkedData));

export const checkers = {
    floating: (forCheck: any, columnN: any, rowOwnerColumn: any) =>
        forCheck.filter((row: any) => floatCheck(row[columnN])).map((row: any) => row[rowOwnerColumn]),

    duplication: (forCheck: any, columnN: any) =>
        clearFromDuplications(
            forCheck
                .map((row: any) => row[columnN])
                .filter(
                    (value: any, _: any, arr: any) => arr.indexOf(value) !== arr.lastIndexOf(value) && arr.length !== 1,
                ),
        ),

    existence: (fetchData: any) => async (forCheck: any, columnN: any) => {
        const wanted = forCheck.map((row: any) => row[columnN]);
        const found = await fetchData(wanted);
        return wanted.filter((value: any) => !found.includes(value));
    },
};

export function checkFor(retrieveNeedInfo: any, checker: any, makeErrors: any) {
    return (dataInfo: any) =>
        compose(
            makeErrors,
            (data: any) => checker(data, ...retrieveNeedInfo(dataInfo)),
        );
}
