import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template
import json
import time
import random
import socket
import string
import os
import pyqrcode

server = 'http://127.0.0.1:8080'

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        loader = tornado.template.Loader(".")
        self.write(loader.load("index.html").generate())

class QrHandler(tornado.web.RequestHandler):
    def get(self):
        try:
            session_id = self.get_argument('session_id', True)
            session_url = server + '/?session_id=' + session_id       
            qr = pyqrcode.create(session_url)
            qr.png(session_id + '.png', scale=5)
            file_name = session_id + '.png'
            buf_size = 4096
            self.set_header('Content-Type', 'image/png')
            self.set_header('Content-Disposition', 'attachment; filename=' + file_name)
            with open(file_name, 'rb') as f:
                while True:
                    data = f.read(buf_size)
                    if not data:
                        break
                    self.write(data)
            self.finish()
        except AssertionError:
            self.write("no params")


class WSHandler(tornado.websocket.WebSocketHandler):
    connections = set()
    session_id = None
    is_extension = False

    def open(self):
        self.connections.add(self)
        print('connection opened...')
        # self.write_message('This EO camera is really great')

    def on_message(self, message):
        print('received:', message)
        # self.write_message(message)
        message = json.loads(message)
        if message['action'] == 'register':
            if message.get('session_id'):
                self.session_id = message['session_id']
            else:
                self.session_id = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))
                self.is_extension = True
                self.write_message({'action': 'registered', 'session_id': self.session_id})
            for con in self.connections:
                print('http://127.0.0.1:8080/?session_id=' + con.session_id)
            def is_available_extension_connection(self):
                for con in self.connections:
                    if con.session_id == self.session_id and con.is_extension:
                        return True
                return False
            if not is_available_extension_connection(self):
                self.close()

        else:   
            for con in self.connections:
                if con.session_id == self.session_id:
                    con.write_message(message)

    def on_close(self):
        if self.is_extension:
            for con in self.connections:
                    if con.session_id == self.session_id:
                        con.close()
                        print('connection closed...', con.session_id)
        else:            
            self.connections.remove(self)
            print('connection remove...', self.session_id)

    def check_origin(self, origin):
        return True


application = tornado.web.Application([
    (r'/', MainHandler),
    (r'/ws', WSHandler),
    (r"/qr/", QrHandler),
    (r"/(.*)", tornado.web.StaticFileHandler, {"path": "./resources"}),
    
])

if __name__ == "__main__":
    application.listen(8080, address="0.0.0.0")
    tornado.ioloop.IOLoop.instance().start()
