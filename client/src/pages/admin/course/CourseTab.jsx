import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useEditCourseMutation,
  useGetCourseByIdQuery,
} from "@/features/api/courseApi";
import { toast } from "sonner";

const CourseTab = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
  });
  const params = useParams();
  const courseId = params.courseId;
  // const { data: courseByIdData, isLoading: courseByIdLoading } =
  //   useGetCourseByIdQuery(courseId);
  // const { data: courseByIdData, isLoading: courseByIdLoading } = useGetCourseByIdQuery(courseId);
  const { data: courseByIdData, isLoading: courseByIdLoading } =
    useGetCourseByIdQuery(courseId, { skip: !courseId });

  // useEffect(() => {
  //   if (courseByIdData?.course) {
  //     const course = courseByIdData?.course;
  //     setInput({
  //       courseTitle: course.courseTitle,
  //       subTitle: course.subTitle,
  //       description: course.description,
  //       category: course.category,
  //       courseLevel: course.courseLevel,
  //       coursePrice: course.coursePrice,
  //       courseThumbnail: course.courseThumbnail,
  //     });
  //   }
  // }, [courseByIdData]);

  useEffect(() => {
  if (courseByIdData?.course) {
    const course = courseByIdData.course;

    setInput({
      courseTitle: course.courseTitle || "",
      subTitle: course.subTitle || "",
      description: course.description || "",
      category: course.category || "",
      courseLevel: course.courseLevel || "",
      coursePrice: course.coursePrice || "",
      courseThumbnail: course.courseThumbnail || "",
    });

+   setpreviewThumbnail(course.courseThumbnail || "");
  }
}, [courseByIdData]);


  const [previewThumbnail, setpreviewThumbnail] = useState("");
  const [imageError, setImageError] = useState("");

  const [editCourse, { data, isLoading, isSuccess, error }] =
    useEditCourseMutation();

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value) => {
    setInput({ ...input, category: value });
  };

  const selectCourseLevel = (value) => {
    setInput({ ...input, courseLevel: value });
  };

  //get file
  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ❌ reject large image
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10 MB");

      setImageError("Image too large");
      setInput((prev) => ({ ...prev, courseThumbnail: "" }));
      setpreviewThumbnail("");

      e.target.value = null; // reset file input
      return;
    }

    // ✅ valid image
    setImageError("");
    setInput((prev) => ({ ...prev, courseThumbnail: file }));

    const reader = new FileReader();
    reader.onloadend = () => setpreviewThumbnail(reader.result);
    reader.readAsDataURL(file);
  };

  //   const updateCourseHandler = async () => {
  //     const formData = new FormData();
  //     formData.append("courseTitle", input.courseTitle);
  //     formData.append("subTitle", input.subTitle);
  //     formData.append("description", input.description);
  //     formData.append("category", input.category);
  //     formData.append("courseLevel", input.courseLevel);
  //     formData.append("coursePrice", input.coursePrice);
  //     // formData.append("courseThumbnail", input.courseThumbnail);
  //     if (input.courseThumbnail) {
  //   formData.append("courseThumbnail", input.courseThumbnail);
  // }
  //     await editCourse({formData, courseId});
  //   };

  
  const updateCourseHandler = async () => {
    try {
      const formData = new FormData();
      formData.append("courseTitle", input.courseTitle);
      formData.append("subTitle", input.subTitle);
      formData.append("description", input.description);
      formData.append("category", input.category);
      formData.append("courseLevel", input.courseLevel);
      formData.append("coursePrice", input.coursePrice);

      if (input.courseThumbnail) {
        formData.append("courseThumbnail", input.courseThumbnail);
      }

      const res = await editCourse({ formData, courseId }).unwrap();
      console.log("UPDATE SUCCESS:", res);
    } catch (err) {
      console.error("UPDATE FAILED:", err);
    }
  };

  // useEffect(() => {
  //   if(isSuccess){
  //     toast.success(data.message || "Course Update");

  //   }
  //   if(error){
  //     toast.error(error.data.message || "Failed to Update course");
  //   }
  // },[isSuccess, error])

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course Updated Successfully");
    }

    if (error) {
      toast.error(
        error?.data?.message || error?.error || "Failed to update course"
      );
    }
  }, [isSuccess, error, data]);

  // if (courseByIdLoading) return <h1>Loading...</h1>;
  if (!courseId) return <h1>Course ID not found</h1>;

  const isPublished = true;
  // const isLoading = false;
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between ">
        <div>
          <CardTitle>Basic Course Information</CardTitle>
          <CardDescription>
            Make changes to your courses here. Click Save when you're done
          </CardDescription>
        </div>
        <div className="space-x-2">
          <Button variant="outline">
            {isPublished ? "Unpublished" : "Publish"}
          </Button>
          <Button>Remove Course</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-5">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              type="text"
              name="courseTitle"
              value={input.courseTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Fullstack Developer"
            ></Input>
          </div>
          <div className="space-y-2">
            <Label>Sub Title</Label>
            <Input
              type="text"
              name="subTitle"
              value={input.subTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Become a Fullstack Developer in 2 months from Zero to Hero"
            ></Input>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor input={input} setInput={setInput} />
          </div>
          <div className="flex items-center gap-6">
            <div className="space-y-2">
              <Label>Category</Label>
              {/* <Select onValueChange={selectCategory}> */}
              <Select value={input.category} onValueChange={selectCategory}>
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
            <div className="space-y-2">
              <Label>Course Level</Label>
              {/* <Select onValueChange={selectCourseLevel}> */}
              <Select
                value={input.courseLevel}
                onValueChange={selectCourseLevel}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select a Course</SelectLabel>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Advance">Advance</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price in INR</Label>
              <Input
                type="number"
                name="coursePrice"
                value={input.coursePrice}
                onChange={changeEventHandler}
                placeholder="199"
                className="w-fit"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Course Thumbnail</Label>
            <Input
              type="file"
              onChange={selectThumbnail}
              accept="image/*"
              className="w-fit"
            />
            {previewThumbnail && (
              <img
                src={previewThumbnail}
                className="w-64 my-2"
                alt="courseThumbnail"
              />
            )}
          </div>
          <div className="space-y-2 flex gap-5">
            <Button onClick={() => navigate("/admin/course")} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={isLoading || !!imageError}
              onClick={updateCourseHandler}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;
