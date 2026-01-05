import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Course from "../student/Course";

const courses = [1, 2, 3, 4, 5, 6, 7, 8];

const Courses = () => {
  const isLoading = false;
  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <h2 className="text-2xl font-bold text-center mb-10 ">Our Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 ld:grid-cols-4 gap-6 justify-items-center overflow-hidden">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            : courses.map((course, index) => <Course key={index} />)}
        </div>
      </div>
    </div>
  );
};

export default Courses;

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
