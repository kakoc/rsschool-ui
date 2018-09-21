import { handleIfPromise } from '../util';

export function makeErrorsList(makeErrorMsg: (invalidValue: string) => string) {
    return (invalidData: any) => {
        return handleIfPromise(invalidData, (invalidData: any) =>
            invalidData.reduce(
                (errors: string[], invalidValue: string) => errors.concat(makeErrorMsg(invalidValue)),
                [] as string[],
            ),
        );
    };
}

export function messageMaker(role: any = '', msg: any) {
    return (id: any) => `${role} ${id} ${msg}`;
}
