# -*- coding: utf-8 -*-

from django import forms
from models import ChatUser

from django.contrib.auth.models import User


class ChatUserForm(forms.ModelForm):
    class Meta:
        model = ChatUser
        exclude = ['authent_key', 'sessid']

    def clean_nickname(self):
        nickname = self.cleaned_data['nickname']
        try:
            ChatUser.objects.get(nickname=nickname)
        except:
            return nickname
        else:
            raise forms.ValidationError('Nickname already used')

    def save(self, *args, **kwargs):
        authent_key = User.objects.make_random_password()
        self.instance.authent_key = authent_key
        return super(ChatUserForm, self).save(*args, **kwargs)
