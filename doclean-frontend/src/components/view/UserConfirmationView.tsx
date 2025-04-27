import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTypedSelector } from "@/stores/main";
import { selectCurrentUserEmail } from "@/stores/authSlice";
import {
  InputOTP,
  InputOTPGroup,
  // InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { AuthService } from "@/services/auth/authService";

function initCurrentUserEmail() {
  const currentUserEmail = sessionStorage.getItem("currentUserEmail");
  return currentUserEmail ? currentUserEmail : "";
}

const UserConfirmationView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  // const currentUserEmail = location.state?.currentUserEmail || "";
  const [currentUserEmail, _] = useState<string>(initCurrentUserEmail);
  useEffect(() => {
    console.log("debug init confirm", currentUserEmail);
  }, []);

  useEffect(() => {
    console.log("debug currentUserEmail change at confirm", currentUserEmail);
  }, [currentUserEmail]);
  const submitConfirmationCode = async () => {
    try {
      // if (!currentUserEmail) return;
      await AuthService.confirmSignUp({
        email: currentUserEmail,
        confirmationCode: confirmationCode,
      });
      navigate("/project");
      // console.log("debug res in confirm", res);
      // navigate("../confirm", {
      //   state: {
      //     currentUserEmail: formData.email,
      //   },
      // });
    } catch (err: any) {
      console.log("debug err", err);
    }
  };

  return (
    <div className="flex-col justify-items-center">
      <p className="text-3xl font-semibold mb-5">Confirm your email</p>
      <p className="text-gray-500 text-xl mb-5">
        Type in the code we sent to your email {currentUserEmail}
      </p>
      <InputOTP
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        value={confirmationCode}
        onChange={(value) => setConfirmationCode(value)}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} className="w-16 h-16 text-2xl" />
          <InputOTPSlot index={1} className="w-16 h-16 text-2xl" />
          <InputOTPSlot index={2} className="w-16 h-16 text-2xl" />
          <InputOTPSlot index={3} className="w-16 h-16 text-2xl" />
          <InputOTPSlot index={4} className="w-16 h-16 text-2xl" />
          <InputOTPSlot index={5} className="w-16 h-16 text-2xl" />
        </InputOTPGroup>
      </InputOTP>
      <div className="flex text-gray-500 text-lg font-medium mt-5 mb-7">
        Didn't receive the code?
        <p className="ml-1 font-semibold cursor-pointer hover:underline">
          Send again
        </p>
      </div>
      <Button
        className="w-[300px] h-10 mb-3 text-xl"
        onClick={submitConfirmationCode}
      >
        Confirm
      </Button>
    </div>
  );
};

export default UserConfirmationView;
