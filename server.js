var Firebase = require('firebase')
var firebase_url = 'https://politeness-classfier.firebaseio.com/'
var firebase_root = new Firebase(firebase_url)

firebase_root.child("queue").on("child_added", function (snapshot) {
  console.log("child added event")
  console.log(snapshot.val())
})
console.log("console log works");
firebase_root.child("lolol").set({no: "no"});
