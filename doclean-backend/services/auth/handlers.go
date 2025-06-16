package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/BaoLe106/doclean/doclean-backend/configs"
	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

func getSecretHash(username string) string {
	mac := hmac.New(sha256.New, []byte(configs.Envs.ClientSecret))
	mac.Write([]byte(username + configs.Envs.ClientID))

	secretHash := base64.StdEncoding.EncodeToString(mac.Sum(nil))
	return secretHash
}

// var secretKey = []byte("secret-key")
func AuthCheckForESignin(c *gin.Context) {
	// Have a middleware beforehand to verify the token
	apiResponse.SendGetRequestResponse(c, http.StatusOK, nil)
}

func CreateTokenForESignin(c *gin.Context) {
	projectId := c.Param("projectId")

	var input map[string]any
	err := json.NewDecoder(c.Request.Body).Decode(&input)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	email, _ := input["email"].(string)
	err = GetProjectMemberByEmail(projectId, email)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var accessTokenSecret = []byte(configs.Envs.SecretAccessTokenESignin)
	var refreshTokenSecret = []byte(configs.Envs.SecretRefreshTokenESignin)

	accessToken := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"email": email,
			"exp":   time.Now().Add(time.Hour * 2).Unix(),
		},
	)

	refreshToken := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"email": email,
			"exp":   time.Now().Add(time.Hour * 48).Unix(),
		},
	)

	accessTokenString, err := accessToken.SignedString(accessTokenSecret)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	refreshTokenString, err := refreshToken.SignedString(refreshTokenSecret)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	fmt.Println("debug accessTokenString", accessTokenString)
	c.SetCookie(
		"AccessToken",     // name
		accessTokenString, // value
		7200,              // maxAge (in seconds)
		"/",               // path
		"localhost",       // domain
		false,             // secure, later on set to true in prod
		true,              // httpOnly
	)

	c.SetCookie(
		"RefreshToken",     // name
		refreshTokenString, // value
		172800,             // maxAge (in seconds)
		"/",                // path
		"localhost",        // domain
		false,              // secure, later on set to true in prod
		true,               // httpOnly
	)

	apiResponse.SendPostRequestResponse(c, http.StatusOK, nil)
}

func (cognitoAuth *CognitoAuth) RefreshToken(c *gin.Context) {
	var authResult *types.AuthenticationResultType
	var requestBody RefreshTokenPayload

	err := json.NewDecoder(c.Request.Body).Decode(&requestBody)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	output, err := cognitoAuth.cognitoSvc.InitiateAuth(c, &cognitoidentityprovider.InitiateAuthInput{
		AuthFlow: "REFRESH_TOKEN_AUTH",
		ClientId: aws.String(configs.Envs.ClientID),
		AuthParameters: map[string]string{
			"REFRESH_TOKEN": requestBody.RefreshToken,
			"SECRET_HASH":   getSecretHash(requestBody.Email),
		},
	})
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	authResult = output.AuthenticationResult
	apiResponse.SendPostRequestResponse(c, http.StatusCreated, gin.H{"authData": authResult})
}

func (cognitoAuth *CognitoAuth) AuthCheck(c *gin.Context) {
	// _, err := redis.RedisClient.Get(c, "AccessToken").Result()

	// if err == nil {
	// 	apiResponse.SendGetRequestResponse(c, http.StatusOK, "")
	// 	return
	// }

	accessToken, err := c.Cookie("AccessToken")
	if err != nil || accessToken == "" {
		apiResponse.SendErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	_, err = cognitoAuth.ValidateToken(accessToken)
	if err != nil || accessToken == "" {
		apiResponse.SendErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	apiResponse.SendGetRequestResponse(c, http.StatusOK, "")
}

func (cognitoAuth *CognitoAuth) SignUp(c *gin.Context) {
	// user *User,
	// w, r := c.Writer, c.Request
	var user UserPayload
	err := json.NewDecoder(c.Request.Body).Decode(&user)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	userCognito := &cognitoidentityprovider.SignUpInput{
		ClientId:   aws.String(configs.Envs.ClientID),
		SecretHash: aws.String(getSecretHash(user.Email)),
		Username:   aws.String(user.Email),
		Password:   aws.String(user.Password),
		UserAttributes: []types.AttributeType{
			{Name: aws.String("email"), Value: aws.String(user.Email)},
		},
	}
	output, err := cognitoAuth.cognitoSvc.SignUp(c, userCognito)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	encryptedPassword, err := HashPassword(user.Password)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = CreateUserInfo(UserInfoPayload{
		UserId:              uuid.New(),
		UserTier:            "FREE",
		SubscriptionEndTime: nil,
		Email:               user.Email,
		Password:            encryptedPassword,
		IsConfirmed:         false,
	})

	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// cognitoidentityprovider.SignUpOutput
	// fmt.Println(output.CodeDeliveryDetails.Destination)
	apiResponse.SendPostRequestResponse(c, http.StatusCreated, gin.H{
		"userConfirmed": output.UserConfirmed,
		"userSub":       output.UserSub,
		"userEmail":     output.CodeDeliveryDetails.Destination,
	})
	// return output.UserConfirmed, err
}

func (cognitoAuth *CognitoAuth) ConfirmSignUp(c *gin.Context) {
	var confirmUser ConfirmUserPayload
	err := json.NewDecoder(c.Request.Body).Decode(&confirmUser)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// cognitoidentityprovider.InitiateAuthOutput
	// cognitoAuth.cognitoSvc.adminauth
	secretHash := getSecretHash(confirmUser.Email)

	_, err = cognitoAuth.cognitoSvc.ConfirmSignUp(c, &cognitoidentityprovider.ConfirmSignUpInput{
		ClientId:         aws.String(configs.Envs.ClientID),
		ConfirmationCode: aws.String(confirmUser.ConfirmationCode),
		Username:         aws.String(confirmUser.Email),
		SecretHash:       aws.String(secretHash),
	})
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	updates := map[string]any{
		"is_confirmed": true,
	}

	err = UpdateUserInfo(confirmUser.Email, updates)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// fmt.Println("#DEBUG confirm", confirmSignUpRes.Session)

	// initiateAuthRes, err := cognitoAuth.cognitoSvc.InitiateAuth(c, &cognitoidentityprovider.InitiateAuthInput{
	// 	AuthFlow:	"USER_AUTH",
	// 	ClientId:	aws.String(configs.Envs.ClientID),
	// 	Session: 	confirmSignUpRes.Session,

	// 	AuthParameters: map[string]string{
	// 		"USERNAME": confirmUser.Email,
	// 		"SECRET_HASH": secretHash,
	// 	},
	// })

	// if (err != nil) {
	// 	apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
	// 	return
	// }

	// fmt.Println(initiateAuthRes.AuthenticationResult)
	// fmt.Println(initiateAuthRes.ChallengeName)

	// c.SetCookie("AccessToken", *initiateAuthRes.AuthenticationResult.AccessToken, 3600, "/", "localhost", false, true)
	// c.SetCookie("IdToken", *initiateAuthRes.AuthenticationResult.IdToken, 3600, "/", "localhost", false, true)
	// c.SetCookie("RefreshToken", *initiateAuthRes.AuthenticationResult.RefreshToken, 86400, "/", "localhost", false, true)

	apiResponse.SendPostRequestResponse(c, http.StatusCreated, nil)
}

func (cognitoAuth *CognitoAuth) SignIn(c *gin.Context) {
	// user *User,
	// w, r := c.Writer, c.Request
	// var authResult *types.AuthenticationResultType
	var user UserPayload
	err := json.NewDecoder(c.Request.Body).Decode(&user)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// cognitoAuth.cognitoSvc.ConfirmSignUp() use after sign up and get confirmation code in email

	// cognitoAuth.cognitoSvc.ResendConfirmationCode() to resend confirmation code
	// use case: when user dont put in their confirmation code right after sign up
	initiateAuthRes, err := cognitoAuth.cognitoSvc.InitiateAuth(c, &cognitoidentityprovider.InitiateAuthInput{
		AuthFlow: "USER_PASSWORD_AUTH",
		ClientId: aws.String(configs.Envs.ClientID),
		AuthParameters: map[string]string{
			"USERNAME":    user.Email,
			"PASSWORD":    user.Password,
			"SECRET_HASH": getSecretHash(user.Email),
		},
	})
	if err != nil {
		// var resetRequired *types.PasswordResetRequiredException
		// if errors.As(err, &resetRequired) {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
		// log.Println(*resetRequired.Message)

		// else {
		// 	// log.Printf("Couldn't sign in user %v. Here's why: %v\n", userName, err)
		// 	apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		// }
	}

	var AccessToken = initiateAuthRes.AuthenticationResult.AccessToken
	var IdToken = initiateAuthRes.AuthenticationResult.IdToken
	var RefreshToken = initiateAuthRes.AuthenticationResult.RefreshToken

	// authResult = output.AuthenticationResult
	c.SetCookie("AccessToken", *AccessToken, 3600, "/", "localhost", false, true)
	c.SetCookie("IdToken", *IdToken, 3600, "/", "localhost", false, true)
	c.SetCookie("RefreshToken", *RefreshToken, 86400, "/", "localhost", false, true)
	// setCacheErr := redis.SetCache(c, "AccessToken", *AccessToken, 5*time.Minute)
	// if setCacheErr != nil {
	// 	fmt.Println("#debug set cache error", setCacheErr);
	// 	apiResponse.SendErrorResponse(c, http.StatusBadRequest, (*setCacheErr).Error())
	// 	return
	// }
	apiResponse.SendPostRequestResponse(c, http.StatusCreated, nil)
}

func (cognitoAuth *CognitoAuth) GetUserInfoByUserEmailHandler(c *gin.Context) {
	idToken, err := c.Cookie("IdToken")
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusUnauthorized, err.Error())
		return
	}
	token, err := cognitoAuth.ValidateToken(idToken)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, "Unable to claim token")
		return
	}

	userInfo, err := GetUserInfoByUserEmail(claims["email"].(string))
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	apiResponse.SendGetRequestResponse(c, http.StatusOK, userInfo)

}
