#/bin/bash
aws cloudformation delete-stack --stack-name SizeStandardsToolStack
aws cloudformation wait stack-delete-complete --stack-name SizeStandardsToolStack 
