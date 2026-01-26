import React from "react";
import Course from "./Course";
import { useLoadUserQuery } from "@/features/api/authApi";

const MyLearning = () => {
  // const isLoading = false;
  // const myLearningCourses = [1,2];
  const {data, isLoading} = useLoadUserQuery();
  
  const myLearning = data?.user.enrolledCourses || [];
  return (
    <div className="max-w-4xl mx-auto my-10 px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6">MY LEARNING</h1>
      <div className="my-5">
        {isLoading ? (
          <MyLearningSkeleton />
        ) : myLearning.length === 0 ? (
          <p>You are not Enrolled in any Course.</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 my-5">
            {
                myLearning.map((course, index) => <Course key={index} course={course}/>)
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;

const MyLearningSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 my-5">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="w-full h-[280px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
        >
          {/* Image skeleton */}
          <div className="h-36 bg-gray-300 dark:bg-gray-600 rounded-t-lg" />

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded" />

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>

              <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// export default MyLearningSkeleton;
