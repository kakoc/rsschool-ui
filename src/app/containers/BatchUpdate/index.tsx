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
    // checkedColumns: Array<string>;
    // taskHeaders: Array<string>;
    selectedCourse: string;
    selectedTask: string;
}

const TaskUpdateTable = ({ taskHeaders, checkedColumns, handleCheckboxChange }: any) => {
    return (
        <ReactTable
            className="-highlight"
            style={{ cursor: 'pointer' }}
            columns={[
                { Header: '№', accessor: 'nRow', maxWidth: 50, style: { textAlign: 'center' } },
                { Header: 'Task columns', accessor: 'header', width: 400 },
                {
                    Header: 'No import columns',
                    accessor: 'checkbox',
                    minWidth: 200,
                    style: { textAlign: 'center' },
                },
            ]}
            data={taskHeaders.map((header: string, i: number) => {
                return {
                    nRow: i + 1,
                    header,
                    checkbox: (
                        <input
                            type="checkbox"
                            id={header}
                            checked={checkedColumns.includes(header)}
                            style={{ cursor: 'pointer' }}
                        />
                    ),
                };
            })}
            showPagination={false}
            defaultPageSize={taskHeaders.length}
            getTdProps={(_: any, rowInfo: any) => {
                return {
                    onClick: () => {
                        handleCheckboxChange(rowInfo.original.header);
                    },
                };
            }}
        />
    );
};

class BatchUpdate extends React.Component<any, State> {
    state: State = {
        files: [],
        taskHeaders: [],
        errors: [],
        checkedColumns: [],
        selectedCourse: '',
        selectedTask: '',
        isWorkWithTableDisabled: true,
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
                isTableParsed: false,
                taskHeaders: [],
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
        this.setState({ taskHeaders: res.data.data, isTableParsed: true });
    };

    getTaskColumnsForSaving = () => {
        return this.state.taskHeaders.filter((header: any) => !this.state.checkedColumns.includes(header));
    };

    prepareFormDataForSaving = () => {
        const headers = this.getTaskColumnsForSaving();
        const formData = new FormData();
        formData.set('table', this.state.files[0]);
        formData.set('headers', headers.join('<|>'));
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

    setIgnoredColumns = (column: any) => {
        if (!this.state.checkedColumns.includes(column)) {
            this.setState((prevState: any) => {
                return { checkedColumns: prevState.checkedColumns.concat(column) };
            });
        } else {
            this.setState((prevState: any) => {
                return { checkedColumns: prevState.checkedColumns.filter((item: any) => item !== column) };
            });
        }
    };

    checkMainInfoSelection = () => {
        if (this.state.selectedCourse && this.state.selectedTask) {
            this.setState({ isWorkWithTableDisabled: false });
        }
    };

    render() {
        return (
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col-md-3">
                        <Dropdown
                            defaultValue="Select Course"
                            onSelect={(course: any) =>
                                this.setState({ selectedCourse: course.id }, () => this.checkMainInfoSelection())
                            }
                            menuItems={this.props.courses.map((course: any) => ({
                                id: course._id,
                                value: course.name,
                            }))}
                        />
                    </div>
                    <div className="col-md-3">
                        <Dropdown
                            defaultValue="Select Task"
                            onSelect={(task: any) =>
                                this.setState({ selectedTask: task.id }, () => this.checkMainInfoSelection())
                            }
                            menuItems={this.props.tasks.map((task: any) => ({
                                id: task._id,
                                value: task.name,
                            }))}
                        />
                    </div>
                </div>
                <div className="row justify-content-md-center">
                    <Dropzone className={cn('dropzone-area')} onDrop={this.setTable} style={{ cursor: 'pointer' }}>
                        {this.state.files.length ? (
                            <p>{this.state.files[0].name}</p>
                        ) : (
                            <p>Try dropping some file here, or click to select file to upload.</p>
                        )}
                    </Dropzone>
                </div>
                <div className="row justify-content-md-center">
                    <div className={cn('control-buttons') + ' col-md-3'}>
                        <Button
                            disabled={this.state.isWorkWithTableDisabled || !this.state.files.length}
                            color="success"
                            className={cn('action-button')}
                            onClick={this.parseTable}
                        >
                            Parse table
                        </Button>
                    </div>
                    <div className={cn('control-buttons') + ' col-md-3'}>
                        <Button
                            disabled={this.state.isWorkWithTableDisabled || !this.state.isTableParsed}
                            color="success"
                            className={cn('action-button')}
                            onClick={this.saveTable}
                        >
                            Save table
                        </Button>
                    </div>
                </div>

                <div className={'row justify-content-lg-center'} style={{ marginTop: '20px' }}>
                    {!!this.state.errors.length ? (
                        <div className="row justify-content-md-center">
                            <Alert color="danger">
                                <ul className={cn('errors')}>
                                    {this.state.errors.map((error: any, i: number) => <li key={error + i}>{error}</li>)}
                                </ul>
                            </Alert>
                        </div>
                    ) : this.state.isTableSaved ? (
                        <Alert color="success">Table was successfully saved!</Alert>
                    ) : (
                        !!this.state.taskHeaders.length && (
                            <TaskUpdateTable
                                taskHeaders={this.state.taskHeaders}
                                checkedColumns={this.state.checkedColumns}
                                handleCheckboxChange={this.setIgnoredColumns}
                            />
                        )
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
