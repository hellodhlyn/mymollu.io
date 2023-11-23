# Bucket
resource "aws_s3_bucket" "assets-bucket" {
  bucket = "mollulog-assets"

  tags = {
    Service = "mollulog"
  }
}

data "aws_iam_policy_document" "assets-bucket-policy" {
  // Access from CloudFront
  statement {
    effect    = "Allow"
    actions   = [ "s3:GetObject" ]
    resources = [ "${aws_s3_bucket.assets-bucket.arn}/*" ]

    principals {
      type = "Service"
      identifiers = [ "cloudfront.amazonaws.com" ]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [ aws_cloudfront_distribution.assets.arn ]
    }
  }
}

resource "aws_s3_bucket_policy" "assets-bucket-policy" {
  bucket = aws_s3_bucket.assets-bucket.id
  policy = data.aws_iam_policy_document.assets-bucket-policy.json
}


# Notification Event
resource "aws_s3_bucket_notification" "assets-created-event" {
  bucket = aws_s3_bucket.assets-bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.assets-metadata.arn
    events              = ["s3:ObjectCreated:Put", "s3:ObjectCreated:Post", "s3:ObjectCreated:CompleteMultipartUpload"]
    filter_prefix       = "assets/"
  }
}
