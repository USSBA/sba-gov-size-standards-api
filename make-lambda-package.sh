#!/bin/bash -xe

## Create directories if they do not exist
mkdir -p build
mkdir -p workspace

## Build package
cp package.json build/
cp package-lock.json build/
cp src/* build/
cd build
npm i --prod --silent
rm package.json
# Remove old build
rm -f ../workspace/size-standards.zip
zip -r -q ../workspace/size-standards.zip .
