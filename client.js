import {Session} from 'meteor/session';

Meteor.startup(function () {
  Session.set('wp-json-api-url', Meteor.settings.public.wordpress.url);
});

Handlebars.registerHelper("wpPosts", function (id) {
  // must provide own sub.. useful for custom templates
  if (typeof id == "undefined")
    return Wordpress.find();
  else
    return Wordpress.find({_id: id});
});

Template.wordpress_posts.onCreated(function () {
  // optional if one choses to use included templates.
  var self = this;
  self.autorun(function () {
    self.subscribe("wordpress", Meteor.settings.public.wordpress.url);
  });
});
