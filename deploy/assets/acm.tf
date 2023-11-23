provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"
}

data "aws_acm_certificate" "mollulog-net" {
  provider = aws.us-east-1
  domain   = "*.mollulog.net"
  types    = ["AMAZON_ISSUED"]
  statuses = ["ISSUED"]
}
