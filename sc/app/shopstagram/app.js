(async () => {
  global.DEV = true;

  process.env.TZ = 'Asia/Seoul';
  require('../../module/share/base/global');
  require('../../module/share/base/Functional');
  Object.assign(global, Functional);
  global.dateFns = require('../../module/share/base/date-fns');
  require('../../module/share/base/DateFns');
  require('../../module/share/base/Ttl');
  Object.assign(global, Ttl);
  require('../../module/share/template/Tmpl');

  require('../../module/back/template/Tmpl.layout');
  require('../../module/share/template/Tmpl.post');

  var Express = require('express');
  var App = global.App = Express();
  var Path = require('path');
  var session = require('express-session');
  var RedisStore = require('connect-redis')(session);
  var compress = require('compression');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');

  App.use(compress());
  App.use(bodyParser.json({limit: '10mb'}));
  App.use(bodyParser.urlencoded({ extended: false }));
  App.use(cookieParser());
  App.use(require('stylus').middleware(Path.join(__dirname, '../../module')));
  App.use(Express.static(Path.join(__dirname, '../../module')));

  App.use(logger('dev'));

  App.use(session({
    secret: 'sc',
    store: new RedisStore({ host: 'localhost', port: 6379 }),
    saveUninitialized: false,
    rolling: true,
    resave: false,
    cookie: {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 3600000 * 24 * 7),
      maxAge: 3600000 * 24 * 7
    }
  }));

  require('../../module/back/orm/Orm');
  const { QUERY, QUERY1, TRANSACTION } = await Orm.CONNECT();
  global.SELECT = Orm.SELECT;
  global.FROM = Orm.FROM;
  global.WHERE = Orm.WHERE;
  global.INSERT = Orm.INSERT;
  global.RALL = Orm.RALL;
  global.QUERY = QUERY;
  global.QUERY1 = QUERY1;
  global.TRANSACTION = TRANSACTION;

  App.use(function(req, res, next) {
    res.send = res.send.bind(res);
    res.json = res.json.bind(res);
    next();
  });

  require('./route');
  require('./error');

  var server = App.listen(7000, function() {
    console.log('Express server listening on port ' + server.address().port);
  });
}) ();