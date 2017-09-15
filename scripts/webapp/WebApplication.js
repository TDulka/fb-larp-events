const express = require('express');
const fs = require('fs');
const app = express();
const MongoEvents = require('../database/MongoEvents.js');
const SqlEvents = require('../database/SqlEvents.js');
const FbEvents = require('../service/FbEvents.js');
const ScheduledEvents = require('../service/ScheduledEvents.js');
const EventsController = require('../controller/EventsController.js');

/**
 * class representing the web application
 */
class WebApplication{
  /**
   * create webapplication with properties linking to databases
   */
  constructor(databases){
    this._mongoDB = databases[0];
    this._pgPool = databases[1];
  }

  /**
   * setup the application
   * initiate mongoEvents and sqlEvents for interacting with the databases,
   * scheduledEvents for regularly getting the events from facebook
   * controller for managing user requests
   */
  setup(){
    const mongoEvents = new MongoEvents(this._mongoDB);
    const sqlEvents = new SqlEvents(this._pgPool);
    this.schedule(mongoEvents);
    this.schedule(sqlEvents);

    const controller = new EventsController(app, mongoEvents);

    app.listen(process.env.PORT || 5000);
    this.clientside();
  }

  /**
   * schedule updating of the specified database
   * @param db - instance of class for interacting with events in the database
   */
  schedule(db){
    const fbEvents = new FbEvents();
    const scheduledEvents = new ScheduledEvents(fbEvents, db);
    scheduledEvents.schedule();
  }

  /**
   * run the client side of the app
   */
  clientside(){
    app.set('views', __dirname + "/../../views");
    app.set('view engine', 'ejs');

    app.get('/', function(req, res){
      res.render("index");
    });

    app.get('/clientscript.js', function (req, res){
      const script = fs.readFileSync(app.get('views') + "/clientscript.js", "utf8");
      res.end(script);
    });
  }

}

module.exports = WebApplication;