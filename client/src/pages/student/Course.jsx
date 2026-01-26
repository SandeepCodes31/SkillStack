import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Link } from "react-router-dom";

const Course = ({ course }) => {
  return (
    <Link to={`/course-detail/${course._id}`}>
      <div>
        {/* <Card className="overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-101 transition-all duration-300"> */}
        <Card className="h-[325px] flex flex-col overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
          {/* <div className="relative">
            <img
              // src="https://img-c.udemycdn.com/course/750x422/3873464_403c_3.jpg"
              src={course.courseThumbnail}
              alt="course"
              className="w-full h-36 object-cover rounded-t-lg"
            />
          </div> */}
          <div className="w-full aspect-[16/9] overflow-hidden">
            <img
              src={course.courseThumbnail}
              alt="course"
              className="w-full h-full object-cover"
            />
          </div>

          {/* <div className="relative bg-gray-100 dark:bg-gray-700 h-40 flex items-center justify-center">
  <img
    src={course.courseThumbnail}
    alt="course"
    className="max-h-full max-w-full object-contain"
  />
</div> */}

          <CardContent className="mt-2 py-3 ">
            {/* <h1 className="hover:underline font-bold text-lg mb-2 truncate"> */}
            <h1 className="font-bold text-lg mb-2 line-clamp-2 hover:underline">
              {/* Complete Next JS in Hindi  */}
              {course.courseTitle}
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={
                      course.creator?.photoURL ||
                      "https://github.com/shadcn.png"
                    }
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <h1 className="font-medium text-sm">{course.creator?.name}</h1>
              </div>
              <Badge
                className={
                  "bg-blue-600 text-white px-2 py-1 text-xs rounded-full"
                }
              >
                {/* Advance */}
                {course.courseLevel}
              </Badge>
            </div>
            <div className="text-lg font-bold">
              <span>₹ {course.coursePrice}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
};

export default Course;
