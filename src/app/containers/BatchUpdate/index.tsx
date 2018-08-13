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
        savedStatus: '',
        selectedCourse: '',
        selectedTask: '',
    };

    componentDidMount() {
        this.props.fetchCourses();
        // this.props.fetchTasks();
    }

    onDrop = (files: any) => {
        if (/\.xlsx$/.test(files[0].name)) {
            this.setState({
                files,
                errors: [],
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
        this.setState({ taskHeaders: res.data.data });
    };

    saveTable = async () => {
        const headers = this.state.taskHeaders.filter((header: any) => !this.state.checkedColumns.includes(header));
        const formData = new FormData();
        formData.set('table', this.state.files[0]);
        formData.set('headers', headers.join('<|>'));
        formData.set('courseId', this.state.selectedCourse);
        formData.set('taskId', this.state.selectedTask);
        const res = await axios.patch('/api/batch-update/save-table', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // console.log(res);
        if (res.data.data.errors) {
            this.setState({ errors: res.data.data.errors });
        } else {
            this.setState({ savedStatus: res.data.data });
        }
    };

    handleCheckboxChange = (column: any) => {
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

    render() {
        return (
            <div className="container">
                <div className="row justify-content-md-center">
                    <Dropzone className={'col-sm-6 ' + cn('dropzone-area')} onDrop={this.onDrop}>
                        {this.state.files.length ? (
                            <p>{this.state.files[0].name}</p>
                        ) : (
                            <p>Try dropping some files here, or click to select files to upload.</p>
                        )}
                    </Dropzone>
                    <div className={cn('control-buttons') + ' col-sm-4'}>
                        <Dropdown
                            defaultValue="Select Course"
                            onSelect={(course: any) => this.setState({ selectedCourse: course.id })}
                            menuItems={this.props.courses.map((course: any) => ({
                                id: course._id,
                                value: course.name,
                            }))}
                        />
                        <Dropdown
                            defaultValue="Select Task"
                            onSelect={(task: any) => this.setState({ selectedTask: task.id })}
                            menuItems={this.props.tasks.map((task: any) => ({
                                id: task._id,
                                value: task.name,
                            }))}
                        />
                        <Button color="success" className={cn('action-button')} onClick={this.parseTable}>
                            Parse xlsx
                        </Button>
                        <Button color="success" className={cn('action-button')} onClick={this.saveTable}>
                            Save table
                        </Button>
                    </div>
                </div>
                <div className="row justify-content-lg-center">
                    {!!this.state.errors.length ? (
                        <Alert color="danger">
                            <ul>
                                {this.state.errors.map((error: any, i: number) => <li key={error + i}>{error}</li>)}
                            </ul>
                        </Alert>
                    ) : (
                        !!this.state.taskHeaders.length && (
                            <TaskUpdateTable
                                taskHeaders={this.state.taskHeaders}
                                checkedColumns={this.state.checkedColumns}
                                handleCheckboxChange={this.handleCheckboxChange}
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
