#!/bin/bash -e
export S3BUCKET=sba-tools
export S3FOLDER=size-standards
export ZIP_FILENAME=size-standards.zip
export OPEN_API_SPEC_FILENAME=api-specification.yaml
export CLOUD_FORMATION_TEMPLATE_NAME=template.yaml

# create code bundle
echo "Creating and Uploading Code Bundle"
mkdir build
cp package.json build/
cp src/* build/
cd build
npm i --prod --silent
rm package.json
zip -r -q ../${ZIP_FILENAME} .
cd ..
aws s3 cp ${ZIP_FILENAME} s3://${S3BUCKET}/${S3FOLDER}/${ZIP_FILENAME}
rm ${ZIP_FILENAME}
rm -rf build

# upload the api specification
echo "Uploading API Specification"
aws s3 cp configuration/${OPEN_API_SPEC_FILENAME} s3://${S3BUCKET}/${S3FOLDER}/${OPEN_API_SPEC_FILENAME}

echo "Uploading CloudFormation Template"
aws s3 cp configuration/${CLOUD_FORMATION_TEMPLATE_NAME} s3://${S3BUCKET}/${S3FOLDER}/${CLOUD_FORMATION_TEMPLATE_NAME}

echo "Creating Stack"
aws cloudformation create-change-set --stack-name SizeStandardsToolStack --change-set-name SizeStandardsToolChangeSet \
  --change-set-type CREATE \
  --template-url https://s3.amazonaws.com/${S3BUCKET}/${S3FOLDER}/${CLOUD_FORMATION_TEMPLATE_NAME} \
  --capabilities "CAPABILITY_IAM" \
  --parameters ParameterKey=SourceS3BucketName,ParameterValue=${S3BUCKET} ParameterKey=SourceS3FolderName,ParameterValue=${S3FOLDER} ParameterKey=SourceFilename,ParameterValue=${ZIP_FILENAME} ParameterKey=ApiSpecificationFilename,ParameterValue=${OPEN_API_SPEC_FILENAME}
aws cloudformation wait change-set-create-complete --stack-name SizeStandardsToolStack --change-set-name SizeStandardsToolChangeSet
aws cloudformation execute-change-set --stack-name SizeStandardsToolStack  --change-set-name SizeStandardsToolChangeSet

echo "Done"
