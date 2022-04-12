var express = require("express");
var noblox = require("noblox.js");
var fs = require("fs");
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var router = express.Router();

const app = require('../app');

const authTokens = {};

const { Connection, Request } = require("tedious");

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString('hex');
}

const config = {
  authentication: {
    options: {
      userName: "wondies",
      password: "Hx3&xz1WexNZMpfn4hsG"
    },
    type: "default"
  },
  server: "wonderworks.database.windows.net",
  options: {
    database: "wonderworks",
    encrypt: true,
    rowCollectionOnRequestCompletion: true
  }
};

const connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on("connect", err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected");
  }
});

connection.connect();

router.use((req, res, next) => {
  const authToken = req.cookies['AuthToken'];

  var request = new Request(`SELECT * FROM dbo.authkeys WHERE authKey='${authToken}'`, (err, rowCount, rows) => {
    if (err) {
      console.error(err.message);
    }

    console.log(rows);
  });

  // request.on('row', function(columns) {
  //   req.user = columns[1].value;
  // });

  connection.execSql(request);

  next();
})

//atuohqr92uTMqnKaMMHei9TL

async function getPlayerCounts() {
  let ob, traitor, timmeh, frootloops, metamall, total = 0;

  await noblox.getUniverseInfo([ 1751969566 ]).then(function(tbl) {
    ob = tbl[0].playing
  });

  await noblox.getUniverseInfo([ 2228268891 ]).then(function(tbl) {
    traitor = tbl[0].playing
  });

  await noblox.getUniverseInfo([ 2840293335 ]).then(function(tbl) {
    timmeh = tbl[0].playing
  });

  await noblox.getUniverseInfo([ 3152786719 ]).then(function(tbl) {
    frootloops = tbl[0].playing;
  });

  await noblox.getUniverseInfo([ 3350220205 ]).then(function(tbl) {
    metamall = tbl[0].playing;
  });

  total = ob + traitor + timmeh + metamall

  return {ob, traitor, timmeh, frootloops, metamall, total};
}

async function getUserInfo(userId) {
  let username = "null";
  let image = null;

  await noblox.getUsernameFromId(userId).then((user) => {
    username = user;
  });

  await noblox.getPlayerThumbnail(userId, 420, "png", true, "headshot").then((img) => {
    image = img[0].imageUrl;
  });

  return {username, image};
}

async function getUserId(username) {
  if(isNaN(username)) {
    return await noblox.getIdFromUsername(username);
  } else {
    return username;
  }
}

async function addUserToDatabase(email, name, passwordHash) {
  var request = new Request(`INSERT INTO dbo.users (email, name, password) VALUES ('${email}', '${name}', '${passwordHash}')`, (err, rowCount) => {
    if (err) {
      console.error(err.message);
    }
  });

  connection.execSql(request);
}

router.get("/", function(req, res, next) {
  res.render("login");
});

router.get("/login", function(req, res, next) {
  res.render("login");
});

router.get("/dashboard", function(req, res, next) {
  console.log(req.user);
  if (req.user) {
    getPlayerCounts().then(function(result) {
      res.render("dashboard-v1", result);
    })
  } else {
    res.render('login');
  }
});

router.get("/users/:userId", function(req, res, next) {
  if (req.params.userId) {
    getUserInfo(req.params.userId).then(function(info) {
      console.log(info);
      res.render("profile", info);
    });
  } else {
    res.send("ERROR: No user id specified in URL");
  }
});

router.get("/search", function(req, res, next) {
  res.render("search");
});

router.get("/manage-accounts", function(req, res, next) {
  res.render("manage-accounts", {
    email: null,
    name: null,
    password: null
  });
});

router.get("/test", function(req, res, next) {
  res.render("test");
});

router.post("/handle-search", (req, res) => {
  const username = req.body.username;

  if (username) {
    getUserId(username).then((id) => {
      res.redirect("/users/" + id);
    })
  }
});

router.post("/handle-account-creation", (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  bcrypt.hash(password, 10, function(err, hash) {
    if (err) {
      console.error(err);
    }

    addUserToDatabase(email, name, hash).then(() => {
      res.render("manage-accounts", {
        email: email,
        name: name,
        password: password
      });
    });
  });
});

router.post("/login", (req, res) => {
  const {email, password} = req.body;

  var request = new Request(`SELECT * FROM dbo.users WHERE email='${email}'`, (err, rowCount, rows) => {
    if (err) {
      console.error(err.message);
    }
  });

  request.callback = function(err,rowCount,rows) {
    if(err) {
      console.error(err.message);
    }

    if (!rows || !rows[0]) {
      return;
    }
    var thisRow = rows[0];
    var passHash = thisRow[3].value;

    console.log(passHash);
    bcrypt.compare(password, passHash, function(thisError, result) {
      if (thisError) {
        console.error(thisError);
      }

      console.log(result);

      if (result == true) {
        const authToken = generateAuthToken();

        connection.execSql(new Request(`INSERT INTO dbo.authkeys (authKey, uid) VALUES('${authToken}', 1)`, () => {
          res.cookie('AuthToken', authToken);
          res.redirect('/dashboard');
        }))
      }
    })
  }

  connection.execSql(request);
})


module.exports = router;