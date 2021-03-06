var $ = require('./libs/jquery');
var Firebase = require('firebase');
var URI = require('URIjs');

/**
 * Checks if given reference is undefined or not
 * @param x any reference
 * @returns true/false
 */
function is_undefined(x) {
  return typeof x === "undefined";
}

/**
 * Returns the root of our firebase directory
 * @returns {O}
 */
function get_root_url() {
  return new Firebase("https://politeness-classfier.firebaseio.com/");
}

/**
 * Sees if we are on the civil news feed page
 * @returns {boolean}
 */
function are_we_on_civil_page() {
  return URI(document.URL).hasQuery("show_incivil", "true");
}

/**
 * Removes all elements matching a certain class name
 * @param node_to_remove_from
 * @param class_name_to_remove
 */
function remove_elements_by_class(node_to_remove_from, class_name_to_remove) {
  var elements = node_to_remove_from.getElementsByClassName(class_name_to_remove);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

/**
 * removes firebase sensitive characters from the given string
 * @param string_to_clean
 * @returns {string}
 */
function firebase_safe(string_to_clean) {
  var to_ret = string_to_clean;
  to_ret += '';
  to_ret = to_ret.replace(/\./g, '__');
  to_ret = to_ret.replace(new RegExp('/', 'g'), "-");
  return to_ret;
}

function is_blank(str) {
  return (!str || /^\s*$/.test(str));
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
}


function should_i_hide_this_post(comment, story_perma_link, news_feed_story, news_feed_user) {
  function lol(pm_link, ns_story) {
    get_root_url().child("queue_processed").child(pm_link).on("value", function (data) {
      if (data.val() != null && data.val()['verdict'] === 'Impolite') {
        while(!ns_story.hasAttribute("data-cursor")) {
          ns_story = ns_story.parentNode;
        }
        if (ns_story === document) {
          return
        }
        ns_story.parentNode.removeChild(ns_story);
      }
    });
  };


  lol.bind(undefined, story_perma_link, news_feed_story)();

  get_root_url().child("queue").child(story_perma_link).set({comment: comment, user: news_feed_user})

  return true;
}

function get_permalink_for_news_feed(news_feed_story) {
  var time = news_feed_story.getElementsByClassName('clearfix')[0].getElementsByTagName('abbr')[0];
  if (is_undefined(time)) {
    return undefined;
  }
  var anchor_for_permalink = time.parentNode;

  if (is_undefined(anchor_for_permalink)) {
    return undefined;
  }

  if (!anchor_for_permalink.hasAttribute("href")) {
    return undefined;
  }
  var permalink_sanitized = anchor_for_permalink.getAttribute("href");

  return firebase_safe(permalink_sanitized);
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
        if (user_posts_in_this_story.length === 0) {
          continue;
        }

        var post_content_node = user_posts_in_this_story[0].cloneNode(true);
        remove_elements_by_class(post_content_node, "userContentSecondary");

        var post_content = post_content_node.innerText;
        if (is_blank(post_content)) {
          continue;
        }
        var profile_id = get_profile_url();
        var permalink_sanitized = get_permalink_for_news_feed(news_feed_story);
        if (should_i_hide_this_post(post_content, firebase_safe(permalink_sanitized), news_feed_story, profile_id)) {
          if (is_undefined(permalink_sanitized)) {
            continue;
          }
          var milliseconds = -1 * new Date().getTime();

          var to_update_value = function (html, priority) {
            return {'.value': html, '.priority': priority};
          }.bind(null, news_feed_story.outerHTML, milliseconds);
          var to_store_html_at = get_root_url().child(get_profile_url()).child("htmls").child(firebase_safe(permalink_sanitized))
            .transaction(function (currentData) {
              if (currentData) {
                return currentData;
              }
              return to_update_value();
            });
        }
      }
    }
  });
}


function add_incivil_news_feed() {
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
    }
  );
}

function get_profile_url() {
  var profile_url = $(".rfloat")[0].getElementsByTagName('a')[0];
  var the_username = URI(profile_url).segmentCoded(-1);
  return firebase_safe(the_username);
}

function remove_all_children_of(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function fill_in_incivil_posts_if_needed() {
  $(document).ready(
    function () {
      if(!are_we_on_civil_page()) {
        return
      }
      var root_element = document.getElementsByClassName("userContentWrapper")[0];
      while(!root_element.hasAttribute("id") || root_element.getAttribute("id").indexOf("topnews_main_stream") === -1) {
        root_element = root_element.parentNode;
      }
      remove_all_children_of(root_element)

       
    }
  )
}

(function () {
  // here we use SHARED message handlers, so all the contexts support the same
  // commands. but this is NOT typical messaging system usage, since you usually
  // want each context to handle different commands. for this you don't need
  // handlers factory as used below. simply create individual `handlers` object
  // for each context and pass it to msg.init() call. in case you don't need the
  // context to support any commands, but want the context to cooperate with the
  // rest of the extension via messaging system (you want to know when new
  // instance of given context is created / destroyed, or you want to be able to
  // issue command requests from this context), you may simply omit the
  // `hadnlers` parameter for good when invoking msg.init()
  var handlers = require('./modules/handlers').create('ct');
  require('./modules/msg').init('ct', handlers);


  add_incivil_news_feed();
  filter_out_incivil_posts();
  fill_in_incivil_posts_if_needed();
  console.log('jQuery version:', $().jquery);

})();

