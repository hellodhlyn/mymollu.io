# IAM Roles and Policies
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "mollulog-functions-to-s3" {
  statement {
    effect = "Allow"
    actions = ["s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:PutObjectAcl"]
    resources = [
      aws_s3_bucket.assets-bucket.arn,
      "${aws_s3_bucket.assets-bucket.arn}/*",
    ]
  }
}

resource "aws_iam_policy" "mollulog-functions-to-s3" {
  name   = "mollulog-functions-to-s3"
  policy = data.aws_iam_policy_document.mollulog-functions-to-s3.json

  tags = {
    Service = "mollulog"
  }
}

resource "aws_iam_role" "mollulog-functions" {
  name               = "mollulog-functions-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json

  tags = {
    Service = "mollulog"
  }
}

resource "aws_iam_role_policy_attachment" "mollulog-functions-to-s3" {
  role =       aws_iam_role.mollulog-functions.name
  policy_arn = aws_iam_policy.mollulog-functions-to-s3.arn
}


# Functions
data "archive_file" "assets-metadata" {
  type        = "zip"
  source_file = "../../lambda/build/bootstrap"
  output_path = "../../lambda/build/bootstrap.zip"
}

resource "aws_lambda_function" "assets-metadata" {
  filename         = "../../lambda/build/bootstrap.zip"
  function_name    = "mollulog-assets-metadata"
  role             = aws_iam_role.mollulog-functions.arn
  handler          = "assets-metadata"
  source_code_hash = data.archive_file.assets-metadata.output_base64sha256

  runtime       = "provided.al2"
  architectures = [ "x86_64" ]
  timeout       = 10
  memory_size   = 128

  tags = {
    Service = "mollulog"
  }
}

resource "aws_lambda_permission" "assets-metadata" {
  statement_id  = "AllowExecutionFromMollulogAssetsbucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.assets-metadata.arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.assets-bucket.arn
}
