import axios from 'axios';
import { IAssignment } from 'core/models';

export function updateAssignments(
    forSave: IAssignment | IAssignment[],
    queryFields = ['courseId', 'taskId', 'studentId'],
) {
    return axios.patch(`/api/assignment`, { data: { forSave, queryFields } }).then(response => response.data.data);
}
