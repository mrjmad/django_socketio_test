# -*- coding: utf-8 -*-

from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.core.urlresolvers import reverse

from forms import ChatUserForm
from utils import chat_stats


def chat(request, nickname, authent_key):
    nusers, nlines = chat_stats()
    return render(request, 'djsocketio/chat.html',
        {'nickname': nickname, 'authent_key': authent_key,
        'nusers': nusers, 'nlines': nlines})


def home(request):
    if request.method == 'POST':
        form = ChatUserForm(request.POST)
        if form.is_valid():
            instance = form.save()
            print instance.authent_key
            print instance.nickname
            return HttpResponseRedirect(reverse('chat', args=[instance.nickname,
                    instance.authent_key]))
    else:
        form = ChatUserForm()
    return render(request, 'djsocketio/home.html', {'form': form})

