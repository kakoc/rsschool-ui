import { ICourse } from '../models';

const getCoursesNames = (courses: Array<ICourse>) => {
    return courses.map((course: ICourse) => ({
        _id: course._id,
        name: course.name,
    }));
};

export { getCoursesNames };
