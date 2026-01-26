import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import {
  deleteMediaFromCloudinary,
  deleteVideoFromCloudinary,
  uploadMedia,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "Course title and category is required",
      });
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });
    return res.status(201).json({
      course,
      message: "Course created",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to create course",
    });
  }
};


export const searchCourse = async (req,res) => {
    try {
        const {query = "", categories = [], sortByPrice =""} = req.query;
        console.log(categories);
        
        // create search query
        const searchCriteria = {
            isPublished:true,
            $or:[
                {courseTitle: {$regex:query, $options:"i"}},
                {subTitle: {$regex:query, $options:"i"}},
                {category: {$regex:query, $options:"i"}},
            ]
        }

        // if categories selected
        if(categories.length > 0) {
            searchCriteria.category = {$in: categories};
        }

        // define sorting order
        const sortOptions = {};
        if(sortByPrice === "low"){
            sortOptions.coursePrice = 1;//sort by price in ascending
        }else if(sortByPrice === "high"){
            sortOptions.coursePrice = -1; // descending
        }

        let courses = await Course.find(searchCriteria).populate({path:"creator", select:"name photoUrl"}).sort(sortOptions);

        return res.status(200).json({
            success:true,
            courses: courses || []
        });

    } catch (error) {
        console.log(error);
        
    }
}



export const getPublishedCourse = async (_, res) => {
  try {
    const courses = await Course.find({isPublished:true}).populate({path:"creator", select:"name photoURL"});
    if(!courses){
      return res.status(404).json({
        message:"Course not found"
      })
    }
    return res.status(200).json({
      courses,
    })
  } catch (error) {
     console.log(error);
    res.status(500).json({
      message: "Failed to get published courses",
    });
  }
}

export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      return res.status(404).json({
        courses: [],
        message: "Course not Found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to create course",
    });
  }
};

export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }

    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId); // delete old image
      }
      //upload a thumbnail on cloudinary
      courseThumbnail = await uploadMedia(thumbnail.path);
    }

    const updateData = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
      courseThumbnail: courseThumbnail?.secure_url,
    };
    course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });

    return res.status(200).json({
      course,
      message: "Course Updated Successfully.",
    });

    // } catch (error) {
    //   console.log(error);
    //   res.status(500).json({
    //     message: "Failed to create course",
    //   });
    // }
  } catch (error) {
    console.log("EDIT COURSE ERROR 👉", error);
    return res.status(500).json({
      message: error.message || "Failed to update course",
    });
  }
};

// export const getCourseById = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const course = await Course.findById(courseId);

//     if (!course) {
//       return res.status(404).json({
//         message: " Course not found!",
//       });
//     }
//     return res.status(200).json({
//       course
//     });
//   } catch (error) {
//      console.log(error);
//     return res.status(500).json({
//       message: error.message || "Failed to get course by id",
//     });
//   }
// };

// import mongoose from "mongoose"; // Add this if not present

// export const getCourseById = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
//       return res.status(400).json({
//         message: "Invalid course ID",
//       });
//     }
//     // Rest of the function remains the same
//   } catch (error) {
//     // ...
//      console.log(error);
//     return res.status(500).json({
//       message: error.message || "Failed to get course by id",
//     });
//   }
// };

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Failed to get course by id",
    });
  }
};

export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !courseId) {
      return res.status(400).json({
        message: "Lecture title is required",
      });
    }

    //create lecture
    // const lecture = await Lecture.create({lectureTitle});
    const lecture = await Lecture.create({
      lectureTitle,
      courseId,
    });

    const course = await Course.findById(courseId);

    if (course) {
      course.lectures.push(lecture._id);
      await course.save();
    }
    return res.status(201).json({
      lecture,
      message: "Lecture created Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Failed to get course by id",
    });
  }
};

// export const getCourseLecture = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const course = await Course.findById(courseId).populate("lectures");
//     if (!course) {
//       return res.status(400).json({
//         message: "Course not found",
//       });
//     }
//     return res.status(200).json({
//       lectures: course.lectures,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       message: "Failed to get lectures",
//     });
//   }
// };

export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId).populate("lectures");

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      lectures: course.lectures,
    });
  } catch (error) {
    console.log("GET LECTURE ERROR 👉", error);
    return res.status(500).json({
      message: "Failed to get lectures",
    });
  }
};

// export const editLecture = async (req, res) => {
//   try {
//     const { lectureTitle, videoInfo, isPreviewFree } = req.body;
//     const { courseId, lectureId } = req.params;
//     const lecture = await Lecture.findById(lectureId);
//     if (!lecture) {
//       return res.status(404).json({
//         message: "Lecture not found!",
//       });
//     }
//     //update lecture
//     if (lectureTitle) lecture.lectureTitle = lectureTitle;
//     if (videoInfo.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
//     if (videoInfo.publicId) lecture.publicId = videoInfo.publicId;
//     if (isPreviewFree) lecture.isPreviewFree = isPreviewFree;

//     await lecture.save();

//     //ensure the course still has the lecture id if it was not already added;
//     const course = await Course.findById(courseId);
//     if (course && !course.lectures.includes(lecture._id)) {
//       course.lectures.push(lecture._id);

//       await course.save();
//     }
//     return res.status(200).json({
//       lecture,
//       message: "Lecture updated Successfully",
//     });
//   } catch (error) {
//     console.log("GET LECTURE ERROR 👉", error);
//     return res.status(500).json({
//       message: "Failed to get lectures",
//     });
//   }
// };


//   export const editLecture = async (req, res) => {
//   try {
//     const { lectureTitle, videoInfo, isPreviewFree } = req.body;
//     const { courseId, lectureId } = req.params;

//     const lecture = await Lecture.findById(lectureId);
//     if (!lecture) {
//       return res.status(404).json({
//         message: "Lecture not found!",
//       });
//     }

//     // update title
//     if (lectureTitle) {
//       lecture.lectureTitle = lectureTitle;
//     }

//     // ✅ BOOLEAN SAFE CHECK (THIS WAS YOUR BUG)
//     if (typeof isPreviewFree === "boolean") {
//       lecture.isPreviewFree = isPreviewFree;
//     }

//     // ✅ VIDEO SAFE CHECK
//     if (videoInfo && videoInfo.VideoUrl && videoInfo.publicId) {
//       lecture.videoUrl = videoInfo.VideoUrl;
//       lecture.publicId = videoInfo.publicId;
//     }

//     await lecture.save();

//     // ensure lecture belongs to course
//     const course = await Course.findById(courseId);
//     if (course && !course.lectures.includes(lecture._id)) {
//       course.lectures.push(lecture._id);
//       await course.save();
//     }

//     return res.status(200).json({
//       lecture,
//       message: "Lecture updated successfully",
//     });
//   } catch (error) {
//     console.log("EDIT LECTURE ERROR 👉", error);
//     return res.status(500).json({
//       message: "Failed to update lecture",
//     });
//   }
// };


export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;
    const { courseId, lectureId } = req.params;

    // validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found!" });
    }

    // 🔥 ENSURE courseId IS ALWAYS PRESENT
    lecture.courseId = courseId;

    if (lectureTitle) {
      lecture.lectureTitle = lectureTitle;
    }

    if (typeof isPreviewFree === "boolean") {
      lecture.isPreviewFree = isPreviewFree;
    }

    if (videoInfo?.videoUrl && videoInfo?.publicId) {
      lecture.videoUrl = videoInfo.videoUrl;
      lecture.publicId = videoInfo.publicId;
    }

    await lecture.save(); // ✅ will not fail now

    // ensure lecture exists in course
    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    return res.status(200).json({
      lecture,
      message: "Lecture updated successfully",
    });
  } catch (error) {
    console.log("EDIT LECTURE ERROR 👉", error);
    return res.status(500).json({
      message: error.message || "Failed to edit lecture",
    });
  }
};




export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(200).json({
        message: "Lecture not found!",
      });
    }
    //delete the lecture from cloudinary as well
    if (lecture.publicId) {
      await deleteVideoFromCloudinary(lecture.publicId);
    }
    // remove the lecture refrence from the associated course
    await Course.updateOne(
      { lectures: lectureId }, //find the course that contains the lecture
      { $pull: { lectures: lectureId } } // remove the lecture id from the lectures array
    );

    return res.status(200).json({
      message: "Lecture removed Successfully",
    });
  } catch (error) {
    console.log("GET LECTURE ERROR 👉", error);
    return res.status(500).json({
      message: "Failed to get lectures",
    });
  }
};

export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }

    return res.status(200).json({
      lecture,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lecture by Id"
    });
  }
};


export const togglePublishCourse= async (req,res) => {
  try {
    const {courseId} = req.params;
    const {publish} = req.query; //true, false
    const course = await Course.findById(courseId);
     if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }
    //publish status based on query parameter
    course.isPublished = publish === "true";
    await course.save();

    const statusMessage = course.isPublished ? "Published" : "Unpublished"
    return res.status(200).json({
      message:`Course is ${statusMessage}`
    })

  } catch (error) {
     console.log(error);
    return res.status(500).json({
      message: "Failed to update status"
    });
  }
}

