# -*- coding: utf-8 -*-
import datetime
from gevent import monkey; monkey.patch_all()

from django.core.management.base import BaseCommand

from socketio import socketio_manage
from socketio.server import SocketIOServer
from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin

from djsocketio.models import ChatLine, ChatUser

from djsocketio.utils import last_lines, chat_stats


class DJChatNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):

    def on_lineslog(self):
        for nick, line in last_lines(5):
            self.emit_to_me('main_room', 'msg_to_room', nick, line)

    def on_authent_key(self, authent_key):
        try:
            user = ChatUser.objects.get(authent_key=authent_key)
            user.sessid = self.socket.sessid
            user.save()
        except:
            self.emit_to_me('main_room', 'need_reconnect')

    def on_nickname(self, nickname):
        self.request['nicknames'].append(nickname)
        self.socket.session['nickname'] = nickname
        self.broadcast_event('announcement', '%s has connected' % nickname)
        self.broadcast_event('nicknames', self.request['nicknames'])
        # Just have them join a default-named room
        self.join('main_room')
        self.send_stats()

    def recv_disconnect(self):
        # Remove nickname from the list.
        nickname = self.socket.session['nickname']
        self.request['nicknames'].remove(nickname)
        self.broadcast_event('announcement', '%s has disconnected' % nickname)
        self.broadcast_event('nicknames', self.request['nicknames'])
        user = None
        try:
            user = ChatUser.objects.get(sessid=self.socket.sessid)
        except:
            pass
        else:
            user.delete()
        self.disconnect(silent=True)
        self.send_stats()

    def on_user_message(self, msg):
        self.emit_to_room('main_room', 'msg_to_room',
            self.socket.session['nickname'], msg)
        user = None
        try:
            user = ChatUser.objects.get(sessid=self.socket.sessid)
        except:
            pass
        line = ChatLine(timestamp=datetime.datetime.now(), line=msg, user=user)
        line.save()
        if not ChatLine.objects.all().count() % 2:
            self.send_stats()

    def recv_message(self, message):
        print "PING!!!", message

    def emit_to_me(self, room, event, *args):
        pkt = dict(type="event",
                   name=event,
                   args=args,
                   endpoint=self.ns_name)
        self.socket.send_packet(pkt)

    def send_stats(self):
        nu, nl = chat_stats()
        self.broadcast_event('stat_room', nu, nl)


class Application(object):
    def __init__(self):
        self.buffer = []
        # Dummy request object to maintain state between Namespace
        # initialization.
        self.request = {
            'nicknames': [],
        }

    def __call__(self, environ, start_response):
        path = environ['PATH_INFO'].strip('/')

        if path.startswith("socket.io"):
            socketio_manage(environ, {'': DJChatNamespace}, self.request)
        else:
            return not_found(start_response)


def not_found(start_response):
    start_response('404 Not Found', [])
    return ['<h1>Not Found</h1>']


class Command(BaseCommand):
    help = 'Socket.io Server for Django'
    args = 'no argument'

    def handle(self, *app_labels, **options):
        print 'GO GO GO Socket IO'
        print 'Listening on port 8080 and on port 843 (flash policy server)'
        SocketIOServer(('0.0.0.0', 8080), Application(),
            resource="socket.io", policy_server=True,
            policy_listener=('0.0.0.0', 10843)).serve_forever()
