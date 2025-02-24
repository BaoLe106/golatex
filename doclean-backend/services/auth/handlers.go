package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/BaoLe106/doclean/doclean-backend/configs"
	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
)

func getSecretHash(username string) string {
	mac := hmac.New(sha256.New, []byte(configs.Envs.ClientSecret))
    mac.Write([]byte(username + configs.Envs.ClientID))

    secretHash := base64.StdEncoding.EncodeToString(mac.Sum(nil))
		return secretHash
}

func (cognitoAuth *CognitoAuth) RefreshToken(c *gin.Context) {
	var authResult *types.AuthenticationResultType
	var requestBody RefreshTokenSchema

	err := json.NewDecoder(c.Request.Body).Decode(&requestBody)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	output, err := cognitoAuth.cognitoSvc.InitiateAuth(c, &cognitoidentityprovider.InitiateAuthInput{
		AuthFlow:       "REFRESH_TOKEN_AUTH",
		ClientId:       aws.String(configs.Envs.ClientID),
		AuthParameters: map[string]string{
			"REFRESH_TOKEN": requestBody.RefreshToken, 
			"SECRET_HASH": getSecretHash(requestBody.Email),
		},
	})
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	authResult = output.AuthenticationResult
	apiResponse.SendPostRequestResponse(c, http.StatusCreated, gin.H{"authData": authResult})
}

func (cognitoAuth *CognitoAuth) SignUp(c *gin.Context) {
	// user *User, 
	// w, r := c.Writer, c.Request
	var user UserSchema
	err := json.NewDecoder(c.Request.Body).Decode(&user)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	userCognito := &cognitoidentityprovider.SignUpInput{
		ClientId: aws.String(configs.Envs.ClientID),
		SecretHash: aws.String(getSecretHash(user.Email)),
		Username: aws.String(user.Email),
		Password: aws.String(user.Password),
		UserAttributes: []types.AttributeType{
			{Name: aws.String("email"), Value: aws.String(user.Email)},
		},
	}
	output, err := cognitoAuth.cognitoSvc.SignUp(c, userCognito)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
		// return false, err
	}
	// cognitoidentityprovider.SignUpOutput
	// fmt.Println(output.CodeDeliveryDetails.Destination)
	apiResponse.SendPostRequestResponse(c, http.StatusCreated, gin.H{
		"userConfirmed": output.UserConfirmed, 
		"userSub": output.UserSub, 
		"userEmail": output.CodeDeliveryDetails.Destination,
	})
	// return output.UserConfirmed, err
}

func (cognitoAuth *CognitoAuth) ConfirmSignUp(c *gin.Context) {
	var confirmUser ConfirmUserSchema
	err := json.NewDecoder(c.Request.Body).Decode(&confirmUser)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// cognitoidentityprovider.ConfirmSignUpOutput
	_, err = cognitoAuth.cognitoSvc.ConfirmSignUp(c, &cognitoidentityprovider.ConfirmSignUpInput{
		ClientId:						aws.String(configs.Envs.ClientID),
		ConfirmationCode:		aws.String(confirmUser.ConfirmationCode),
		Username:						aws.String(confirmUser.Email),
		SecretHash: 				aws.String(getSecretHash(confirmUser.Email)),
	})
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	apiResponse.SendPostRequestResponse(c, http.StatusCreated, nil)
}

func (cognitoAuth *CognitoAuth) SignIn(c *gin.Context) {
	// user *User, 
	// w, r := c.Writer, c.Request
	var authResult *types.AuthenticationResultType
	var user UserSchema
	err := json.NewDecoder(c.Request.Body).Decode(&user)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// cognitoAuth.cognitoSvc.ConfirmSignUp() use after sign up and get confirmation code in email
	
	// cognitoAuth.cognitoSvc.ResendConfirmationCode() to resend confirmation code
	// use case: when user dont put in their confirmation code right after sign up
	output, err := cognitoAuth.cognitoSvc.InitiateAuth(c, &cognitoidentityprovider.InitiateAuthInput{
		AuthFlow:       "USER_PASSWORD_AUTH",
		ClientId:       aws.String(configs.Envs.ClientID),
		AuthParameters: map[string]string{
			"USERNAME": user.Email, 
			"PASSWORD": user.Password, 
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

	authResult = output.AuthenticationResult
	apiResponse.SendPostRequestResponse(c, http.StatusCreated, gin.H{"authData": authResult})
}