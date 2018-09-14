import { Roles } from 'core/models/user';
import { AssignmentsType } from 'core/stubs/batchUpdate';
import { checkers, prepareForChecking, isAllNeedData, checkTable, toVerifiableData, checkFor } from './dataChecking';
import { matchUsers } from 'core/api';
import { makeErrorsList } from '../utils';

const messageMaker = (role: any = '', msg: any) => (id: any) => `${role} ${id} ${msg}`;

const dataRetriever = (...what: any[]) => (data: any) =>
    what.reduce((needRetrievedData: any[], needValue: any) => needRetrievedData.concat(data[needValue]), []);

const baseDataRetrievers = {
    existence: dataRetriever,
    duplications: dataRetriever,
    floating: dataRetriever,
};

export const baseCheckers = {
    studentDuplication: checkFor(
        baseDataRetrievers.duplications(AssignmentsType.studentId),
        checkers.duplication,
        makeErrorsList(messageMaker(Roles.student, 'is duplicated')),
    ),
    mentorDuplication: checkFor(
        baseDataRetrievers.duplications(AssignmentsType.mentorId),
        checkers.duplication,
        makeErrorsList(messageMaker(Roles.mentor, 'is duplicated')),
    ),
    studentExistence: checkFor(
        baseDataRetrievers.existence(AssignmentsType.studentId),
        checkers.existence(matchUsers(Roles.student)),
        makeErrorsList(messageMaker(Roles.student, 'does not exist')),
    ),
    mentorExistence: checkFor(
        baseDataRetrievers.existence(AssignmentsType.mentorId),
        checkers.existence(matchUsers(Roles.mentor)),
        makeErrorsList(messageMaker(Roles.mentor, 'does not exist')),
    ),
    floatingScore: checkFor(
        baseDataRetrievers.floating(AssignmentsType.score, AssignmentsType.studentId),
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
