#!/bin/bash
export S3Bucket=sba-tools
export S3Folder=size-standards
export ZipFileName=size-standards.zip
export OpenApiSpecFilename=api-specification.yaml
export CloudFormationTemplateName=template.yaml

# create code bundle
echo "Creating and Uploading Code Bundle"
zip -j $ZipFileName ./src/index.js
aws s3 cp $ZipFileName s3://$S3Bucket/$S3Folder/$ZipFileName
rm $ZipFileName

# upload the api specification
echo "Uploading API Specification"
aws s3 cp configuration/$OpenApiSpecFilename s3://$S3Bucket/$S3Folder/$OpenApiSpecFilename

echo "Uploading CloudFormation Template"
aws s3 cp configuration/$CloudFormationTemplateName s3://$S3Bucket/$S3Folder/$CloudFormationTemplateName

echo "Creating Stack"
aws cloudformation create-change-set --stack-name SizeStandardsToolStack --change-set-name SizeStandardsToolChangeSet --change-set-type CREATE --template-url https://s3.amazonaws.com/$S3Bucket/$S3Folder/$CloudFormationTemplateName --capabilities "CAPABILITY_IAM"
sleep 5
aws cloudformation execute-change-set --stack-name SizeStandardsToolStack  --change-set-name SizeStandardsToolChangeSet

echo "Done"
