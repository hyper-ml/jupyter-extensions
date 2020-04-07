# Schedule Notebooks in Background
This extension supports running notebooks in the background. 

The use cases are - 
* you want to continue working on an approach and try several other approaches at the same time in background
* you are sharing expensive resources like GPU with others in your team or univ 


## Requirements
- Jupyter Labs (>2.0.0)
- hyperML (>0.9.0)


## Install
jupyter labextension install hyperml-submit-notebooks

## Get Started
Setup the following OS environment variables:
- hyperML: 
    - HYPERML_SERVER_ENDPOINT 
    - HYPERML_API_KEY
- AWS S3: The source Notebook and the processed notebook will be stored on S3 or Minio
    - HYPERML_S3_ACCESS_KEY 
    - HYPERML_S3_SECRET_KEY
    - HYPERML_S3_BUCKET (defaults to hyperML)
    - HYPERML_S3_URL (e.g. s3-us-west-2.amazonaws.com)
    - HYPERML_S3_SECURE (default true)

## Scheduling notebooks 
1. Locate **Run in Background** button in notebook toolbar
2. Enter Resource Plan (must be setup on hyperML) and Container Image
3. Click OK
4. Continue working on the current notebook or monitor the background request on **background-notebooks** tab. 


Note: You can also open background notebooks from command search 'background-notebooks:open'.

## Limitations
1. Only Dark mode styling as of now 
2. 