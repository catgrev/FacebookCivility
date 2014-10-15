// ==UserScript==
// @name       FB Plugin
// @namespace  FBPlugin
// @version    0.1
// @description  enter something useful
// @match      https://*.facebook.com/*
// @match      http://*.facebook.com/*
// @require http://code.jquery.com/jquery-latest.js
// @require https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.11.2/URI.min.js
// @grant GM_xmlhttpRequest
// @copyright  2012+, You
// ==/UserScript==

function is_undefined(x) {
    return typeof x == "undefined";
}

function get_span_of_story(new_feed_element) {
    if(is_undefined(new_feed_element)) {
        return undefined;
    }
    var text = new_feed_element.innerText.trim();
    if(!(text.indexOf("News Feed") > -1)) {
        return undefined;
    }
    var innerTextDiv = new_feed_element.getElementsByClassName("linkWrap")[0];
    if (is_undefined(innerTextDiv)) {
        return undefined;
    }
    var innerText = innerTextDiv.getElementsByTagName('span')[0];
    if(is_undefined(innerText)) {
        return undefined;
    }
    return innerText;
}; 

function filter_out_incivil_posts() {
  
};

$(document).ready(
    function() {
        var new_feed_element = document.getElementsByClassName("sideNavItem")[0];
        var innerText = get_span_of_story(new_feed_element);
        if(is_undefined(innerText)) {
            return;
        }
        var cloned_node = new_feed_element.cloneNode(true);
        cloned_node.className = cloned_node.className.replace('selectedItem','');
        var span_of_cloned = get_span_of_story(cloned_node);
        span_of_cloned.textContent = "Incivil";
        var down_arrow_to_remove = cloned_node.getElementsByClassName("uiPopover")[0];
        if(!is_undefined(down_arrow_to_remove)) {
            down_arrow_to_remove.remove();
        }
        
        var link_of_the_node = cloned_node.getElementsByTagName('a')[0];
        
        if(!is_undefined(link_of_the_node)) {
            link_of_the_node.setAttribute("title", "Incivility on FB");
            link_of_the_node.setAttribute("href", "?sk=nf&show_incivil=true");
        }
        
        $(cloned_node).insertAfter(new_feed_element);

        
        var are_we_showing_incivil_page = URI(document.URL).hasQuery("show_incivil", "true");
        
        if(are_we_showing_incivil_page) {
          
        } else {
          filter_out_incivil_posts();
        }
        
        
        
        
    }
);

