var apiCall = function(apiUrl, callback) {
  try {
    var response = HTTP.get(apiUrl).data;
    callback(null, response);
  } catch (error) {
    if (error.response) {
      var errorCode = error.response.data.code;
      var errorMessage = error.response.data.message;
    } else {
      var errorCode = 500;
      var errorMessage = 'Cannot access the API';
    }
    var myError = new Meteor.Error(errorCode, errorMessage);
    callback(myError, null);
  }
};


Meteor.methods({
  'callWordpress':
  // takes site WITH slash and directive .. just appends the two together
  function(site, directive) {
    if (typeof site != "undefined" && typeof site == "string" && site != '' && typeof directive != "undefined"
      && typeof directive == "string" && directive != '')
      this.unblock();
    var response = Meteor.wrapAsync(apiCall)(site);
    if (response && typeof response.posts != "undefined") {
      response.posts.filter(function(arr) {
        // avoid entering same id?
        arr._id = arr.id + '';
        if (Wordpress.findOne({
          _id: arr.id + ""
        })) {
          Wordpress.upsert(arr._id, arr)
        } else {
          Wordpress.insert(arr);
        }
      });
    }
    return response;
  }
});


Meteor.publish("wordpress", function(site, directive) {
  if (typeof site != "undefined" && typeof site == "string" && site != '') {
    if (typeof directive == "undefined" || typeof directive != "string" || directive == '') {
      directive = "json=get_recent_posts";
    }
    this.unblock();
    var q = Meteor.wrapAsync(site + '?' + directive)(site);
    if (q.status == "ok") {
      var respJson = JSON.parse(q);
      if (respJson && typeof respJson.posts != "undefined") {
        respJson.posts.filter(function(arr) {
          // avoid entering same id?
          arr._id = arr.id + '';
          if (Wordpress.findOne({
            _id: arr.id + ""
          })) {
            Wordpress.upsert(arr._id, arr)
          } else {
            Wordpress.insert(arr);
          }
        });
        return Wordpress.find();
      } else {
        this.ready();
      }
    } else {
      this.ready();
      return {
        error: q.status
      };
    }
  }
  this.ready();
});


Meteor.publish("wpPost", function(id) {
  return Wordpress.find({
    _id: id + ""
  });
});
