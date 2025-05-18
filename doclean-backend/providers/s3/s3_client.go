package s3Provider

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3ClientWrapper struct {
	Client        *s3.Client
	PresignClient *s3.PresignClient
}

var S3Client *S3ClientWrapper

func InitS3ClientWrapper(accessKey, secretKey, region string) {
	awsConfig := aws.Config{
		Region: region,
		Credentials: credentials.NewStaticCredentialsProvider(
			accessKey,
			secretKey,
			"",
		),
	}

	client := s3.NewFromConfig(awsConfig)
	presignClient := s3.NewPresignClient(client)

	S3Client = &S3ClientWrapper{
		Client:        client,
		PresignClient: presignClient,
	}
}
