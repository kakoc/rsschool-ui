import { Roles } from 'core/models/user';
import { AssignmentsType } from 'core/models';
import { checkers, prepareForChecking, isAllNeedData, checkTable, toVerifiableData, checkFor } from './dataChecking';
import { matchUsers } from 'core/api';
import { makeErrorsList, messageMaker } from '../utils';

const dataRetriever = (...what: any[]) => (data: any) => what.map((needValue: any) => data[needValue]);

export const baseCheckers = {
    studentDuplication: checkFor(
        dataRetriever(AssignmentsType.studentId),
        checkers.duplication,
        makeErrorsList(messageMaker(Roles.student, 'is duplicated')),
    ),
    studentExistence: checkFor(
        dataRetriever(AssignmentsType.studentId),
        checkers.existence(matchUsers(Roles.student)),
        makeErrorsList(messageMaker(Roles.student, 'does not exist')),
    ),
    mentorExistence: checkFor(
        dataRetriever(AssignmentsType.mentorId),
        checkers.existence(matchUsers(Roles.mentor)),
        makeErrorsList(messageMaker(Roles.mentor, 'does not exist')),
    ),
    floatingScore: checkFor(
        dataRetriever(AssignmentsType.score, AssignmentsType.studentId),
        checkers.floating,
        makeErrorsList(messageMaker(Roles.student, 'has floating score')),
    ),
};

export const requiredColumns = [
    AssignmentsType.checkDate,
    AssignmentsType.studentId,
    AssignmentsType.mentorId,
    AssignmentsType.score,
];

export { prepareForChecking, isAllNeedData, checkTable, checkers, toVerifiableData, checkFor };
