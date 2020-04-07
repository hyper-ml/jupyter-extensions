from notebook.base.handlers import APIHandler
import json
from ..api.handler import API
from ..storage.backend import StorageBackend, S3prefix

class Schedules(APIHandler):
    """ Get call to get list of background schedules running """
    def get(self):
        print("Notebooks :")
        api = API()
        response = api.get('user/notebooks')
        # print('response:', response)
        if response[0] <= 201:
            notebooks = {'notebooks': response[1]}
            self.write(notebooks)
        else:
            emptylist = json.dumps({'notebooks': []}) 
            self.write(emptylist)
        self.flush()

    """ Post call to launch a background notebook """
    def post(self, *args, **kwargs):
        
        params = self.get_json_body()
        print('params:', params)
        try:
            notebook_path = params['notebook_path']
            notebook_root = params['notebook_root']
            # include_folder = params['include_folder']
            resource_profile_id = params['resource_profile']
            container_image_id = params['container_image']
        except KeyError:
            self.responseError(err="Invalid Parameter [resource plan or container image]")
            return 

        try:
            backend = StorageBackend()
            storage_path = backend.upload_notebook(notebook_path, notebook_root)

            if not storage_path:
                print('Notebook Path:', notebook_path)
                print('Notebook Root:', notebook_root)
                self.responseError(err='Failed to upload notebook to storage backend(s3): ')
                return 
           
            s3_access_key, s3_secret_key = backend.get_credentials()
            print('upload_notebook: storage path:', storage_path)
        except Exception as e:
            self.responseError(err='Failed to connect or upload to storage backend(s3): ' + str(e))
            return
        
        api = API()
        api_params = {
            'ResourceProfileID': resource_profile_id,
            'ContainerImageID': container_image_id,
            'Params': {
                'InputPath': storage_path,
                # todo: get from env vars or wherever 
                'AwsAccessKey': s3_access_key,
                'AwsSecretKey': s3_secret_key
                # todo : Workspace: upload archive
            }
        }

        response = api.post('user/notebooks/bck/new', api_params)

        # print('response:', response)
        if response[0] <= 201:
            notebooks = {'notebooks': response[1]}
            self.write(notebooks)
        else:
            emptylist = json.dumps({'notebooks': []}) 
            self.write(emptylist)
        self.flush()
        

    def responseError(self, err='Unknown', code=401): 
        response = {
            'status_code' : code,
            'error': err,
        }
        self.write(response)
        self.flush()

    """" Rest Delete to be used for stopping notebook """
    def delete(self):
        pass

