import { Roles } from 'core/models/user';
import axios from 'axios';

export function saveBatchUpdateTable(data: any) {
    return axios
        .patch(`/api/batchUpdate/saveTable`, { data: { assignments: data } })
        .then(response => response.data.data);
}

export function matchUsers(role: Roles) {
    return (ids: string[]) =>
        axios.post(`/api/user/match`, { data: { role, forChecking: ids } }).then(response => response.data.data);
}
