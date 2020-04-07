import os
import minio
from minio.error import ResponseError, BucketAlreadyOwnedByYou, BucketAlreadyExists
from ..utils import filename_from_path

S3prefix = 's3://'
envAccessKey = 'HYPERML_S3_ACCESS_KEY'
envSecretKey =  'HYPERML_S3_SECRET_KEY'
envBucket = 'HYPERML_S3_BUCKET'
envURL = 'HYPERML_S3_URL'
envSecure = 'HYPERML_S3_SECURE'

class StorageBackend(object):
    client = None
    access_key = ''
    secret_key = ''
    def __init__(self, endpoint=None, accesskey=None, secretkey=None, bucket=None, secure=False):
        if bucket:
            self.default_bucket = bucket
        else:
            self.default_bucket = os.environ.get(envBucket, "hyperml")
        
        if not accesskey:
            accesskey = os.environ.get(envAccessKey)
            secretkey = os.environ.get(envSecretKey)
            
        if not endpoint:
            endpoint = os.environ.get(envURL)
        
        if not secure:
            if os.environ.get(envSecure, "True") == "True":
                secure = True
            else:
                secure = False
        print('minio:', endpoint, accesskey, secretkey, secure)
        self.client = minio.Minio(endpoint=endpoint,
                                  access_key=accesskey,
                                  secret_key=secretkey,
                                  secure=secure)
        self.access_key = accesskey
        self.secret_key = secretkey
    
    ''' Check if bucket exists or create if not '''
    def checkBucket(self, bucket=None):
        if not bucket:
            bucket = self.default_bucket

        try:
            exists = self.client.bucket_exists(bucket)
            if exists:
                return ''
            
            self.client.make_bucket(bucket)
        except BucketAlreadyExists:
            print('Bucket name already exists. Please choose a different one.')
            return 'Bucket name already exists. Please choose a different one.'
        except BucketAlreadyOwnedByYou:
            print('Bucket is already owned by you')
            return ''
        except Exception as e:
            print('Minio Connection failure: ', str(e))
            return str(e)

    def get_credentials(self):
        return self.access_key, self.secret_key
    
    def prepare_s3path(self, bucket, object_name, object_path=None):
        if object_path:
            return S3prefix + bucket + '/' + object_path + '/' + object_name
        
        return S3prefix + bucket + '/' +  object_name

    ''' Upload Notebook to S3 or GCS 
        path: local absolute path of object to be uploaded.
        
    '''
    def upload_notebook(self, path, rootpath='./', bucket=None):

        if not bucket:
            bucket = self.default_bucket
        
        err = self.checkBucket(bucket)
        if err:
            print('failed to find or create bucket:', err)
            raise NameError(err)
        
        object_name = path
        
        local_path = os.path.expanduser(rootpath +'/' + path)
        
        print('Local path: ', local_path)
        self.client.fput_object(bucket_name=bucket,
                                object_name=object_name,
                                file_path=local_path)

        return self.prepare_s3path(bucket, object_name)



    ''' Download notebook with given s3 path to local path. 
        object_path: s3:// prefixed path followed by bucket and object name    
        local_dir: location on local machine to download the object
    '''
    def download_notebook(self, object_path, local_dir):
    
        # strip s3:// 
        object_path = object_path.strip(S3prefix)
        
        # derive bucket name as first element of path
        bucket = object_path.split('/')[0]

        # derive object name as tail of input path 
        object_name = object_path.strip(bucket)
        object_name = object_name.strip('/')

        # generate absolute path for local 
        local_path = os.path.expanduser(local_dir  + '/' + object_name))

        self.client.fget_object(bucket_name=bucket,
                                object_name=object_name,
                                file_path=local_path)
        return object_name


    ''' Upload the folder that contains notebook '''
    def upload_archive(self, path, bucket=None):
        pass
    