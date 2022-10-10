var request = require('request');

function callTonnieAPI(email, fullName, done) {
  var requestObj = {
    email,
    fullName,
  };
  request.post(
    {
      url: 'https://tonnietalent-api.herokuapp.com/api/users/oauth',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestObj),
    },
    function (err, res, responseBody) {
      if (err) {
        console.log(err);
        done(err, null);
      } else {
        console.log('*** requestObj *** -->', requestObj);
        console.log('*** callTonnieAPI *** -->', responseBody);
        done(null, JSON.parse(responseBody));
      }
    }
  );
}

function callMeAPI(accessToken, done) {
  request.get(
    {
      url: 'https://api.linkedin.com/v2/me',
      headers: { Authorization: 'Bearer ' + accessToken },
    },
    function (err, res, responseBody) {
      if (err) {
        console.log(err);
        done(err, null);
      } else {
        console.log('*** callMeAPI *** -->', responseBody);
        done(null, JSON.parse(responseBody));
      }
    }
  );
}

function callEmailAPI(accessToken, done) {
  request.get(
    {
      url: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      headers: { Authorization: 'Bearer ' + accessToken },
    },
    function (err, res, responseBody) {
      if (err) {
        console.log(err);
        done(err, null);
      } else {
        console.log('*** callEmailAPI *** -->', responseBody);
        done(null, JSON.parse(responseBody));
      }
    }
  );
}

function main(authCode, done) {
  getAccessToken(authCode, function (err, res) {
    if (err) {
      done(err);
    } else {
      var access_token = res.access_token;
      callMeAPI(access_token, function (err, res) {
        if (err) {
          done(err);
        } else {
          var firstname = res.localizedFirstName;
          var lastname = res.localizedLastName;
          var fullName = firstname + '' + lastname;
          console.log('*** firstname *** -->', firstname);
          console.log('*** lastname *** -->', lastname);
          console.log('*** fullName *** -->', fullName);
          callEmailAPI(access_token, function (err, res) {
            if (err) {
              done(err);
            } else {
              var email = res.elements[0]['handle~'].emailAddress;
              console.log('*** email *** -->', email);
              callTonnieAPI(email, fullName, function (err, res) {
                if (err) {
                  done(err);
                } else {
                  done(null, 'success');
                }
              });
              done(null, 'success');
            }
          });
        }
      });
    }
  });
}

function getAccessToken(authCode, done) {
  request.post(
    {
      url: 'https://www.linkedin.com/oauth/v2/accessToken',
      form: {
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri:
          'https://x5l42nol3g.execute-api.us-east-1.amazonaws.com/default/linkedin',
        client_id: '869hh4yjzow1at',
        client_secret: 'koFoGY7PWOWiDCoT',
      },
    },
    function (err, res, responseBody) {
      if (err) {
        console.log(err);
        done(err, null);
      } else {
        console.log('*** getAccessToken *** -->', responseBody);
        done(null, JSON.parse(responseBody));
      }
    }
  );
}

exports.handler = (event, context, callback) => {
  const done = (err, res) =>
    callback(null, {
      statusCode: err ? '400' : '302',
      body: err ? err.message : JSON.stringify(res),
      headers: {
        Location:
          'https://www.figma.com/proto/ZQJiEiTOl2SPrNw6FVq3XX/Tonnie?page-id=1%3A22&node-id=80%3A27732&viewport=1626%2C1108%2C0.13&scaling=contain&starting-point-node-id=80%3A27518&show-proto-sidebar=1',
        'Content-Type': 'text/html',
        'Access-Control-Allow-Methods':
          'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT',
        'Access-Control-Allow-Headers':
          'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin': '*',
      },
    });
  console.log('*** exports.handler ***');
  if (event) {
    switch (event.httpMethod) {
      case 'GET':
        if (
          event &&
          event.queryStringParameters &&
          event.queryStringParameters.code &&
          event.queryStringParameters.state
        ) {
          var state = decodeURIComponent(event.queryStringParameters.state);
          var code = decodeURIComponent(event.queryStringParameters.code);
          console.log('*** state ***', state);
          console.log('*** code ***', code);

          main(code, done);
        } else {
          console.log(
            'ERROR:  Malformed query parameters. Expected code and state.'
          );
          done(
            new Error(
              '<h1>Something went wrong. Please go back and use the email signup instead.</h1>'
            )
          );
        }
        break;
    }
  }
};

// callTonnieAPI(
//   'decollino@gmail.com',
//   'Andre Bernardes',
//   function (a, b) {}
// );
