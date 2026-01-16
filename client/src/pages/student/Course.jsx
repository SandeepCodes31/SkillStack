import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";



const Course = ({course}) => {
  return (
    <div>
      <Card className="overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-101 transition-all duration-300">
        <div className="relative">
          <img
            // src="https://img-c.udemycdn.com/course/750x422/3873464_403c_3.jpg"
            src={course.courseThumbnail}
            alt="course"
            className="w-full h-36 object-cover rounded-t-lg"
          />
        </div>
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
                  src={course.creator?.photoURL || "https://github.com/shadcn.png"}
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
  );
};



export default Course;
