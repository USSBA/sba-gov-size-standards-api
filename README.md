# sba-gov-size-standards-api
The API for the small business size standards tool (https://www.sba.gov/size-standards/). This tool references data from [naics.json](./src/naics.json)

# API Documentation

Check out our [Swagger/OpenAPI](./swagger.yml) file for API Documentation

# Setup

## Install packages
```
npm install
```

# Testing & Code Standardization

## Run tests:
```
npm test
```

## Run linter
```
npm lint
```

# Deployment

## Pushing to an environment
Push tag to the desired environment name, for example, to push to `amy` run the following command:
```
./push-tag.sh amy 
```