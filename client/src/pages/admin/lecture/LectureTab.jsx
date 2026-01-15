import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  useEditLectureMutation,
  useGetCourseByIdQuery,
  useGetLectureByIdQuery,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const MEDIA_API = "http://localhost:8080/api/v1/media";

const LectureTab = () => {
  const [lectureTitle, setlectureTitle] = useState("");
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  // const [isFree, setIsFree] = useState(false);
  const [isFree, setIsFree] = useState(null);

  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const params = useParams();
  const { courseId, lectureId } = params;

  const {data:lectureData} = useGetLectureByIdQuery(lectureId);
  const lecture= lectureData?.lecture;

  // useEffect(()=>{
  //   if(lecture){
  //     setlectureTitle(lecture.lectureTitle);
  //     // setIsFree(lecture.isPreviewFree);
  //      setIsFree(lecture.isPreviewFree ?? false);
  //     setUploadVideoInfo(lecture.videoInfo)
  //   }
  // },[lecture])

  useEffect(() => {
  if (lecture) {
    setlectureTitle(lecture.lectureTitle);
    setIsFree(lecture.isPreviewFree ?? false);

    setUploadVideoInfo({
      videoUrl: lecture.videoUrl,
      publicId: lecture.publicId,
    });
  }
}, [lecture]);



  const [editLecture, { data, isLoading, isSuccess, error }] =
    useEditLectureMutation();

  const [
    removeLecture,
    { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess },
  ] = useRemoveLectureMutation();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        });

        if (res.data.success) {
          console.log(res);
          setUploadVideoInfo({
            videoUrl: res.data.data.url,
            publicId: res.data.data.public_id,
          });
          setBtnDisable(false);
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Video upload failed");
      } finally {
        setMediaProgress(false);
      }
    }
  };

  // const editLectureHandler = async () => {
  //   await editLecture({
  //     lectureTitle,
  //     videoInfo: uploadVideoInfo,
  //     isPreviewFree: isFree,
  //     courseId,
  //     lectureId,
  //   });
  // };

  const editLectureHandler = async () => {
    const payload = {
      lectureTitle,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    };

    // send video only if uploaded
    if (uploadVideoInfo) {
      payload.videoInfo = uploadVideoInfo;
    }

    await editLecture(payload);
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  };

  // useEffect(() => {
  //   if (isSuccess) {
  //     toast.success(data.message);
  //   }
  //   if (error) {
  //     toast.error(error.data.message);
  //   }
  // }, [isSuccess, error]);

  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  }, [isSuccess, error, data]);

  useEffect(() => {
    if (removeSuccess) {
      // toast.success(removeLecture.message);
      toast.success(removeData.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [removeSuccess, error]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={removeLoading}  variant="destructive" onClick={removeLectureHandler} >
            {removeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Remove Lecture"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            value={lectureTitle}
            onChange={(e) => setlectureTitle(e.target.value)}
            placeholder="Ex. Introduction to Javascript"
          />
        </div>
        <div className="my-5">
          <Label>
            Video<span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="video/*"
            onChange={fileChangeHandler}
            placeholder="Ex. Introduction to Javascript"
            className="w-fit"
          />
        </div>
        <div className="flex items-center space-x-2 my-5 ">
          {/* <Switch id="airplane-mode" /> */}
          <Switch
            id="airplane-mode"
            checked={Boolean(isFree)}
            onCheckedChange={setIsFree}
          />

          <Label htmlFor="airplane-mode">Is this video FREE?</Label>
        </div>
        {mediaProgress && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}
        <div className="mt-6">
          <Button disabled={isLoading} onClick={editLectureHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Update Lecture"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
