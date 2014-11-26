var $ = require('./libs/jquery');
var Firebase = require('firebase');
var URI = require('URIjs');





function is_undefined(x) {
  return typeof x === "undefined";
}

function get_root_url() {
  return new Firebase("https://politeness-classfier.firebaseio.com/");
}

function are_we_on_civil_page() {
  return URI(document.URL).hasQuery("show_incivil", "true");
}

function remove_elements_by_class(doc, className) {
  var elements = doc.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function clean(string_clean) {
  var to_ret = string_clean;
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


function should_i_hide_this_post(comment, story_perma_link, news_feed_story) {
  function lol(pm_link, ns_story) {
    get_root_url().child("work_done").child(pm_link).on("value", function (data) {
      console.log(data.val())
      if (data.val() != null && data.val()['answer'] === 'true') {
        ns_story.parentNode.removeChild(ns_story);
      }
    });
  };



  lol.bind(undefined, story_perma_link, news_feed_story)();

  get_root_url().child("queue").child(story_perma_link).set({"comment": comment})



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

  return clean(permalink_sanitized);
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
        var permalink_sanitized = get_permalink_for_news_feed(news_feed_story);
        if (should_i_hide_this_post(post_content, clean(permalink_sanitized), news_feed_story)) {
          if (is_undefined(permalink_sanitized)) {
            continue;
          }
          var milliseconds = -1 * new Date().getTime();
          var to_set_at = get_root_url().child(get_profile_url()).child("posts").child(clean(permalink_sanitized));

          var to_update_value = function (html, priority) {
            return {'.value': html, '.priority': priority};
          }.bind(null, news_feed_story.outerHTML, milliseconds);
          var to_store_html_at = get_root_url().child(get_profile_url()).child("htmls").child(clean(permalink_sanitized))
            .transaction(function (currentData) {
              if (currentData) {

                return currentData;
              }
              return to_update_value();

            });
          to_set_at.set(post_content);
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

      var link_of_the_node = cloned_node.getElementsByTagName('a')[1];
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
  return clean(the_username);
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
  console.log('jQuery version:', $().jquery);

})();

