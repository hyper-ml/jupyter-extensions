from notebook.base.handlers import APIHandler

import json
from ..api.handler import API

class ResourceProfiles(APIHandler):
    """ Get call to get list of resource profiles """
    def get(self):
        api = API()
        response = api.get('resources/profiles')

        if response[0] <= 201:
            self.write(response[1])
        else:
            emptylist = json.dumps({'ResourceProfiles': []}) 
            self.write(emptylist)
        self.flush()

class ContainerImages(APIHandler):
    """ Get call to get list of container images """
    def get(self):
        api = API()
        response = api.get('resources/containerimages')
        
        if response[0] <= 201:
            self.write(response[1])
        else:
            emptylist = json.dumps({'ContainerImages': []}) 
            self.write(emptylist)
        self.flush()
    

