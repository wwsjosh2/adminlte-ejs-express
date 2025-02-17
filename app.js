var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var request = require("request");
var noblox = require("noblox.js");
var bodyParser = require('body-parser');

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();
app.locals.noblox = noblox;
// app.locals.testFunction = function() {
//   await noblox.getUniverseInfo([ 2152417643 ]).then(function(result) {
//     return result;
//   });
// }

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// membuat dependency (package) admin-lte di dalam node_modules menjadi static dan bisa di akses
app.use(
  "/script-adminlte",
  express.static(path.join(__dirname, "/node_modules/admin-lte/"))
);

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
