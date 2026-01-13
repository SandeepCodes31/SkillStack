import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Lecture from "./Lecture";

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  //   const params = useParams();
  //   const {courseId} = params.courseId;
  // const { courseId } = useParams();
//   const { courseId } = useParams();
// if (!courseId) {
//   return <div>Error: Invalid course ID. Please navigate from the course edit page.</div>;
// }

// const { courseId } = useParams();

// if (!courseId) {
//   return <div>Error: Invalid course ID...</div>;
// }

// const {
//   data: lectureData,
//   isLoading: lectureLoading,
//   isError: lectureError,
// } = useGetCourseLectureQuery(courseId);
const { courseId } = useParams();

const {
  data: lectureData,
  isLoading: lectureLoading,
  isError: lectureError,
  refetch
} = useGetCourseLectureQuery(courseId, {
  skip: !courseId, // 🔥 THIS STOPS /undefined/lecture
});

if (!courseId) {
  return (
    <div className="p-6 text-red-600">
      Error: Invalid course ID. Please navigate from the course edit page.
    </div>
  );
}



  //   const isLoading = false;
  const navigate = useNavigate();

  const [createLecture, { data, isLoading, isSuccess, error }] =
    useCreateLectureMutation();

// this is important line 


  // const {
  //   data: lectureData,
  //   isLoading: lectureLoading,
  //   isError: lectureError,
  // } = useGetCourseLectureQuery(courseId );

  const createLectureHandler = async () => {
    await createLecture({ lectureTitle, courseId });
  };

  //   useEffect(() => {
  //     if (isSuccess) {
  //       toast.success(data.message);
  //     }
  //     if (error) {
  //       toast.error(error.data.message);
  //     }
  //   }, [isSuccess, error]);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data?.message);
    }
    if (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  }, [isSuccess, error, data]);

  // console.log(lectureData);
  useEffect(() => {
    if (lectureData) {
      console.log("Lecture Data:", lectureData);
    }
  }, [lectureData]);

  return (
    <div className="flex-1 mx-10">
      {/* // <div className="mx-10"> */}

      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Lets add lectures, add some basic details for your new lectures{" "}
        </h1>
        <p className="text-sm ">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas,
          exercitationem?
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-4">
          <Label>Title</Label>
          <Input
            type="text"
            name="courseTitle"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="Your Title Name"
          />
        </div>

        <div className="flex items-center gap-2 ">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/course/${courseId}`)}
          >
            Back to course
          </Button>
          <Button disabled={isLoading} onClick={createLectureHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please Wait
              </>
            ) : (
              "Create Lecture"
            )}
          </Button>
        </div>
        {/* <div className="mt-10">
          {isLoading ? (
            <p>Loading Lecture...</p>
          ) : lectureError ? (
            <p>Failed to Load lectures...</p>
          ) : lectureData.lectures.length === 0 ? (
            <p>No Lectures Available</p>
          ) : (
            lectureData.lectures.map((lecture, index) =>(
            <Lecture key={lectureData._id} lecture={lecture} courseId={courseId} index={index} />
            ))
          )}
        </div> */}
        <div className="mt-10">
          {lectureLoading ? (
            <p>Loading lectures...</p>
          ) : lectureError ? (
            <p>Failed to load lectures...</p>
          ) : !lectureData?.lectures || lectureData.lectures.length === 0 ? (
            <p>No Lectures Available</p>
          ) : (
            lectureData.lectures.map((lecture, index) => (
              <Lecture
                key={lecture._id || index}
                lecture={lecture}
                courseId={courseId}
                index={index}
              />
            ))
          )}
          {/* {lectureLoading ? (
            <p>Loading lectures...</p>
          ) : lectureError ? (
            <p className="text-red-500">
              {lectureErrorDetails?.data?.message || "Failed to load lectures"}
            </p>
          ) : lectureData.length === 0 ? (
            <p>No Lectures Available</p>
          ) : (
            lectureData.map((lecture, index) => (
              <Lecture
                key={lecture._id}
                lecture={lecture}
                courseId={courseId}
                index={index}
              />
            ))
          )} */}
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
