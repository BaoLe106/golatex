import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const ProtectedRoutes = () => {
  const { isAuthenticated, tempSignIn } = useAuth();
  const [email, setEmail] = useState<string>("");

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Optional loading state
  } else {
    return (
      <>
        {isAuthenticated === true ? (
          // <div>hello</div>
          <Outlet />
        ) : isAuthenticated === false ? (
          <Dialog
            open={true}
            onOpenChange={() => {
              // setIsShowingSelectLoginMethodModal(false);
              // navigate("/");
            }}
          >
            <DialogContent className="w-96" overlay={true}>
              <DialogHeader>
                <DialogTitle className="text-xl text-center">
                  <br />
                  Please enter your email to join the project
                </DialogTitle>
              </DialogHeader>

              <div className="flex justify-center items-center space-x-4">
                <Input
                  autoFocus
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <DialogFooter className="justify-end">
                {/* <DialogClose asChild> */}
                <Button
                  type="button"
                  disabled={!email}
                  onClick={() => tempSignIn(email)}
                >
                  Join
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </>
    );
    // <Navigate to="/login" />;
  }
};

export default ProtectedRoutes;
