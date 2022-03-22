var express = require("express");
var noblox = require("noblox.js");
var router = express.Router();

async function getPlayerCounts() {
  let ob, traitor, timmeh = 0;

  await noblox.getUniverseInfo([ 1751969566 ]).then(function(tbl) {
    ob = tbl[0].playing
  });

  await noblox.getUniverseInfo([ 2228268891 ]).then(function(tbl) {
    traitor = tbl[0].playing
  });

  await noblox.getUniverseInfo([ 2840293335 ]).then(function(tbl) {
    timmeh = tbl[0].playing
  });

  return {ob, traitor, timmeh};
}

async function getUserInfo(userId) {
  let username = "null";

  await noblox.getUsernameFromId(userId).then(function (user) {
    username = user;
  });

  return {username};
}

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/login", function(req, res, next) {
  res.render("login");
});

router.get("/dashboard", function(req, res, next) {
  getPlayerCounts().then(function(result) {
    res.render("dashboard-v1", result);
  })
});

router.get("/users/:userId", function(req, res, next) {
  if (req.params.userId) {
    getUserInfo(req.params.userId).then(function(info) {
      res.render("profile", info);
    });
  } else {
    res.send("ERROR: No user id specified in URL");
  }
})

module.exports = router;