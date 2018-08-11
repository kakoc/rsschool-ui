import * as React from 'react';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, Table, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { RootState } from 'core/reducers';
import { fetchAllCourses } from 'core/actions';
import { classNames } from 'core/styles';
import { getCoursesNames } from 'core/selectors/courses';
import Dropzone from 'react-dropzone';
import axios from 'axios';
// import { library } from '@fortawesome/fontawesome-svg-core';

const cn = classNames(require('./index.scss'));

interface ITask {
    _id: string;
    name: string;
}

const tasks: Array<ITask> = [
    { _id: '1', name: 'Task 1' },
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
}

class BatchUpdate extends React.Component<any, State> {
    constructor(props: any) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            tasksDropdownOpen: false,
            coursesDropdownOpen: false,
            tasksValue: 'choose task',
            coursesValue: 'choose course',
            tasksId: '',
            coursesId: '',
            disabled: false,
            files: [],
            taskHeaders: [],
            errors: [],
            checkedColumns: [],
        };
    }

    componentDidMount() {
        this.props.fetchCourses();
        // this.props.fetchTasks();
    }

    onDrop = (files: any) => {
        this.setState({
            files,
            disabled: true,
        });
    };

    toggle(dropdownName: string) {
        this.setState({
            [dropdownName]: !this.state[dropdownName],
        });
    }

    select = (event: any, dropdownName: string, id: string) => {
        this.setState({
            [dropdownName + 'Value']: event.target.innerText,
            [dropdownName + 'Id']: id,
        });
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
        formData.set('coursesId', this.state.courseId);
        formData.set('tasksId', this.state.taskId);
        const res = await axios.patch('/api/batch-update/save-table', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // console.log(res);
        this.setState({ errors: res.data.data.errors });
    };

    handleCheckboxChange = (event: any) => {
        const column = event.target.id;

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

    getContent = () => {
        if (!this.state.errors.length) {
            return (
                <Table size="sm" striped={true}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Table column name</th>
                            <th>Check not to import column</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.taskHeaders.map((header: any, index: number) => (
                            <tr key={header}>
                                <td>{index + 1}</td>
                                <td>{header}</td>
                                <td>
                                    <input type="checkbox" name="" id={header} onChange={this.handleCheckboxChange} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            );
        } else {
            return (
                <Alert color="danger">
                    <ul>{this.state.errors.map((error: any, i: number) => <li key={error + i}>{error}</li>)}</ul>
                </Alert>
            );
        }
    };

    render() {
        return (
            <div className="container">
                <div className="row justify-content-md-center">
                    <Dropzone
                        className={
                            'col-sm-6 ' + (this.state.disabled ? cn('dropzone-area--disabled') : cn('dropzone-area'))
                        }
                        onDrop={this.onDrop}
                        disabled={this.state.disabled}
                    >
                        {this.state.disabled ? (
                            <p>{this.state.files[0].name}</p>
                        ) : (
                            <p>Try dropping some files here, or click to select files to upload.</p>
                        )}
                    </Dropzone>
                    <div className={cn('control-buttons') + ' col-sm-4'}>
                        <ButtonDropdown
                            isOpen={this.state.coursesDropdownOpen}
                            toggle={this.toggle.bind(this, 'coursesDropdownOpen')}
                        >
                            <DropdownToggle className={cn('action-button')} color="primary" caret={true}>
                                {this.state.coursesValue}
                            </DropdownToggle>
                            <DropdownMenu>
                                {this.props.courses.map((course: any) => {
                                    return (
                                        <DropdownItem
                                            key={course._id}
                                            onClick={(event: any) => this.select(event, 'courses', course._id)}
                                        >
                                            {course.name}
                                        </DropdownItem>
                                    );
                                })}
                            </DropdownMenu>
                        </ButtonDropdown>
                        <ButtonDropdown
                            isOpen={this.state.tasksDropdownOpen}
                            toggle={this.toggle.bind(this, 'tasksDropdownOpen')}
                        >
                            <DropdownToggle className={cn('action-button')} color="primary" caret={true}>
                                {this.state.tasksValue}
                            </DropdownToggle>
                            <DropdownMenu>
                                {this.props.tasks.map((task: any) => {
                                    return (
                                        <DropdownItem
                                            key={task._id}
                                            onClick={(event: any) => this.select(event, 'tasks', task._id)}
                                        >
                                            {task.name}
                                        </DropdownItem>
                                    );
                                })}
                            </DropdownMenu>
                        </ButtonDropdown>
                        <Button
                            color="success"
                            className={cn('action-button') + (this.state.files.length ? '' : ' disabled')}
                            onClick={this.parseTable}
                        >
                            Parse xlsx
                        </Button>
                        <Button color="success" className={cn('action-button')} onClick={this.saveTable}>
                            Save table
                        </Button>
                    </div>
                </div>
                <div className="row justify-content-md-center">{this.getContent()}</div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(BatchUpdate);
