import { TASKS } from 'core/constants';
import { getCoursesRelatedTasks } from 'core/api';

export function fetchTasksRelatedCourses() {
    return async (dispatch: any) => {
        dispatch({
            type: TASKS.FETCH_ALL_COURSE_RELATED,
        });
        try {
            const result = await getCoursesRelatedTasks();
            dispatch({
                type: TASKS.FETCH_ALL_COURSE_RELATED_OK,
                payload: result,
            });
        } catch (err) {
            dispatch({
                type: TASKS.FETCH_ALL_COURSE_RELATED_FAIL,
            });
        }
    };
}
