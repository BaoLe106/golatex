// remove here
import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { useApiClient } from "@/services/base";
import { cognitoConfig } from "@/services/config/cognito-config";

console.log(cognitoConfig.UserPoolId);
const userPool = new CognitoUserPool({
  UserPoolId: cognitoConfig.UserPoolId,
  ClientId: cognitoConfig.ClientId,
});
// end
interface UserSchema {
  email: string;
  password: string;
}
interface ConfirmUserSchema {
  email: string;
  confirmationCode: string;
}

interface RefreshTokenSchema {
  email: string;
  refreshToken: string;
}

export const AuthService = (() => {
  const apiClient = useApiClient();

  const tempSignIn = async (sessionId: string, email: string) => {
    const apiUrl = `/auth/eSignin/${sessionId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const data = { email: email };
    return await apiClient.post(apiUrl, data, config);
  };

  const tempAuthCheck = async () => {
    const apiUrl = `/auth/eAuthCheck`;
    const res = await apiClient.get(apiUrl);
    return res;
  };

  const getNewAccessToken = async (data: RefreshTokenSchema) => {
    const apiUrl = `/auth/refresh`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const res = await apiClient.post(apiUrl, data, config);
    return res.data;
  };

  const getUserInfoByUserEmail = async () => {
    const apiUrl = `/auth/userInfo`;
    const res = await apiClient.get(apiUrl);
    return res.data;
  };

  const authCheck = async () => {
    const apiUrl = `/auth/authCheck`;
    const res = await apiClient.get(apiUrl);
    return res;
  };

  const signUp = async (data: UserSchema) => {
    const apiUrl = `/auth/signup`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const res = await apiClient.post(apiUrl, data, config);
    return res.data;
  };

  const confirmSignUp = async (data: ConfirmUserSchema) => {
    const apiUrl = `/auth/confirmSignup`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const res = await apiClient.post(apiUrl, data, config);
    // console.log("debug in confirmSignUp", res);
    return res;
  };

  const signIn = async (data: UserSchema) => {
    const apiUrl = `/auth/signin`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const res = await apiClient.post(apiUrl, data, config);
    return res.data;
  };

  return {
    tempAuthCheck,
    tempSignIn,
    getUserInfoByUserEmail,
    getNewAccessToken,
    authCheck,
    signUp,
    confirmSignUp,
    signIn,
  };
})();

//modify this to api
// export const register = (email: string, password: string): Promise<any> => {
//   return new Promise((resolve, reject) => {
//     userPool.signUp(email, password, [], [], (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// };

// const attributeList = [
//   new CognitoUserAttribute({ Name: "email", Value: email }),
//   // new CognitoUserAttribute({ Name: "name", Value: name }), // Optional custom attribute
// ];
// name: string

//modify this to api
export const login = (email: string, password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const token = session.getIdToken().getJwtToken();
        localStorage.setItem("token", token);
        resolve(token);
      },
      onFailure: (err) => reject(err),
    });
  });
};

//modify this to api
export const logout = () => {
  const user = userPool.getCurrentUser();
  if (user) {
    user.signOut();
  }
  localStorage.removeItem("token");
};

// keep this
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};
