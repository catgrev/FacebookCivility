// ==UserScript==
// @name       FB Plugin
// @namespace  FBPlugin
// @version    0.1
// @description  enter something useful
// @match      https://*.facebook.com/*
// @match      http://*.facebook.com/*
// @require 	http://code.jquery.com/jquery-latest.js
// @require 	https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require 	https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.11.2/URI.min.js
// @require 	https://cdn.firebase.com/js/client/1.1.2/firebase.js
// @grant GM_xmlhttpRequest
// @copyright  2012+, You
// ==/UserScript==

console.log("lol");



function is_undefined(x) {
    return typeof x == "undefined";
}

function get_root_url() {
    return new Firebase("https://politeness-classfier.firebaseio.com/");
}

function are_we_on_civil_page() {
    return URI(document.URL).hasQuery("show_incivil", "true");
}

function get_span_of_story(new_feed_element) {
    if (is_undefined(new_feed_element)) {
        return undefined;
    }
    var text = new_feed_element.innerText.trim();
    if (!(text.indexOf("News Feed") > -1)) {
        return undefined;
    }
    var innerTextDiv = new_feed_element.getElementsByClassName("linkWrap")[0];
    if (is_undefined(innerTextDiv)) {
        return undefined;
    }
    var innerText = innerTextDiv.getElementsByTagName('span')[0];
    if (is_undefined(innerText)) {
        return undefined;
    }
    return innerText;
};

function should_i_hide_this_post(comment) {
    return true;
}

function filter_out_incivil_posts() {
    var attribute_key = "data-has-in-civil-post-been-processed";
    $(window).scroll(function () {
        if (are_we_on_civil_page()) {
            return;
        }

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
                var post_content = news_feed_story.innerText;

                if (should_i_hide_this_post(post_content)) {

                    console.log(get_root_url().push("lololo"));
                }
            }
        }
    });
};

$(document).ready(
    function () {
        var new_feed_element = document.getElementsByClassName("sideNavItem")[0];
        var innerText = get_span_of_story(new_feed_element);
        if (is_undefined(innerText)) {
            return;
        }
        var cloned_node = new_feed_element.cloneNode(true);
        cloned_node.className = cloned_node.className.replace('selectedItem', '');
        var span_of_cloned = get_span_of_story(cloned_node);
        span_of_cloned.textContent = "Incivil";
        var down_arrow_to_remove = cloned_node.getElementsByClassName("uiPopover")[0];
        if (!is_undefined(down_arrow_to_remove)) {
            down_arrow_to_remove.remove();
        }

        var link_of_the_node = cloned_node.getElementsByTagName('a')[0];

        if (!is_undefined(link_of_the_node)) {
            link_of_the_node.setAttribute("title", "Incivility on FB");
            link_of_the_node.setAttribute("href", "?sk=nf&show_incivil=true");
        }

        $(cloned_node).insertAfter(new_feed_element);


        filter_out_incivil_posts();


    }
);
