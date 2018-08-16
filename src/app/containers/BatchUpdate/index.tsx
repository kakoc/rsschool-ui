import * as React from 'react';
import { Button, Alert } from 'reactstrap';
import ReactTable from 'react-table';
import { connect } from 'react-redux';
import { RootState } from 'core/reducers';
import { fetchAllCourses } from 'core/actions';
import { classNames } from 'core/styles';
import { getCoursesNames } from 'core/selectors/courses';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { Dropdown } from '../../components/Dropdown';
// import { library } from '@fortawesome/fontawesome-svg-core';

const cn = classNames(require('./index.scss'));

interface ITask {
    _id: string;
    name: string;
}

const tasks: Array<ITask> = [
    { _id: '1', name: 'JSCore Interview' },
    { _id: '2', name: 'Task 2' },
    { _id: '3', name: 'Task 3' },
    { _id: '4', name: 'Task 4' },
];

const columns = ['studentId', 'mentorId', 'score', 'checkDate', 'mentorComment'];

const mapStateToProps = (state: RootState, props: any): any => {
    return {
        ...props,
        courses: getCoursesNames(state.courses.data),
        tasks: tasks,
    };
};

const mapDispatchToProps = (dispatch: any, props: any): any => {
    return {
        ...props,
        fetchCourses: () => {
            dispatch(fetchAllCourses());
        },
    };
};

interface State {
    [key: string]: any;
    // selectedCourse: string;
    // selectedTask: string;
}

const TaskUpdateTable = ({ rows, handleClick }: any) => {
    const cellStyle = { textAlign: 'center', alignSelf: 'center' };
    return (
        <ReactTable
            className="-highlight"
            style={{ cursor: 'pointer', alignItems: 'center' }}
            columns={[
                {
                    Header: '№',
                    accessor: 'nRow',
                    maxWidth: 50,
                    style: cellStyle,
                },
                { Header: 'Task columns', accessor: 'header', width: 400, style: { alignSelf: cellStyle.alignSelf } },
                {
                    Header: 'No import columns',
                    accessor: 'checkbox',
                    minWidth: 200,
                    style: cellStyle,
                },
                { Header: 'Select field', accessor: 'dropdown', style: cellStyle, minWidth: 300 },
            ]}
            data={Object.keys(rows).map((row: any, i: number) => {
                return {
                    nRow: i + 1,
                    header: rows[row].tableColumn,
                    checkbox: (
                        <input
                            type="checkbox"
                            id={rows[row].tableColumn}
                            checked={rows[row].isIgnored}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleClick(row, 'isIgnored', !rows[row].isIgnored)}
                        />
                    ),
                    dropdown: (
                        <Dropdown
                            defaultValue="Select field"
                            onSelect={(field: any) => handleClick(row, 'assignmentsField', field.value)}
                            menuItems={columns.map((column: any) => ({
                                id: column,
                                value: column,
                            }))}
                        />
                    ),
                };
            })}
            showPagination={false}
            defaultPageSize={Object.keys(rows).length}
            // TODO: check for correctness
            getTdProps={(_: any, rowInfo: any, cell: any) => {
                return {
                    onClick: () => {
                        const { Header } = cell;
                        if (!(Header === 'Select field')) {
                            const row = rowInfo.original;
                            handleClick(row.nRow - 1, 'isIgnored', !row.checkbox.props.checked);
                        }
                    },
                };
            }}
        />
    );
};

class BatchUpdate extends React.Component<any, State> {
    state: State = {
        files: [],
        errors: [],
        tableColumns: {},
        selectedCourse: '',
        selectedTask: '',
        isTableParsed: false,
        isTableSaved: false,
    };

    componentDidMount() {
        this.props.fetchCourses();
        // this.props.fetchTasks();
    }

    setTable = (files: any) => {
        if (/\.xlsx$/.test(files[0].name)) {
            this.setState({
                files,
                errors: [],
                tableColumns: {},
                isTableParsed: false,
                isTableSaved: false,
            });
        }
    };

    parseTable = async () => {
        const formData = new FormData();
        formData.set('table', this.state.files[0]);
        const res = await axios.post('/api/batch-update/parse-table', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        this.setState({
            isTableParsed: true,
            errors: [],
            tableColumns: res.data.data.reduce(
                (acc: any, el: any, i: any) => ({
                    ...acc,
                    [i]: { tableColumn: el, isIgnored: false, assignmentsField: null },
                }),
                {},
            ),
            isTableSaved: false,
        });
    };

    getTaskColumnsForSaving = () => {
        const { tableColumns } = this.state;
        const columns = Object.keys(tableColumns);
        return columns.reduce(
            (needColumns: any, column: any) =>
                !this.state.tableColumns[column].isIgnored
                    ? {
                          ...needColumns,
                          [tableColumns[column].tableColumn]: tableColumns[column].assignmentsField,
                      }
                    : { ...needColumns },
            {},
        );
    };

    prepareFormDataForSaving = () => {
        const headers = this.getTaskColumnsForSaving();
        // console.log(JSON.stringify(headers));
        const formData = new FormData();
        formData.set('table', this.state.files[0]);
        formData.set('headers', JSON.stringify(headers));
        formData.set('courseId', this.state.selectedCourse);
        formData.set('taskId', this.state.selectedTask);

        return formData;
    };

    saveTable = async () => {
        const formData = this.prepareFormDataForSaving();

        const res = await axios.patch('/api/batch-update/save-table', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // console.log(res);
        if (res.data.data.errors) {
            this.setState({ errors: res.data.data.errors });
        } else {
            this.setState({ isTableSaved: true });
        }
    };

    addColumnInfo = (index: any, field: any, value: any) => {
        this.setState({
            tableColumns: {
                ...this.state.tableColumns,
                [index]: { ...this.state.tableColumns[index], [field]: value },
            },
        });
    };
    checkColumnsFulfilling = () => {
        for (const key of Object.keys(this.state.tableColumns)) {
            const field = this.state.tableColumns[key];
            if (!field.isIgnored && !field.assignmentsField) {
                return false;
            }
        }
        return true;
    };

    checkMainInfoSelection = () => {
        return this.state.selectedCourse && this.state.selectedTask;
    };

    isReadyForParsing = () => {
        return this.checkMainInfoSelection() && !!this.state.files.length;
    };

    isReadyForSaving = () => {
        return (
            this.isReadyForParsing() && !!Object.keys(this.state.tableColumns).length && this.checkColumnsFulfilling()
        );
    };

    isErrors = () => {
        return !!this.state.errors.length;
    };

    showOperationsResult = () => {
        if (this.isErrors()) {
            return (
                <Alert color="danger">
                    <ul className={cn('errors')}>
                        {this.state.errors.map((error: any, i: number) => <li key={error + i}>{error}</li>)}
                    </ul>
                </Alert>
            );
        } else if (this.state.isTableSaved) {
            return <Alert color="success">Table was successfully saved!</Alert>;
        } else {
            return null;
        }
    };

    render() {
        return (
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col-md-3">
                        <Dropdown
                            defaultValue="Select Course"
                            onSelect={(course: any) => this.setState({ selectedCourse: course.id })}
                            menuItems={this.props.courses.map((course: any) => ({
                                id: course._id,
                                value: course.name,
                            }))}
                        />
                    </div>
                    <div className="col-md-3">
                        <Dropdown
                            defaultValue="Select Task"
                            onSelect={(task: any) => this.setState({ selectedTask: task.id })}
                            menuItems={this.props.tasks.map((task: any) => ({
                                id: task._id,
                                value: task.name,
                            }))}
                        />
                    </div>
                </div>
                <div className="row justify-content-md-center">
                    <Dropzone
                        className={cn('dropzone-area')}
                        onDrop={this.setTable}
                        activeStyle={{ borderColor: 'black', color: 'black' }}
                        style={this.state.files.length ? { borderColor: 'black', color: 'black' } : {}}
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

                <div className={'row justify-content-lg-center'} style={{ marginTop: '20px' }}>
                    {this.showOperationsResult()}
                </div>
                <div className={'row justify-content-lg-center'} style={{ marginTop: '20px' }}>
                    {this.state.isTableParsed && (
                        <TaskUpdateTable rows={this.state.tableColumns} handleClick={this.addColumnInfo} />
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
