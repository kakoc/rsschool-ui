import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { toVerifiableData, checkTable, baseCheckers } from '../';
import { AssignmentsType } from 'core/stubs/batchUpdate';

const mock = new MockAdapter(axios, { delayResponse: 100 });

const usersIds = ['1', '2', '3', '4', '5'];
const taskResults = [['1'], ['2'], ['3'], ['4'], ['5']];

const columns = {
    0: { assignmentsField: AssignmentsType.studentId },
    1: { assignmentsField: AssignmentsType.mentorId },
    2: { assignmentsField: AssignmentsType.score },
};

const cellPositions = toVerifiableData(columns);

describe('check table users for existence', () => {
    describe('check student for existence', () => {
        it('should return empty array of errors when check', async () => {
            mock.onPost('/api/user/match', { data: { role: 'student', forChecking: usersIds } }).reply(200, {
                data: usersIds,
            });

            const errors = await baseCheckers.studentExistence({ studentId: 0 })(taskResults);

            expect(errors).toHaveLength(0);
        });
        it('should return correctness count of errors', async () => {
            mock.onPost('/api/user/match', { data: { role: 'student', forChecking: usersIds } }).reply(200, {
                data: usersIds.slice(1),
            });

            const errors = await baseCheckers.studentExistence({
                studentId: 0,
            })(taskResults);

            expect(errors).toHaveLength(1);
            expect(errors[0]).toEqual('student 1 does not exist');
        });
        it('should return correctness count of errors', async () => {
            mock.onPost('/api/user/match', { data: { role: 'student', forChecking: usersIds } }).reply(200, {
                data: usersIds.slice(2),
            });

            const errors = await baseCheckers.studentExistence({
                studentId: 0,
            })(taskResults);

            expect(errors).toHaveLength(2);
            expect(errors[0]).toEqual('student 1 does not exist');
            expect(errors[1]).toEqual('student 2 does not exist');
        });
    });
    describe('check mentor for existence', () => {
        it('should return empty array of errors when check', async () => {
            mock.onPost('/api/user/match', { data: { role: 'mentor', forChecking: usersIds } }).reply(200, {
                data: usersIds,
            });

            const errors = await baseCheckers.mentorExistence({
                mentorId: 0,
            })(taskResults);

            expect(errors).toHaveLength(0);
        });
        it('should return correctness count of errors', async () => {
            mock.onPost('/api/user/match', { data: { role: 'mentor', forChecking: usersIds } }).reply(200, {
                data: usersIds.slice(1),
            });

            const errors = await baseCheckers.mentorExistence({
                mentorId: 0,
            })(taskResults);

            expect(errors).toHaveLength(1);
            expect(errors[0]).toEqual('mentor 1 does not exist');
        });
        it('should return correctness count of errors', async () => {
            mock.onPost('/api/user/match', { data: { role: 'mentor', forChecking: usersIds } }).reply(200, {
                data: usersIds.slice(2),
            });

            const errors = await baseCheckers.mentorExistence({
                mentorId: 0,
            })(taskResults);

            expect(errors).toHaveLength(2);
            expect(errors[0]).toEqual('mentor 1 does not exist');
            expect(errors[1]).toEqual('mentor 2 does not exist');
        });
    });
});

describe('check for duplications', () => {
    it('checks for students duplications', () => {
        const table1 = [['ted70'], ['ted70']];
        const errors1 = baseCheckers.studentDuplication(cellPositions)(table1);

        expect(errors1).toHaveLength(1);
        expect(errors1[0]).toEqual('student ted70 is duplicated');

        const table2 = [['ted70'], ['ted70'], ['ted70'], ['kakoc'], ['kakoc']];
        const errors2 = baseCheckers.studentDuplication(cellPositions)(table2);
        expect(errors2).toHaveLength(2);
        expect(errors2[0]).toEqual('student ted70 is duplicated');
        expect(errors2[1]).toEqual('student kakoc is duplicated');
    });
});

describe('search for different errors in a table', () => {
    it('checks for all errors using complex checker', async () => {
        const table = [
            ['studentId', 'mentorId', 'score'],
            ['ted70', 'eddie79', '228'],
            ['notStudent', 'notMentor', '1.111'],
            ['ted70', 'eddie79', '228'],
            ['notStudent2', 'notMentor2', '228'],
        ];
        mock.onPost('/api/user/match', {
            data: {
                role: 'student',
                forChecking: ['ted70', 'notStudent', 'ted70', 'notStudent2'],
            },
        }).reply(200, {
            data: ['ted70'],
        });
        mock.onPost('/api/user/match', {
            data: {
                role: 'mentor',
                forChecking: ['eddie79', 'notMentor', 'eddie79', 'notMentor2'],
            },
        }).reply(200, {
            data: ['eddie79'],
        });
        // [student, mentor, score]

        const errors = await checkTable(table, Object.values(baseCheckers).map((fn: any) => fn(cellPositions)));

        expect(errors).toHaveLength(7);
    });
});

it('checks for floating score', () => {
    const table = [['student', 'mentor', '5'], ['student', 'mentor', '5.5']];
    const errors = baseCheckers.floatingScore(cellPositions)(table);

    expect(errors).toHaveLength(1);
});
