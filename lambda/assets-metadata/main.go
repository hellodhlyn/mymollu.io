package main

import (
	"context"
	"fmt"
	"maps"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

func handler(ctx context.Context, event events.S3Event) {
	awsSession := session.Must(session.NewSession())
	s3Svc := s3.New(awsSession)

	for _, record := range event.Records {
		s3Record := record.S3
		bucketName, key := s3Record.Bucket.Name, s3Record.Object.Key
		fmt.Printf("try to update metadata for: %s/%s\n", bucketName, key)

		headObjOutput, err := s3Svc.HeadObject(&s3.HeadObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(key),
		})
		if err != nil {
			fmt.Printf("failed to HeadObject: %v\n", err)
			continue
		}

		_, err = s3Svc.CopyObject(&s3.CopyObjectInput{
			Bucket:            aws.String(bucketName),
			CopySource:        aws.String(bucketName + "/" + key),
			Key:               aws.String(key),
			MetadataDirective: aws.String(s3.MetadataDirectiveReplace),
			Metadata:          maps.Clone(headObjOutput.Metadata),
			ContentType:       headObjOutput.ContentType,
			CacheControl:      aws.String("public, max-age=86400"),
		})
		if err != nil {
			fmt.Printf("failed to PutObject: %v\n", err)
		}
	}
}

func main() {
	lambda.Start(handler)
}
