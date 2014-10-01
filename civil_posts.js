// ==UserScript==
// @name       FBCivilstatuses
// @namespace  FBPlugin
// @version    0.1
// @description  Blocks out incivil posts
// @match      http://*.facebook.com/*
// @match      https://*.facebook.com/*
// @require	http://code.jquery.com/jquery-latest.js
// @require https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant	GM_xmlhttpRequest
// @copyright  2012+, You
// ==/UserScript==

function should_i_hide_this_post(comment) {
    return true;
}

var attribute_key = "data-has-in-civil-post-been-processed";
$(window).scroll(function () {

    var all_news_feed_posts = document.getElementsByClassName("userContentWrapper");
    for (var i = 0; i < all_news_feed_posts.length; i++) {
        var news_feed_story = all_news_feed_posts[i];
        if (news_feed_story) {
            if (news_feed_story.hasAttribute(attribute_key)) {
                continue;
            } else {
                news_feed_story.setAttribute(attribute_key, true);
            }
            var user_posts_in_this_story = news_feed_story.getElementsByClassName("userContent");
            if (user_posts_in_this_story.length == 0) {
                continue;
            }
            var post_content = user_posts_in_this_story[0].innerText;
            console.log(post_content);
            if (should_i_hide_this_post(post_content)) {
                var text = news_feed_story.innerHTML;
                while (news_feed_story.firstChild) {
                    news_feed_story.removeChild(news_feed_story.firstChild);
                }
                var in_civil_instruction_text = document.createElement("span");

                var instruction_content = document.createTextNode("This is an impolite post. Click ");
                in_civil_instruction_text.appendChild(instruction_content);


                var here_link = document.createElement('a');
                here_link.appendChild(document.createTextNode("here"));
                here_link.onclick = function (nodeToWorkOn, t) {
                    nodeToWorkOn.innerHTML = t;
                }.bind(undefined, news_feed_story, text);
                in_civil_instruction_text.appendChild(here_link);

                in_civil_instruction_text.appendChild(document.createTextNode(" to view."));


                news_feed_story.appendChild(in_civil_instruction_text);
            }
        }
    }
});