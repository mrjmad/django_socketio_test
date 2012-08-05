# -*- coding: utf-8 -*-

from django.conf.urls import patterns, url

urlpatterns = patterns('',
     url(r'^$', 'djsocketio.views.home', name='home'),
     url(r'^chat/(?P<nickname>.*)/(?P<authent_key>.*)$',
          'djsocketio.views.chat', name='chat'),
)
