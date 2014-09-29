// ==UserScript==
// @name       FB Plugin
// @namespace  FBPlugin
// @version    0.1
// @description  enter something useful
// @match      https://*.facebook.com/*
// @match      http://*.facebook.com/*
// @require	http://code.jquery.com/jquery-latest.js
// @require https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant	GM_xmlhttpRequest
// @copyright  2012+, You
// ==/UserScript==

function should_i_mask_comment (comment) {
    // TODO: figure out booleans in js
    return 1 > 0;
}

var next_available_index = 0;
var attribute_key = "data-comment-hash";
$(window).scroll(function () {
    //var list = document.getElementsByClassName("userContentWrapper");


    var list = document.getElementsByClassName("UFICommentBody");
    for(var i = 0; i < list.length; i++){

        var nodeContainingComment = list[i];
        if (nodeContainingComment) {
            if(nodeContainingComment.hasAttribute(attribute_key)) {
                continue;
            } else {
                nodeContainingComment.setAttribute(attribute_key, next_available_index++);
            }
            var commentNode = nodeContainingComment.childNodes[0];
            var comment = commentNode.innerText;
            if(should_i_mask_comment(comment)) {
                var text = nodeContainingComment.innerHTML;
                while (nodeContainingComment.firstChild) {
                    nodeContainingComment.removeChild(nodeContainingComment.firstChild);
                }
                var para = document.createElement("p");
                var node = document.createTextNode("This is an impolite comment. Click ");
                para.appendChild(node);
                var a = document.createElement('a');
                a.appendChild(document.createTextNode("here"));
                para.appendChild(a);
                a.onclick = function (nodeToWorkOn, t) {
                    nodeToWorkOn.innerHTML = t;
                }.bind(undefined, nodeContainingComment, text);
                para.appendChild(document.createTextNode(" to view."))
                nodeContainingComment.appendChild(para);
            }
        }
    }
});