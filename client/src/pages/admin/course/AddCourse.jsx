import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { toast } from "sonner";

const AddCourse = () => {
  const [courseTitle, setcourseTitle] = useState("");
  const [category, setCategory] = useState("");

  const [createCourse, {data, isLoading, error, isSuccess}] = useCreateCourseMutation();
  const navigate = useNavigate();


  const getSelectedCategory = (value) => {
    setCategory(value);
  };

  const createCourseHandler = async () => {
    await createCourse({courseTitle, category});
  };

  //for displaying toast
  // useEffect(() => {
  //     if(isSuccess){
  //       toast.success(data?.message || "Course Created");
  //     }
  //     if (error) {
  //   toast.error(error?.data?.message || "Something went wrong");
  //   console.error("API Error:", error);
  // }
  // },[isSuccess, error]);

  useEffect(() => {
  if (isSuccess && data) {
    toast.success(data.message || "Course Created");
    navigate("/admin/course"); // optional redirect
  }

  if (error) {
    toast.error(error?.data?.message || "Something went wrong");
    console.error("API Error:", error);
  }
}, [isSuccess, data, error, navigate]);


  return (
    <div className="flex-1 mx-10">
      {/* // <div className="mx-10"> */}

      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Lets add course, add some basic course details for your new course{" "}
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
            value={courseTitle}
            onChange={(e) => setcourseTitle(e.target.value)}
            placeholder="Your Course Name"
          />
        </div>
        <div className="space-y-4">
          <Label>Category</Label>
          <Select onValueChange={getSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select a Category</SelectLabel>
                <SelectItem value="Next JS">Next JS</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Frontend Development">
                  Frontend Development
                </SelectItem>
                <SelectItem value="Full Stack Development">
                  Full Stack Development
                </SelectItem>
                <SelectItem value="MERN Stack Development">
                  MERN Stack Development
                </SelectItem>
                <SelectItem value="Javascript">Javascript</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Docker">Docker</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
                <SelectItem value="HTML">HTML</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 ">
          <Button variant="outline" onClick={() => navigate("/admin/course")}>
            Back
          </Button>
          <Button disabled={isLoading} onClick={createCourseHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please Wait
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
