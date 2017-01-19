# CoreOS ELB Target Group Presence Service

[![Docker Repository on Quay.io](https://quay.io/repository/sfurnival/elbtg-presence/status "Docker Repository on Quay.io")](https://quay.io/repository/sfurnival/elbtg-presence)

This Docker container allows you to (de)register an EC2 instance with an Amazon Elastic Load Balancer Target Group.

(Inspired by: https://github.com/coreos/elb-presence)

## Usage

### As a Docker container

The `elbtg-presence` container takes all of its configuration from environment
variables.

``` sh
docker run --rm --name example-presence -e AWS_ACCESS_KEY=<key> -e AWS_SECRET_KEY=<secret> -e AWS_REGION=us-east-1 -e AWS_TARGET_GROUP=ExampleTargetGroup quay.io/sfurnival/elbtg-presence
```

* `AWS_ACCESS_KEY` ... Your AWS [access key](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html)
* `AWS_SECRET_KEY` ... Your AWS [secret key](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html)
* `AWS_REGION` ... The AWS region that your load balancer is located in
* `AWS_TARGET_GROUP` ... The ARN for the desired Target Group

### Via Fleet

Usually you'll want to manage the lifecycle of your presence service using
[fleet](https://github.com/coreos/fleet). To do so, you can create a service
file similar to this example:

**`my-service-presence@.service`**

``` ini
[Unit]
Description=Example Presence Service
BindsTo=my-service@%i.service

[Service]
TimeoutStartSec=0
ExecStartPre=-/usr/bin/docker kill %p-%i
ExecStartPre=-/usr/bin/docker rm %p-%i
ExecStartPre=/usr/bin/docker pull quay.io/sfurnival/elbtg-presence:latest
ExecStart=/usr/bin/docker run --rm --name %p-%i -e AWS_ACCESS_KEY=<key> -e AWS_SECRET_KEY=<secret> -e AWS_REGION=us-east-1 -e AWS_TARGET_GROUP=ExampleTargetGroup quay.io/sfurnival/elbtg-presence
ExecStop=/usr/bin/docker stop %p-%i

[X-Fleet]
MachineOf=my-service@%i.service
```

This service will deploy to the same machine as your service (`MachineOf`) and
automatically start and stop along with it (`BindsTo`).
