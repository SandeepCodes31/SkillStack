import { AppWindowIcon, CodeIcon, Loader2 } from "lucide-react";
import { useLoginUserMutation } from "../features/api/authApi";
import { useRegisterUserMutation } from "../features/api/authApi";
import { toast } from "sonner";

// Io4rHpRNZOBGS41g password
// mongodb: sandeeppal6926_db_user   username

// mongodb+srv://sandeeppal6926_db_user:Io4rHpRNZOBGS41g@lmsproject.ezpng00.mongodb.net/

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({
    email: "",
    password: "",
  });

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();

  const navigate = useNavigate();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  // const handleRegistration = async (type) => {
  //   const inputData = type === "signup" ? signupInput : loginInput;
  //   const action = type === "signup" ? registerUser : loginUser;
  //   await action(inputData);
  //   console.log(inputData);
  // };

  const handleRegistration = async (type) => {
  const inputData = type === "signup" ? signupInput : loginInput;

  // Frontend validation
  if (type === "signup") {
    if (!inputData.name || !inputData.email || !inputData.password) {
      alert("All signup fields are required");
      return;
    }
  } else {
    if (!inputData.email || !inputData.password) {
      alert("Email and password are required");
      return;
    }
  }

  const action = type === "signup" ? registerUser : loginUser;

  try {
    const response = await action(inputData).unwrap();
    console.log("SUCCESS:", response);
  } catch (err) {
    console.error("API ERROR:", err);
    alert(err?.data?.message || "Something went wrong");
  }
};
//upto here only

//toast notification
  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Registered successfully");
      // Optionally, you can show a loading toast here
    }
    if(registerError){
      toast.error(registerError.data.message || "Registration failed");
    }
    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "Logged in successfully");
      // Optionally, you can show a loading toast here
      navigate("/");
    }
    if(loginError){
      toast.error(loginError.data.message || "Login failed");
    }

  },[
    loginIsLoading,
    registerIsLoading,
    loginData,
    registerData,
    registerError,
    loginError,

    loginIsSuccess,
    registerIsSuccess,
  ]);



  return (
    <div className="flex items-center w-full justify-center mt-20" >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup" className="w-full">
              Signup
            </TabsTrigger>
            <TabsTrigger value="login" className="w-full">
              Login
            </TabsTrigger>
          </TabsList>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Signup</CardTitle>
                <CardDescription>
                  Create a new account and click signup when you are done.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-name">Name</Label>
                  <Input
                    type="text"
                    id="tabs-demo-name"
                    name="name"
                    value={signupInput.name}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    placeholder="Eg: Sandeep Pal"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-username">Email</Label>
                  <Input
                    type="email"
                    id="tabs-demo-username"
                    name="email"
                    value={signupInput.email}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    placeholder="sandeep@gmail.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-name">Password</Label>
                  <Input
                    type="password"
                    id="tabs-demo-name"
                    name="password"
                    value={signupInput.password}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    placeholder="Eg: xyz"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled={registerIsLoading} onClick={() => handleRegistration("signup")}>
                  {
                    registerIsLoading ? (
                      <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/>Please wait...
                      </>
                      ) : "Signup" 
                  }
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="login" >
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Login your password here. After signup you will be logged in.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Email</Label>
                  <Input
                    id="tabs-demo-current"
                    type="email"
                    name="email"
                    value={loginInput.email}
                    onChange={(e) => changeInputHandler(e, "login")}
                    placeholder="sandeep@gmail.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">Password</Label>
                  <Input
                    id="tabs-demo-new"
                    type="password"
                    name="password"
                    value={loginInput.password}
                    onChange={(e) => changeInputHandler(e, "login")}
                    placeholder="xyz"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled={loginIsLoading} onClick={() => handleRegistration("login")}>
                  {
                    loginIsLoading ? (
                      <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/>Please wait...
                      </>
                      ) : "Login"
                  }
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;



