__author__ = 'sn'
from firebasin import Firebase
import graphviz

g = graphviz.Graph()
def is_this_comment_impolite(comment):
    print "Comment: ", comment

    return True







firebase_url = 'https://politeness-classfier.firebaseio.com/'

firebase_root = Firebase(firebase_url)


def data(snap):
    answer = is_this_comment_impolite(snap.val())
    permalink = snap.ref()

    permalink.remove()

firebase_root.child("queue").on("child_added", data)




