#!/usr/bin/env python
# _*_ coding: utf-8 _*_
#
# Trivial HTTP server for testing
# supports python 2.6+ & 3.2+
#
import random
import sys
import os
try:
    from SimpleHTTPServer import SimpleHTTPRequestHandler as Handler
except ImportError:
    from http.server import SimpleHTTPRequestHandler as Handler
try:
    import SocketServer
except ImportError:
    import socketserver as SocketServer


def run_test_server(port):
    print('Start test server at 0.0.0.0:{0}'.format(port))
    server = SocketServer.TCPServer(('', port), Handler)
    server.serve_forever()

if __name__ == '__main__':
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = random.randint(8000, 9000)
    os.chdir(os.path.dirname(__file__))
    try:
        run_test_server(port)
    except KeyboardInterrupt:
        print('\nBuy')
