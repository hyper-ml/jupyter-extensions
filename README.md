
## Run Jupyter notebooks in background


This extension supports running and monitoring notebooks in the background from the comfort of Jupyter Labs.

The use cases are - 
* you want to continue working on an approach and try several other approaches at the same time in background
* you are sharing expensive resources like GPU with others in your team or univ 

### About hyperML
hyperML is a radically simplifies on-cloud machine learning for teams/developers. Scale your training jobs right from jupyter labs session or launch a notebook with click of button. Read more details at https://www.hyperml.com


### Requirements
- Jupyter Labs (>2.0.0)
- hyperML (>0.9.0)


### Install
```
jupyter labextension install hyperml-submit-notebooks
```

### Get Started
Setup the following OS environment variables:
- hyperML: 
    - `HYPERML_SERVER_ENDPOINT` 
    - `HYPERML_API_KEY`
- AWS S3: The source Notebook and the processed notebook will be stored on S3 or Minio
    - `HYPERML_S3_ACCESS_KEY`
    - `HYPERML_S3_SECRET_KEY`
    - `HYPERML_S3_BUCKET` (defaults to hyperML)
    - `HYPERML_S3_URL` (e.g. s3-us-west-2.amazonaws.com)
    - `HYPERML_S3_SECURE` (default true)

### Scheduling notebooks 
1. Locate **Run in Background** button in notebook toolbar

![check screens/run-in-background.png](https://github.com/hyper-ml/jupyter-extensions/blob/master/screens/run-in-background.png "Run in background")

2. Enter Resource Plan (must be setup on hyperML) and Container Image

![check screens/choose-params.png](https://github.com/hyper-ml/jupyter-extensions/blob/master/screens/choose-params.png "Choose Parameters")

3. Click OK
4. Continue working on the current notebook or monitor the background request on **background-notebooks** tab. 


![check screens/background-notebooks.png](https://github.com/hyper-ml/jupyter-extensions/blob/master/screens/Background-notebooks.png "Background notebooks")

5. Download and Open the processed notebook 

Note: You can also open background notebooks from command search 'background-notebooks:open'.

### Limitations
Only Dark mode styling as of now 

### Issue Reporting
Welcome any issues. We are a small team to expect a reponse time of 2-3 days
