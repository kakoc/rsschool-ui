import { compose } from 'redux';
import { clearFromDuplications } from 'core/util';

const floatCheck = (checkedData: string) => !Number.isInteger(parseFloat(checkedData));

export const checkers = {
    floating: (forCheck: string[][], columnN: number, rowOwnerColumn: number) =>
        forCheck.filter((row: string[]) => floatCheck(row[columnN])).map((row: string[]) => row[rowOwnerColumn]),

    duplication: (forCheck: string[][], columnN: number) =>
        clearFromDuplications(
            forCheck
                .map((row: string[]) => row[columnN])
                .filter((value, _, arr) => arr.indexOf(value) !== arr.lastIndexOf(value) && arr.length !== 1),
        ),

    existence: (fetchData: any) => async (forCheck: string[][], columnN: number) => {
        const wanted = forCheck.map(row => row[columnN]);
        const found = await fetchData(wanted);
        return wanted.filter(value => !found.includes(value));
    },
};

export function checkFor(retrieveNeedInfo: any, checker: any, makeErrors: any) {
    return (dataInfo: any) =>
        compose(
            makeErrors,
            (data: string[][]) => checker(data, ...retrieveNeedInfo(dataInfo)),
        );
}
