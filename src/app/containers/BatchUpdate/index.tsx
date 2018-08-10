import * as React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { connect } from 'react-redux';
import { RootState } from 'core/reducers';
import { fetchAllCourses } from 'core/actions';
import { getCoursesNames } from 'core/selectors/courses';

// import { classNames } from 'core/styles';

// const cn = classNames(require('./index.scss'));

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
        };
    }

    componentDidMount() {
        this.props.fetchCourses();
        // this.props.fetchTasks();
    }

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

    render() {
        return (
            <div className="row">
                <div className="col-sm-6">
                    <Dropdown
                        isOpen={this.state.coursesDropdownOpen}
                        toggle={this.toggle.bind(this, 'coursesDropdownOpen')}
                    >
                        <DropdownToggle caret={true}>{this.state.coursesValue}</DropdownToggle>
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
                    </Dropdown>
                </div>
                <div className="col-sm-6">
                    <div className="col-sm-6">
                        <Dropdown
                            isOpen={this.state.tasksDropdownOpen}
                            toggle={this.toggle.bind(this, 'tasksDropdownOpen')}
                        >
                            <DropdownToggle caret={true}>{this.state.tasksValue}</DropdownToggle>
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
                        </Dropdown>
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
