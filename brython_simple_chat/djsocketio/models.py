# -*- coding: utf-8 -*-

from django.db import models

# Create your models here.


class ChatUser(models.Model):
    nickname = models.CharField(max_length=45)
    authent_key = models.CharField(max_length=120)
    sessid = models.CharField(u"Socket Session ID", max_length=25, blank=True)

    class Meta:
        verbose_name = ('ChatUser')
        verbose_name_plural = ('ChatUsers')

    def __unicode__(self):
        return self.nickname


class ChatLine(models.Model):
    timestamp = models.DateTimeField()
    line = models.CharField(max_length=250)
    user = models.ForeignKey(ChatUser, on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name = ('ChatLine')
        verbose_name_plural = ('ChatLines')

    def __unicode__(self):
        return u'%s > %s ' % (self.user, self.line)

