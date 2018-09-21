import axios from 'axios';

export function getCoursesRelatedTasks() {
    return axios.get(`/api/tasks/coursesRelated`).then(response => response.data.data);
}
