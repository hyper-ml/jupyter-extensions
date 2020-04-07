from notebook.base.handlers import APIHandler
import json
from .backend import StorageBackend, S3prefix

class Storage(APIHandler):

	def responseError(self, err='Unknown', code=401): 
		response = {
			'status_code' : code,
			'error': err,
		}
		self.write(response)
		self.flush()

	def get(self):
		try: 
			remote_path = self.get_argument('remote_path')
			local_path = self.get_argument('local_path')
			print('notebook_path:', remote_path)
			print('local_path:', local_path)
			sb = StorageBackend()
			object_name = sb.download_notebook(remote_path, local_path)
			return_message = {'local_path' : local_path, 'object_name': object_name}
			self.write(return_message)
			self.flush()
		except Exception as e:
			self.responseError(err='Failed to connect or download to storage backend(s3): ' + str(e))
			return
		
