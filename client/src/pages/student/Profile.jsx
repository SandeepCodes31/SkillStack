import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Courses from "./Courses";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";



const Profile = () => {
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };
  // const isLoading = true;
  const { data, isLoading, refetch } = useLoadUserQuery();
  console.log(data);
  const [
    updateUser,
    {
      data: updateUserData,
      isLoading: updateUserIsLoading,
      isError,
      error,
      isSuccess,
    },
  ] = useUpdateUserMutation();

  const enrolledCourses = [1, 2];

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("profilePhoto", profilePhoto);
    console.log("Updating profile with photo:", profilePhoto);
    await updateUser(formData);
    
  };

  useEffect(()=> {
    refetch();
  },[]);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data.message || "Profile updated Successfully");
    }
    if (isError) {
      toast.error(error.message || "Profile updation Failed");
    }
  }, [error, data, isSuccess, isError]);



  if (isLoading) return <h1>Profile Loading...</h1>;

  if (!data) return <h1>Error loading profile</h1>;

    const { user }  = data ;

  return (
    <div className="max max-w-4xl mx-auto px-4 my-24">
      <h1 className="font-bold text-2xl text-center md:text-left">
        My Profile
      </h1>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
            <AvatarImage
              src={user?.photoURL || "https://github.com/shadcn.png"}
              alt="@shadcn"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              Name:{" "}
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2 ">
                {user.name}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              Email:{" "}
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2 ">
                {user.email}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              Role:{" "}
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2 ">
                {user.role.toUpperCase()}
              </span>
            </h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-2 ">
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Name:</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="col-span-3"
                  ></Input>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Profile Photo</Label>
                  <Input
                    onChange={onChangeHandler}
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button disabled={updateUserIsLoading} onClick={updateUserHandler}>
                  {updateUserIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                      Please Wait
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div>
        <h1 className="font-medium text-lg ">Courses you are Enrolled in</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-5 ">
          {user.enrolledCourses.length === 0 ? (
            <h1>You haven't Enrolled yet</h1>
          ) : (
            user.enrolledCourses.map((course) => (
              <Course course={course} key={course._id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;






// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Loader2 } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import Course from "./Course";
// import {
//   useLoadUserQuery,
//   useUpdateUserMutation,
// } from "@/features/api/authApi";
// import { toast } from "sonner";

// const Profile = () => {
//   const [name, setName] = useState("");
//   const [profilePhoto, setProfilePhoto] = useState(null);

//   const { data, isLoading, refetch } = useLoadUserQuery();

//   const [
//     updateUser,
//     {
//       data: updateUserData,
//       isLoading: updateUserIsLoading,
//       isError,
//       error,
//       isSuccess,
//     },
//   ] = useUpdateUserMutation();

//   // ✅ Prefill name when profile loads
//   useEffect(() => {
//     if (data?.user) {
//       setName(data.user.name);
//     }
//   }, [data]);

//   // ✅ Handle update success / error
//   useEffect(() => {
//     if (isSuccess) {
//       refetch();
//       toast.success(updateUserData?.message || "Profile updated successfully");
//     }
//     if (isError) {
//       toast.error(error?.data?.message || "Profile update failed");
//     }
//   }, [isSuccess, isError, error, updateUserData]);

//   const onChangeHandler = (e) => {
//     const file = e.target.files?.[0];
//     if (file) setProfilePhoto(file);
//   };

//   const updateUserHandler = async () => {
//     const formData = new FormData();
//     formData.append("name", name);
//     if (profilePhoto) {
//       formData.append("profilePhoto", profilePhoto);
//     }
//     await updateUser(formData);
//   };

//   if (isLoading) return <h1>Profile Loading...</h1>;
//   if (!data?.user) return <h1>Error loading profile</h1>;

//   const { user } = data;

//   return (
//     <div className="max-w-4xl mx-auto px-4 my-24">
//       <h1 className="font-bold text-2xl text-center md:text-left">
//         My Profile
//       </h1>

//       <div className="flex flex-col md:flex-row items-center gap-8 my-6">
//         <Avatar className="h-32 w-32">
//           <AvatarImage
//             src={user.photoURL || "https://github.com/shadcn.png"}
//             alt="profile"
//           />
//           <AvatarFallback>CN</AvatarFallback>
//         </Avatar>

//         <div>
//           <p><b>Name:</b> {user.name}</p>
//           <p><b>Email:</b> {user.email}</p>
//           <p><b>Role:</b> {user.role.toUpperCase()}</p>

//           <Dialog>
//             <DialogTrigger asChild>
//               <Button size="sm" className="mt-3">
//                 Edit Profile
//               </Button>
//             </DialogTrigger>

//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Edit Profile</DialogTitle>
//                 <DialogDescription>
//                   Update your profile details
//                 </DialogDescription>
//               </DialogHeader>

//               <div className="grid gap-4 py-4">
//                 <Input
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   placeholder="Name"
//                 />

//                 <Input
//                   type="file"
//                   accept="image/*"
//                   onChange={onChangeHandler}
//                 />
//               </div>

//               <DialogFooter>
//                 <Button
//                   disabled={updateUserIsLoading}
//                   onClick={updateUserHandler}
//                 >
//                   {updateUserIsLoading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Saving...
//                     </>
//                   ) : (
//                     "Save Changes"
//                   )}
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       <h2 className="font-medium text-lg mt-8">
//         Courses you are enrolled in
//       </h2>

//       {user.enrolledCourses.length === 0 ? (
//         <p>You haven't enrolled yet</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//           {user.enrolledCourses.map((course) => (
//             <Course key={course._id} course={course} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Profile;








