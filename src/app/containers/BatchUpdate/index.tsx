import * as React from 'react';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
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
            disabled: false,
            files: [],
            taskHeaders: [],
            errors: [],
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

    select = (event: any, dropdownName: string) => {
        this.setState({
            [dropdownName]: event.target.innerText,
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
        const formData = new FormData();
        formData.set('table', this.state.files[0]);
        const res = await axios.patch('/api/batch-update/save-table', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // console.log(res);
        this.setState({ errors: res.data.data.errors });
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
                                            onClick={(event: any) => this.select(event, 'coursesValue')}
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
                                            onClick={(event: any) => this.select(event, 'tasksValue')}
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
                        <ul>{this.state.taskHeaders.map((header: any) => <li key={header}>{header}</li>)}</ul>
                        <Button color="success" className={cn('action-button')} onClick={this.saveTable}>
                            Save table
                        </Button>
                        <ul>{this.state.errors.map((error: any, i: number) => <li key={error + i}>{error}</li>)}</ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(BatchUpdate);
