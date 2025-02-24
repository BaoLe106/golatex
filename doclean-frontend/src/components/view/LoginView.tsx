import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";
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

import { AuthService } from "@/services/auth/authService";

const LoginView: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await AuthService.signIn({
        email: formData.email,
        password: formData.password,
      });
      console.log("debug res", res);

      localStorage.setItem("accessToken", res?.authData.AccessToken);
      localStorage.setItem("refreshToken", res?.authData.RefreshToken);
      sessionStorage.setItem("currentUserEmail", formData.email);
      // dispatch(setToken(res?.data?.user.AccessToken));
      navigate("/project");
    } catch (err: any) {
      console.log("debug err", err);
      // console.log("debug err", err.response.data.error);
      if (err.response.data.error.includes("UserNotConfirmedException")) {
        // router.navigate("/confirm");
        navigate("/confirm");
        return;
      }
      // setError(err.message || "Login failed");
    }
  };

  const showOrHiddenPassword = () => {
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
    } else {
      passwordInput.type = "password";
    }

    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-3xl">Sign In</CardTitle>
        {/* <CardDescription>Deploy your new project in one-click.</CardDescription> */}
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email" className="text-lg">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password" className="text-lg">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {showPassword ? (
                  <Eye
                    onClick={showOrHiddenPassword}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
                  />
                ) : (
                  <EyeOff
                    onClick={showOrHiddenPassword}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
                  />
                )}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col">
        {/* justify-between */}
        <Button className="w-[300px] mb-3" onClick={handleLogin}>
          Login
        </Button>
        <div className="flex items-center text-sm">
          New to GoLatex?
          <a
            href="/register"
            className="ml-1 underline-offset-4 hover:underline font-semibold"
          >
            Sign up
          </a>
        </div>
      </CardFooter>
    </Card>
    // <div>
    //   <h2>Login</h2>
    //   {error && <p style={{ color: "red" }}>{error}</p>}
    //   <input
    //     type="email"
    //     placeholder="Email"
    //     onChange={(e) => setEmail(e.target.value)}
    //   />
    //   <input
    //     type="password"
    //     placeholder="Password"
    //     onChange={(e) => setPassword(e.target.value)}
    //   />
    //   <button onClick={handleLogin}>Login</button>
    // </div>
  );
};

export default LoginView;
