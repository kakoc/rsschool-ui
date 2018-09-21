import { compose } from 'redux';
import * as xlsx from 'xlsx';
import { DateTime } from 'luxon';

import { AssignmentsType } from 'core/models';
import { tableDateFormat } from 'core/constants/batchUpdate';

export function tableToJSON(tableAsBinary: any, listN: number = 0): string[][] {
    const table: xlsx.WorkBook = xlsx.read(tableAsBinary, { type: 'binary', cellDates: true });
    const name: string = table.SheetNames[listN];

    return xlsx.utils.sheet_to_json(table.Sheets[name], { header: 1, defval: 'n/a' });
}

export const processTable = compose(
    (table: string[][]) => table.map(row => row.map(column => column.trim())),
    tableToJSON,
);

export function getMentorCommentsColumns(needColumns: any): any {
    return Object.keys(needColumns).reduce(
        (mentorCommentsColumns: any, column: any) => {
            if (needColumns[column].assignmentsField !== AssignmentsType.mentorComment) {
                const { [column]: _, ...rest } = mentorCommentsColumns;
                return { ...rest };
            }
            return mentorCommentsColumns;
        },
        { ...needColumns },
    );
}

export function mergeMentorComments(taskResult: string[], mentorComments: any): string {
    return Object.keys(mentorComments).reduce((mergedMentorComments: string, column: any): string => {
        const commentValue = taskResult[column] ? taskResult[column].trim() : 'Empty field';
        const comment = `### ${mentorComments[column].tableColumn}\n${commentValue}\n\n`;

        return mergedMentorComments + comment;
    }, '');
}

function setField(field: any, value: any) {
    switch (field) {
        case AssignmentsType.studentId:
        case AssignmentsType.mentorId: {
            return { [field]: value };
        }
        case AssignmentsType.checkDate: {
            const parsedDate = DateTime.fromFormatExplain(value, tableDateFormat) as any;
            const { year, month, day, hour, minute, second } = parsedDate.result;

            return { [field]: DateTime.local(year, month, day, hour, minute, second).valueOf() };
        }
        case AssignmentsType.mentorComment: {
            return { [field]: true };
        }
        case AssignmentsType.score: {
            return { [field]: parseInt(value, 10) };
        }
    }
}

export function makeAssignment(courseId: string, taskId: string, taskResult: Array<string>, needColumns: any): any {
    const entry = Object.keys(needColumns).reduce(
        (assignment: any, column: any) => ({
            ...assignment,
            ...setField(needColumns[column].assignmentsField, taskResult[column].trim()),
        }),
        { courseId, taskId },
    );
    if (entry[AssignmentsType.mentorComment]) {
        entry[AssignmentsType.mentorComment] = mergeMentorComments(taskResult, getMentorCommentsColumns(needColumns));
    }
    return entry;
}

export function makeAssignments(results: any, courseId: string, taskId: string, needColumns: any): any {
    return results.map((result: any): any => makeAssignment(courseId, taskId, result, needColumns));
}
