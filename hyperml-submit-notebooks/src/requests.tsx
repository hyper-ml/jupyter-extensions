import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';


export default class RequestHandler {
    static get(path: string, params: any, cb: (results: any)=> void): void {
        this.call(path, 'GET', params, cb);
    }

    static post(path: string, params: any, cb: (results: any)=> void): void {
        this.call(path, 'POST', params, cb)
    }

    static handleNonJSONError(resp: any): any {
        if (!resp.ok){
            throw new Error(`${resp.status} ${resp.statusText}`);
        }
        return resp;
    }

    static call(path: string, method: string, params: any, cb: (results: any)=> void): void {
        const settings = ServerConnection.makeSettings();
        const url = URLExt.join(settings.baseUrl, path);
        var request = {} 
        if (method === 'GET'){
            request = {method: method}
        } else if (method === 'POST') {
            request = {method: method, body: JSON.stringify(params)}
        }
        
        const onSuccess = ServerConnection.makeRequest(
            url,
            request,
            settings,
        ).then(response => {
            // handle all errors 
            this.handleNonJSONError(response);
            return response;
        })

        onSuccess.then((response: any) => {
                response.json().then(
                    (result: any) => {
                        if (result.status_code && result.status_code !== 200) {
                            return cb({
                                failed: true,
                                reason: result.error,
                            });
                        }
                        return cb(result);
                    },
                    (reason: any) => {
                        
                        return cb({ 
                            failed: true,
                            reason: reason,
                        });
                    }
                );
                
            } 
        )
    }
}