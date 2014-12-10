var Firebase = require('firebase')
var firebase_url = 'https://politeness-classfier.firebaseio.com/'
var firebase_root = new Firebase(firebase_url)
var firebase_to_add_verdicts = firebase_root.child('queue_processed')
var request = require('request');


firebase_root.child("queue").on("child_added", function (snapshot) {

  var getter = function get_snap_shot(snap) {
    return snap
  }.bind(null, snapshot);
  request.post(
    'http://54.186.143.198:5000/politeness',
    {
      form: {
        sentence: snapshot.val().comment
      }
    },
    function (error, response, body) {
      body = JSON.parse(body);
      if (!error && response.statusCode == 200) {
        var snapshott = getter();
        var verdict = body.score;
        //console.log(snapshott.val().comment);
        //console.log(body.score);
        if ('Impolite' === body.score) {
          firebase_to_add_verdicts.child(snapshott.key()).set({
            comment: snapshott.val().comment,
            verdict: body.score

          });
          firebase_root.child(snapshott.val().user).child("post_content").child(snapshott.key()).set(
            {
              comment: snapshott.val().comment,
              verdict: body.score
            }
          );
        }

      }
    }
  );
})

