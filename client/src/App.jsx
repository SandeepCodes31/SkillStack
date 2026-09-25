import { LogIn } from "lucide-react";
import "./App.css";
import { Button } from "./components/ui/button";
import Login from "./pages/login.jsx";
import Navbar from "./components/Navbar";
import HeroSection from "./pages/student/HeroSection";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Courses from "./pages/student/Courses";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import Sidebar from "./pages/admin/lecture/Sidebar";
import Dashboard from "./pages/admin/lecture/Dashboard";
import CourseTable from "./pages/admin/course/CourseTable";
import AddCourse from "./pages/admin/course/AddCourse";
import EditCourse from "./pages/admin/course/EditCourse";
import CreateLecture from "./pages/admin/lecture/CreateLecture";
import EditLecture from "./pages/admin/lecture/EditLecture";
import CourseDetail from "./pages/student/CourseDetail";
import CourseProgress from "./pages/student/CourseProgress";
import SearchPage from "./pages/student/SearchPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import PaymentSuccess from "./pages/student/PaymentSuccess";
import PaymentCancel from "./pages/student/PaymentCancel";
import AdminPayments from "./pages/admin/payment/AdminPayments";
import QuizPage from "./pages/student/quiz/QuizPage";
import VerifyCertificate from "./pages/student/VerifyCertificate";
import AdminQuizzes from "./pages/admin/quiz/AdminQuizzes";
import AdminCertificates from "./pages/admin/certificate/AdminCertificates";
import { AdminRoute, AuthenticatedUser, ProtectedRoute, StudentRoute } from "./components/ProtectedRoutes";
import PurchaseCourseProtectedRoute from "./components/PurchaseCourseProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <HeroSection />
            <Courses />
          </>
        ),
      },
      {
        path: "login",
        element: <AuthenticatedUser><Login defaultTab="login" /></AuthenticatedUser>
      },
      {
        path: "signup",
        element: <AuthenticatedUser><Login defaultTab="signup" /></AuthenticatedUser>
      },
      {
        path: "student/dashboard",
        element: <ProtectedRoute><StudentRoute><StudentDashboard /></StudentRoute></ProtectedRoute>
      },
      {
        path: "my-learning",
        element:<ProtectedRoute><MyLearning /></ProtectedRoute>
      },
      {
        path: "profile",
        element:<ProtectedRoute><Profile /></ProtectedRoute>
      },
       {
        path: "course/search",
        element: <ProtectedRoute><SearchPage /></ProtectedRoute>,
      },
      {
        path: "course-detail/:courseId",
        element:<ProtectedRoute><CourseDetail /></ProtectedRoute>,
      },
      {
        path: "course-progress/:courseId",
        element:<ProtectedRoute><PurchaseCourseProtectedRoute><CourseProgress /></PurchaseCourseProtectedRoute></ProtectedRoute>,
      },
      {
        path: "payment-success",
        element: <PaymentSuccess />,
      },
      {
        path: "payment-cancel",
        element: <PaymentCancel />,
      },
      {
        path: "course/:courseId/quiz",
        element: <ProtectedRoute><PurchaseCourseProtectedRoute><QuizPage /></PurchaseCourseProtectedRoute></ProtectedRoute>,
      },
      {
        path: "verify-certificate",
        element: <VerifyCertificate />,
      },
      {
        path: "verify-certificate/:certificateId",
        element: <VerifyCertificate />,
      },
      
      //admin route starts here
      {
        path:"admin",
        element:<AdminRoute><Sidebar/></AdminRoute>,
        children:[
          {
            path:"dashboard",
            element:<Dashboard/>
          },
          {
            path:"course",
            element:<CourseTable/>
          },
          {
            path:"course/create",
            element:<AddCourse/>
          },
          {
            path:"course/:courseId",
            element:<EditCourse/>
          },
          {
            path:"course/:courseId/lecture",
            element:<CreateLecture/>
          },
          {
            path:"course/:courseId/lecture/:lectureId",
            element:<EditLecture/>
          },
          {
            path:"quizzes",
            element:<AdminQuizzes/>
          },
          {
            path:"certificates",
            element:<AdminCertificates/>
          },
          {
            path:"payments",
            element:<AdminPayments/>
          }
        ]
      }
    ],
  },
]);

function App() {
  return (
    <main>
      <ThemeProvider>
          <RouterProvider router={appRouter} />
      </ThemeProvider>
    
      {/* <Navbar />
      <HeroSection />
      <Login /> */}
    </main>
  );
}

export default App;
