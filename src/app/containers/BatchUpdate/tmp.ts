export interface ITask {
    _id: string;
    name: string;
}

export enum AssignmentsType {
    studentId = 'studentId',
    mentorId = 'mentorId',
    score = 'score',
    mentorComment = 'mentorComment',
    checkDate = 'checkDate',
}

export const tasks: Array<ITask> = [
    { _id: '1', name: 'JSCore Interview' },
    { _id: '2', name: 'Task 2' },
    { _id: '3', name: 'Task 3' },
    { _id: '4', name: 'Task 4' },
];
