"""Use the existing Docker-internal credential and exact owner; never expose secrets."""
import json, os, sys, secrets, urllib.request, urllib.error
OWNER='c95ca3f4-afaf-4aed-85cb-9b8d7d0d0a3f'
BASE='http://127.0.0.1:8001'
def request(path,method='GET',body=None,owner=OWNER,content_type='application/json'):
    token=os.environ['DEER_FLOW_INTERNAL_AUTH_TOKEN']
    headers={'X-DeerFlow-Internal-Token':token,'X-DeerFlow-Owner-User-Id':owner}
    if method not in ('GET', 'HEAD', 'OPTIONS'):
        csrf=secrets.token_urlsafe(32)
        headers.update({'Cookie':'csrf_token='+csrf,'X-CSRF-Token':csrf})
    if body is not None:
        headers['Content-Type']=content_type
        if not isinstance(body,bytes): body=json.dumps(body).encode()
    req=urllib.request.Request(BASE+path,data=body,headers=headers,method=method)
    with urllib.request.urlopen(req,timeout=60) as r:
        raw=r.read()
        return r.status, json.loads(raw) if 'application/json' in r.headers.get('Content-Type','') else raw
if __name__=='__main__':
    for path in ['/api/projects','/api/models']:
        status,data=request(path)
        if path=='/api/models':
            print(json.dumps({'path':path,'status':status,'response':data})[:5000])
        else: print(json.dumps({'path':path,'status':status,'response':data}))
