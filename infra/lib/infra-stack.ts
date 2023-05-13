import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //S3 Bucket
    const balancestatuss3 = new s3.Bucket(this, "balancestatus", {
      bucketName: "balancestatusdemo0125",
    });

    //IAM Role
    const balanceStatusRole = new iam.Role(this, "iambalancerole", {
      roleName: "bankingLambdaRole",
      description: "Role for lambda to acces s3 bucket",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    balanceStatusRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );

    // Lambda Function
    const bankingLambdaFunction = new lambda.Function(this, "lambdalogicalid", {
      handler: "lambda_function.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset("../services"),
      role: balanceStatusRole,
    });

    // API Gateway
    const bankingApi = new apigateway.LambdaRestApi(this, "banckingapi", {
      handler: bankingLambdaFunction,
      restApiName: "bankingrestapi",
      deploy: true,
      proxy: false,
    });
    const bankstatus = bankingApi.root.addResource("bankstatus");
    bankstatus.addMethod("GET");
  }
}
