import http.server
import os

os.chdir('/Users/ivankuznecov/Desktop/nakoplen/dist')

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress logs

server = http.server.HTTPServer(('0.0.0.0', 8084), Handler)
server.serve_forever()
