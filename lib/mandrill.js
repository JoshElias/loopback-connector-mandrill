/**
 * Dependencies
 */

var Mandrill = require('mandrill-api/mandrill'),
  assert = require('assert'),
  loopback = require('../../loopback'),
  _ = require('lodash'),
  Q = require('q'),
  util = require("util");
/**
 * Export the connector class
 */

module.exports = MandrillConnector;

/**
 * Configure and create an instance of the connector
 */

var connection;
var settings;

function MandrillConnector(_settings) {

  assert(typeof _settings === 'object', 'cannot init connector without settings');

  settings = _settings;
  if (loopback.isServer) {
    connection = new Mandrill.Mandrill(settings.apiKey);
  }
}


function getConnection() {
  if(!connection) {
    connection = new Mandrill.Mandrill(settings.apiKey);
  }
  return connection;
}

/*
MandrillConnector.initialize = function (dataSource, callback) {
  console.log("calling init");
  dataSource.connector = new MandrillConnector(dataSource.settings);
  callback();
};
*/

MandrillConnector.prototype.DataAccessObject = Mailer;

function Mailer() {

}


/**
 * Send transactional email with options
 *
 * Basic options:
 *
 * {
 *   from: { name: "evenemento", email: "crew@evenemento.co" },
 *   to: "hello@evenemento.co",
 *   subject: "Ho ho",
 *   text: "Plain text message",
 *   html: "<b>Html messages</b> put here"
 * }
 *
 * Full list of options are available here:
 * https://mandrillapp.com/api/docs/messages.nodejs.html#method=send
 *
 * if option `template' is set than message will be send as template:
 *
 * {
 *   from: { name: "evenemento", email: "crew@evenemento.co" },
 *   to: "hello@evenemento.co",
 *   subject: "Ho ho",
 *   template: {
 *      name: "signup-confirm",
 *      content: {
 *        name: "NewUser Name",
 *        accountId: "123456"
 *      }
 *   }
 * }
 *
 * https://mandrillapp.com/api/docs/messages.nodejs.html#method=send-template
 *
 *
 * @param {Object} options
 * @param {Function} callback
 */

Mailer.send = function (options, cb) {
  var //dataSource = this.dataSource,
    //settings = dataSource && dataSource.settings,
    //connector = dataSource.connector,
    deferred = Q.defer(),
    mandrilMessage = {
      message: {}
    };

  var fn = function (err, result) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(result);
    }
    cb && cb(err, result);
  };

  assert(getConnection(), 'Cannot send mail without a connection!');

  if (getConnection()) {

    var template_name = options.template.name;
    var template_content = options.template.content || [];
    var message = {
        "subject": options.subject || "",
        "from_email": options.from.email,
        "from_name": options.from.name,
        "to": [{
            "email": options.to.email,
            "name": options.to.name,
            "type": "to"
        }]
    }

    // Are we sending vars with our template?
    if(Array.isArray(options.vars)) {
        message.merge = true;
        message.merge_language = "mailchimp";
        message.merge_vars = options.vars;
    }

    // Including any tags
    if(Array.isArray(options.tags)) {
      message.tags = options.tags
    }
    
    getConnection().messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message}, 
      function(result) {
        fn(null, result);
    }, function (err) {
        fn(err, null);
    });

  } else {
    console.warn('Warning: no connectiom with Mandrill');
    process.nextTick(function () {
      fn(null, options);
    });
  }
  return deferred.promise;
};

/**
 * Send an email instance using instance
 */

Mailer.prototype.send = function (fn) {
  return this.constructor.send(this, fn);
};


Mailer.subaccounts = function () {

  //var connector = this.dataSource.connector;

  return {
    list: function (query, cb) {

      var deferred = Q.defer();

      if (_.isFunction(query) && !cb) {
        cb = query;
      }

      getConnection().subaccounts.list({q: query}, function (result) {
        deferred.resolve(result);
        cb && cb(null, result);
      }, function (error) {
        deferred.resolve(error);
        cb && cb(error);
      });

      return deferred.promise;
    },

    add: function (subaccount, cb) {
      var //dataSource = this.dataSource,
        //connector = dataSource.connector,
        deferred = Q.defer();


      getConnection().subaccounts.add(subaccount, function (result) {
        deferred.resolve(result);
        cb && cb(null, result);
      }, function (error) {
        deferred.resolve(error);
        cb && cb(error);
      });

      return deferred.promise;
    },
    info: function (id, cb) {
      var //dataSource = this.dataSource,
        //connector = dataSource.connector,
        deferred = Q.defer();

      getConnection().mandrill.subaccounts.info({id: id}, function (result) {
        deferred.resolve(result);
        cb && cb(null, result);
      }, function (error) {
        deferred.resolve(error);
        cb && cb(error);
      });

      return deferred.promise;

    },
    update: function (subaccount, cb) {

      var //dataSource = this.dataSource,
        //connector = dataSource.connector,
        deferred = Q.defer();


      getConnection().mandrill.subaccounts.update(subaccount, function (result) {
        deferred.resolve(result);
        cb && cb(null, result);
      }, function (error) {
        deferred.resolve(error);
        cb && cb(error);
      });

      return deferred.promise;
    },
    delete: function (id, cb) {
      var //dataSource = this.dataSource,
        //connector = dataSource.connector,
        deferred = Q.defer();

      getConnection().subaccounts.delete({id: id}, function (result) {
        deferred.resolve(result);
        cb && cb(null, result);
      }, function (error) {
        deferred.resolve(error);
        cb && cb(error);
      });

      return deferred.promise;

    },
    pause: function (id, cb) {
      var //dataSource = this.dataSource,
        //connector = dataSource.connector,
        deferred = Q.defer();

      getConnection().subaccounts.pause({id: id}, function (result) {
        deferred.resolve(result);
        cb && cb(null, result);
      }, function (error) {
        deferred.resolve(error);
        cb && cb(error);
      });

      return deferred.promise;

    },
    resume: function (id, cb) {
      var //dataSource = this.dataSource,
        //connector = dataSource.connector,
        deferred = Q.defer();

      getConnection().subaccounts.resume({id: id}, function (result) {
        deferred.resolve(result);
        cb && cb(null, result);
      }, function (error) {
        deferred.resolve(error);
        cb && cb(error);
      });

      return deferred.promise;
    }
  }
};
