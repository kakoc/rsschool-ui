import { TASKS } from '../constants';
import { ITaskModel } from '../models';
import { Action } from '../util';

export type TasksState = {
    courseRelated: ICourseRelatedTasks;
    isLoading: boolean;
};

interface ICourseRelatedTasks {
    [courseId: string]: ITaskModel[];
}

const initialState: TasksState = {
    courseRelated: {},
    isLoading: false,
};

export function tasksReducer(state = initialState, action: Action<any>): TasksState {
    switch (action.type) {
        case TASKS.FETCH_ALL_COURSE_RELATED: {
            return {
                ...state,
                isLoading: true,
            };
        }
        case TASKS.FETCH_ALL_COURSE_RELATED_OK: {
            return {
                ...state,
                isLoading: false,
                courseRelated: action.payload,
            };
        }
        case TASKS.FETCH_ALL_COURSE_RELATED_FAIL: {
            return {
                ...state,
                isLoading: false,
                courseRelated: action.payload,
            };
        }
    }
    return state;
}
