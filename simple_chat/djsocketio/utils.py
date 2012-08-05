# -*- coding: utf-8 -*-


from models import ChatUser, ChatLine


def last_lines(number):
    lines = ChatLine.objects.all().order_by('-timestamp')[:number]
    for line in reversed(lines):
        nick = "NC"
        if line.user:
            nick = line.user.nickname
        yield (nick, line.line)


def chat_stats():
    number_lines = ChatLine.objects.all().count()
    number_users = ChatUser.objects.all().count()
    return (number_users, number_lines)
