
import requests
import os 
import urllib.parse

class API(object):
    def __init__(self):
        self.endpoint = os.environ.get('HYPERML_SERVER_ENDPOINT', 'localhost:3000')
        
        # to be removed
        self.jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Ik5hbWUiOiJtaW5kaGFzaCJ9LCJpc3MiOiJoeXBlcmZsb3cifQ.EHXonVm1diWWEaL8oV8iHBHYLghukdl4sBsBL97Qnm8'

    def get(self, path):
        abs_url = 'http://' + self.endpoint + '/' + path.strip('/')

        try:
            headers = {'content-type': 'application/json', 'Authorization': 'Bearer ' + self.jwt}
            r = requests.get(abs_url, headers=headers)
            return r.status_code, r.json()
        except Exception as e:
            return 500, "Request Get {} Failed with error {}".format(abs_url, str(e))
    
    def post(self, path, data):
        abs_url = 'http://' + self.endpoint + '/' + path.strip('/')
        try:
            headers = {'content-type': 'application/json', 'Authorization': 'Bearer ' + self.jwt}
            r = requests.post(abs_url, data=data, headers=headers)
            print("r:", r.json())
            return r.status_code, r.json()
        except Exception as e:
            return 500, "Request Get {} Failed with error {}".format(abs_url, str(e))