import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth/authService";

import { useAppDispatch } from "@/stores/main";
import { setCurrentUserEmail } from "@/stores/authSlice";
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

const RegisterView: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordAgain: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      if (formData.password !== formData.passwordAgain) {
        throw new Error("Your password is not synchronize");
      }
      // const token =
      const res = await AuthService.signUp({
        email: formData.email,
        password: formData.password,
      });
      console.log("debug res", res);
      // dispatch(setCurrentUserEmail(formData.email));
      //use sessionStorage instead
      sessionStorage.setItem("currentUserEmail", formData.email);

      // navigate("/confirm", {
      //   state: {
      //     currentUserEmail: formData.email,
      //   },
      // });
      navigate("/confirm");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Register failed");
    }
  };

  const showOrHiddenPassword = (elementId: string) => {
    const passwordInput = document.getElementById(
      elementId
    ) as HTMLInputElement;
    // const toggleIcon = document.getElementById("icon-password");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      // toggleIcon.setAttribute("icon", "eye-off");
    } else {
      passwordInput.type = "password";
      // toggleIcon.setAttribute("icon", "eye");
    }

    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-3xl">Sign Up</CardTitle>
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
                    onClick={() => showOrHiddenPassword("password")}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
                  />
                ) : (
                  <EyeOff
                    onClick={() => showOrHiddenPassword("password")}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <div className="relative">
                <Input
                  id="password-again"
                  name="passwordAgain"
                  type="password"
                  className="pr-10"
                  placeholder="Enter your password again"
                  value={formData.passwordAgain}
                  onChange={handleChange}
                />
                {showPassword ? (
                  <Eye
                    onClick={() => showOrHiddenPassword("password-again")}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
                  />
                ) : (
                  <EyeOff
                    onClick={() => showOrHiddenPassword("password-again")}
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
        <Button className="w-[300px] mb-3" onClick={handleRegister}>
          Sign up
        </Button>
        <div className="flex items-center text-sm">
          Already on GoLatex?
          <a
            href="/login"
            className="ml-1 underline-offset-4 hover:underline font-semibold"
          >
            Login
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

export default RegisterView;
