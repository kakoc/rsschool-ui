import { AnyAction } from 'redux';

import { SCHEDULE } from './constants';
import { IEventDocument, IStageDocument } from './models';

interface ILoadingAction {
    type: SCHEDULE.LOADING;
}

interface IFetchCourseEventsAndStagesOkAction {
    type: SCHEDULE.FETCH_COURSE_EVENTS_AND_STAGES_OK;
    payload: {
        events: IEventDocument[];
        stages: IStageDocument[];
    };
}

interface IFailAction {
    type: SCHEDULE.FAIL;
    payload: Error;
}

interface IAddCourseStageOkAction {
    type: SCHEDULE.ADD_COURSE_STAGE_OK;
    payload: IStageDocument;
}

interface IUpdateCourseStageOkAction {
    type: SCHEDULE.UPDATE_COURSE_STAGE_OK;
    payload: IStageDocument;
}

interface IDeleteCourseStageOkAction {
    type: SCHEDULE.DELETE_COURSE_STAGE_OK;
    payload: string;
}

interface IAddCourseEventOkAction {
    type: SCHEDULE.ADD_COURSE_EVENT_OK;
    payload: IEventDocument;
}

interface IUpdateCourseEventOkAction {
    type: SCHEDULE.UPDATE_COURSE_EVENT_OK;
    payload: IEventDocument;
}

interface IDeleteCourseEventOkAction {
    type: SCHEDULE.DELETE_COURSE_EVENT_OK;
    payload: string;
}

export type IScheduleAction =
    | ILoadingAction
    | IFailAction
    | IFetchCourseEventsAndStagesOkAction
    | IAddCourseStageOkAction
    | IUpdateCourseStageOkAction
    | IDeleteCourseStageOkAction
    | IAddCourseEventOkAction
    | IUpdateCourseEventOkAction
    | IDeleteCourseEventOkAction;

export interface Action<T> extends AnyAction {
    type: string;
    payload?: T;
}

export function getNotPresented(where: any[], who: any[]) {
    return who.filter((v: any) => !where.includes(v));
}

export function readFile(file: any, readingFinished: any) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
        const bytes = new Uint8Array(e.target.result);
        const length = bytes.byteLength;

        let binary = '';
        for (let i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        readingFinished(binary);
    };

    // reader.onabort = () => {};
    // reader.onerror = () => {};
    reader.readAsArrayBuffer(file);
}

export function checkExtension(fileName: string, extension: string): boolean {
    const regExp = new RegExp(`\.${extension}$`);

    return regExp.test(fileName);
}

export function isPromise(maybePromise: any) {
    return maybePromise instanceof Promise;
}

export function handleIfPromise(maybePromise: any, action: any) {
    if (isPromise(maybePromise)) {
        return maybePromise.then((data: any) => action(data));
    } else {
        return action(maybePromise);
    }
}

export function clearFromDuplications(data: any[]) {
    return Array.from(new Set(data));
}
