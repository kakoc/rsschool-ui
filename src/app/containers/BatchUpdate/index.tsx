import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Alert } from 'reactstrap';
import Dropzone from 'react-dropzone';

import { RootState } from 'core/reducers';
import { fetchAllCourses, fetchTasksRelatedCourses } from 'core/actions';
import { classNames } from 'core/styles';
import { getCoursesNames } from 'core/selectors/courses';

import { prepareForChecking, baseCheckers, isAllNeedData, checkTable, requiredColumns } from 'core/validation';
import { makeAssignments, processTable } from 'core/helpers/batchUpdate';
import { readFile, checkExtension } from 'core/util';
import { updateAssignments } from 'core/api';

import { Dropdown } from 'components/Dropdown';
import { BatchUpdateTable } from 'components/Table';

import { ITaskModel, ICourse, AssignmentsType } from 'core/models';

const cn = classNames(require('./index.scss'));

const mapStateToProps = (state: RootState, props: any): any => {
    return {
        ...props,
        courses: getCoursesNames(state.courses.data),
        tasks: state.tasks.courseRelated,
    };
};

const mapDispatchToProps = (dispatch: any, props: any): any => {
    return {
        ...props,
        fetchCourses: () => {
            dispatch(fetchAllCourses());
        },
        fetchTasks: () => {
            dispatch(fetchTasksRelatedCourses());
        },
    };
};

interface ITableColumn {
    isIgnored?: boolean;
    tableColumn: string;
    assignmentsField: string;
}

interface ITableColumns {
    [key: string]: ITableColumn;
}

interface IState {
    files: any[];
    errors: string[];
    tableColumns: ITableColumns;
    selectedCourse: string;
    selectedTask: string;
    isTableParsed: boolean;
    isTableSaved: boolean;
    table: string[][];
}

class BatchUpdate extends React.Component<any, IState> {
    state: IState = {
        files: [],
        errors: [],
        tableColumns: {},
        selectedCourse: '',
        selectedTask: '',
        isTableParsed: false,
        isTableSaved: false,
        table: [],
    };

    componentDidMount() {
        this.props.fetchCourses();
        this.props.fetchTasks();
    }

    setTable = (files: any): void => {
        if (checkExtension(files[0].name, 'xlsx')) {
            readFile(files[0], (tableAsBytesString: string) =>
                this.setState({
                    table: processTable(tableAsBytesString),
                }),
            );

            this.setState({
                files,
                errors: [],
                tableColumns: {},
                isTableParsed: false,
                isTableSaved: false,
            });
        }
    };

    parseTable = () => {
        // @ts-ignore
        const [tableColumnsNames, ...usersResults] = this.state.table;
        this.setState(
            {
                /* it needs for reseting dropdowns in the table if we will work with many documents in one session */
                tableColumns: {},
            },
            () =>
                this.setState({
                    isTableParsed: true,
                    errors: [],
                    tableColumns: this.makeTableColumns(tableColumnsNames),
                    isTableSaved: false,
                }),
        );
    };

    /*
        we make from table columnsNames special columns
        which will be have additional info such as:
            relation between column and Assginments field
            whether colulmn will be soved or no
    */
    makeTableColumns = (columnsNames: any): ITableColumns => {
        return columnsNames.reduce(
            (tableColumns: any, column: any, i: number) => ({
                ...tableColumns,
                [i]: { tableColumn: column, isIgnored: false, assignmentsField: null },
            }),
            {},
        );
    };

    /*
        get columns which we will be save
        we just check column whether it ignored
        and return only columns which we need to save
    */
    getTableColumnsForSaving = (tableColumns: ITableColumns): ITableColumns => {
        return Object.keys(tableColumns).reduce((needColumns: any, column: any) => {
            if (!tableColumns[column].isIgnored) {
                const { isIgnored, ...rest } = tableColumns[column];
                return { ...needColumns, [column]: { ...rest } };
            }
            return { ...needColumns };
        }, {});
    };

    checkTableForCorrectness = async (tableColumns: ITableColumns, table: string[][]): Promise<boolean> => {
        const columns = this.getTableColumnsForSaving(tableColumns);
        const appliedCheckers = prepareForChecking(columns)(Object.values(baseCheckers));
        // @ts-ignore
        const [tableHeaders, ...taskResults] = table;

        const errors = await checkTable(taskResults, appliedCheckers);

        if (!!errors.length) {
            this.setState({ errors });
            return false;
        }

        return true;
    };

    saveTable = async (): Promise<any> => {
        if (
            (await this.checkTableForCorrectness(this.state.tableColumns, this.state.table)) &&
            isAllNeedData(this.state.tableColumns, requiredColumns)
        ) {
            // @ts-ignore
            const [tableHeaders, ...taskResults] = this.state.table;
            const needColumnsForSaving = this.getTableColumnsForSaving(this.state.tableColumns);
            const assignments = makeAssignments(
                taskResults,
                this.state.selectedCourse,
                this.state.selectedTask,
                needColumnsForSaving,
            );

            try {
                // @ts-ignore
                const response = await updateAssignments(assignments);

                this.setState({ isTableSaved: true, errors: [] });
            } catch (e) {
                this.setState({ errors: ['Something was wrong during saving on the server'] });
            }
        }
    };

    /*
        setup additional info about table column:
            what this column will be mean in Assignments model
            should we use particular column for saving or no
    */
    addColumnInfo = (index: number, field: string, value: string) => {
        this.setState({
            tableColumns: {
                ...this.state.tableColumns,
                [index]: { ...this.state.tableColumns[index], [field]: value },
            },
        });
    };

    /*
        check whether column has all need information
        which we will use for saving in Assignments
    */
    isColumnsFulfilled = (): boolean => {
        const columns = Object.keys(this.state.tableColumns);

        if (columns.length === 0) {
            return false;
        }

        for (const key of columns) {
            const field = this.state.tableColumns[key];
            if (!field.isIgnored && !field.assignmentsField) {
                return false;
            }
        }

        return true;
    };

    isCourseAndTaskSelected = (): boolean => {
        return !!(this.state.selectedCourse && this.state.selectedTask);
    };

    isReadyForParsing = (): boolean => {
        return this.isCourseAndTaskSelected() && !!this.state.files.length;
    };

    isReadyForSaving = (): boolean => {
        return this.isReadyForParsing() && this.isColumnsFulfilled();
    };

    isErrors = (): boolean => {
        return !!this.state.errors.length;
    };

    showStatus = () => {
        if (this.isErrors()) {
            return (
                <Alert color="danger">
                    <ul className={cn('errors')}>
                        {this.state.errors.map((error: string, i: number) => <li key={error + i}>{error}</li>)}
                    </ul>
                </Alert>
            );
        } else if (this.state.isTableSaved) {
            return <Alert color="success">Assignments were successfully updated!</Alert>;
        } else {
            return null;
        }
    };

    handleDropdownSelection = (type: string) => async ({ id }: any) => {
        this.setState({ [type]: id } as any);
    };

    getCourses() {
        const { courses } = this.props;

        return courses.map((course: ICourse) => ({
            id: course._id,
            value: course.name,
        }));
    }

    getCourseTasks() {
        const { tasks } = this.props;
        const { selectedCourse } = this.state;
        const courseTasks = tasks[selectedCourse] || [];

        return courseTasks.map((task: ITaskModel) => ({
            id: task._id,
            value: task.title,
        }));
    }

    render() {
        return (
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col-md-3">
                        <Dropdown
                            defaultValue="Select Course"
                            onSelect={this.handleDropdownSelection('selectedCourse')}
                            menuItems={this.getCourses()}
                        />
                    </div>
                    <div className="col-md-3">
                        <Dropdown
                            defaultValue="Select Task"
                            onSelect={this.handleDropdownSelection('selectedTask')}
                            menuItems={this.getCourseTasks()}
                        />
                    </div>
                </div>
                <div className="row justify-content-md-center">
                    <Dropzone
                        className={this.state.files.length ? cn('dropzone-area', 'black-area') : cn('dropzone-area')}
                        onDrop={this.setTable}
                        activeStyle={{ borderColor: 'black', color: 'black' }}
                    >
                        {!!this.state.files.length ? (
                            <p>{this.state.files[0].name}</p>
                        ) : (
                            <p>Try dropping some file here, or click to select file to upload.</p>
                        )}
                    </Dropzone>
                </div>
                <div className="row justify-content-md-center">
                    <div className={cn('control-buttons') + ' col-md-3'}>
                        <Button
                            disabled={!this.isReadyForParsing()}
                            color="success"
                            className={cn('action-button')}
                            onClick={this.parseTable}
                        >
                            Parse table
                        </Button>
                    </div>
                    <div className={cn('control-buttons') + ' col-md-3'}>
                        <Button
                            disabled={!this.isReadyForSaving()}
                            color="success"
                            className={cn('action-button')}
                            onClick={this.saveTable}
                        >
                            Save table
                        </Button>
                    </div>
                </div>

                <div className={cn('top-margin') + ' row justify-content-lg-center'}>{this.showStatus()}</div>
                <div className={cn('top-margin') + ' row justify-content-lg-center'}>
                    {this.state.isTableParsed && (
                        <BatchUpdateTable
                            rows={{ ...this.state.tableColumns, dropdown: Object.values(AssignmentsType) }}
                            handleClick={this.addColumnInfo}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(BatchUpdate);
