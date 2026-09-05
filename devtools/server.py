from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json
from experiment_reviews import ReviewStore
from selection_store import SelectionError, SelectionStore
ROOT=Path(__file__).resolve().parents[1]
SELECTIONS=SelectionStore(ROOT/'devtools/selections.json',ROOT/'devtools/catalog.json')
REVIEWS=ReviewStore(ROOT/'experiments/reviews',ROOT/'experiments/runs')
ALLOWED_ORIGINS=('http://127.0.0.1:5185','http://localhost:5185','https://0.taila30dc.ts.net:8445')
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**k):super().__init__(*a,directory=str(ROOT),**k)
 def _json(self,status,payload):
  b=json.dumps(payload).encode()
  self.send_response(status);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(b)
 def do_GET(self):
  if self.path=='/api/experiment-reviews':
   self._json(200,REVIEWS.latest())
  elif self.path=='/api/selections':
   self._json(200,SELECTIONS.load())
  else:super().do_GET()
 def do_POST(self):
  if self.path not in ('/api/selections','/api/selections/image','/api/experiment-reviews'):self.send_error(404);return
  if self.headers.get('Origin') not in ALLOWED_ORIGINS:self.send_error(403);return
  try:
   n=int(self.headers.get('Content-Length','0'))
   if not 0<n<1000000:raise ValueError()
   data=json.loads(self.rfile.read(n))
   if self.path=='/api/experiment-reviews':
    review=REVIEWS.save(data)
    self._json(200,{'saved':True,'review':review});return
   if self.path=='/api/selections/image':
    selections,species,image_path,selected=SELECTIONS.set_image(data)
    self._json(200,{'saved':True,'species':species,'path':image_path,'selected':selected,'selections':selections,'speciesSelections':selections.get(species,[])})
    return
   selections=SELECTIONS.replace(data)
  except (SelectionError,ValueError,TypeError,json.JSONDecodeError):self.send_error(400);return
  self._json(200,{'saved':True,'selections':selections})
if __name__=='__main__':
 ThreadingHTTPServer(('127.0.0.1',5185),Handler).serve_forever()
