// import { ChartNoAxesColumn, SquareLibrary } from "lucide-react";
// import React from "react";
// import { Link, Outlet } from "react-router-dom";

// const Sidebar = () => {
//   return (
//     <div className="flex">
//       <div className="hidden lg:block w-[250px] sm:w-[300px] space-y-8 border-r border-gray-300 dark:border-gray-700 bg-[#f0f0f0] p-5 sticky top-0 h-screen">
//         <div className="mt-20 space-y-4">
//           <Link to="dashboard" className="flex items-center gap-2">
//             <ChartNoAxesColumn size={22} />
//             <h1>Dashboard</h1>
//           </Link>
//           <Link to="course" className="flex items-center gap-2">
//             <SquareLibrary size={22} />
//             <h1>Courses</h1>
//           </Link>
//         </div>
//       </div>
//       <div className="flex-1 md:p-24 p-2 bg-white h-15 w-15">
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default Sidebar;



import { ChartNoAxesColumn, SquareLibrary } from "lucide-react";
import React from "react";
import { Link, Outlet } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="flex">
      {/* FIXED SIDEBAR */}
      <div className="hidden lg:block fixed left-0 top-0 w-[250px] sm:w-[300px] h-screen space-y-8 border-r border-gray-300 dark:border-gray-700 bg-[#f0f0f0] dark:bg-[#141212] p-5">
        <div className="mt-20 space-y-4">
          <Link to="dashboard" className="flex items-center gap-2">
            <ChartNoAxesColumn size={22} />
            <h1>Dashboard</h1>
          </Link>
          <Link to="course" className="flex items-center gap-2">
            <SquareLibrary size={22} />
            <h1>Courses</h1>
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-[250px] sm:ml-[300px] h-screen overflow-y-auto md:p-24 p-2 bg-white dark:bg-[#121212]">
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;

