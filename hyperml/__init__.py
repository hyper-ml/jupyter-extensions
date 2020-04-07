# 
# Copyright 2019-2020 hyperML 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from notebook.utils import url_path_join
from .schedules.handler import Schedules
from .resources.handlers import ResourceProfiles, ContainerImages
from .storage.handler import Storage

def load_jupyter_server_extension(nb_server_app):
    web_app = nb_server_app.web_app
    host_pattern = '.*$' 
    image_path = url_path_join(web_app.settings['base_url'], r'/api/hyperml/containerimages')
    resources_path = url_path_join(web_app.settings['base_url'], r'/api/hyperml/resourceprofiles')
    schedules_path = url_path_join(web_app.settings['base_url'], r'/api/hyperml/schedules')
    storage_path = url_path_join(web_app.settings['base_url'], r'/api/hyperml/storage')
    web_app.add_handlers(host_pattern, [(schedules_path, Schedules), (resources_path, ResourceProfiles), (image_path, ContainerImages), (storage_path, Storage)])
