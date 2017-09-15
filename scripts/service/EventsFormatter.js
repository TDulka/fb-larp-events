var Event = require('../database/Event.js');
var Locator = require('./Locator.js');
/**
 * class for formatting events
 */

class FormatEvents{
  /**
   * @param {Object[]} data - array of objects received and put together from FB
   * @return {Event[]} events - array of Events
   */
  format(data){
    var events = this.organize(data);
    events = this.filter(events);
    events = this.localize(events);
    events = this.classify(events);
    return events;
  }

  /**
   * Puts all events in one flat array, discards empty objects,
   * makes things organized
   * @param {Object[]} data - array of objects received and put together from FB
   * @return {Object[]} events - array of objects
   */
  organize(data){
    var events = [];
    for (var elem of data){
      for (var id in elem){
        if (elem.hasOwnProperty(id) && elem[id].data){
          events = events.concat(elem[id].data);
        }
      }
    }
    return events;
  }

  /**
   * Filteres events, only those with specified location coordinates and
   * happening in the future remain
   * @param {Object[]} events - array of objects, organized
   * @return {Object[]} - array of objects, filtered
   */
  filter(events){
    return events.filter( event => {
      if (
          !event.place
          || !event.place.location
          || !event.place.location.latitude
          || !event.place.location.longitude
        ){
        return false;
      }
      let now = new Date();
      let startTime = new Date(event.start_time);
      return now < startTime;
    });
  }

  /**
   * Finds out the region corresponding to the coordinates of the events
   * and filteres out those that do not fall into one of the preferred regions
   * @param {Object[]} events - array of objects, filtered
   * @return {Object[]} filtered - array of objects with new added property
   * event.place.location.region
   */
  localize(events){
    const locator = new Locator();

    let localizedEvents = events.map( event => {
      let latitude = event.place.location.latitude;
      let longitude = event.place.location.longitude

      let region = locator.find(latitude,longitude);
      event.place.location.region = region;

      return event;
    });

    let filtered = localizedEvents.filter( event => {
      return event.place.location.region;
    });
    return filtered;
  }

  /**
   * Makes the received events into instances of the Event class
   * @param {Object[]} events - array of objects localized
   * @return {Event[]}  - array of events
   */
  classify(events){
    return events.map( event => {
      let name = event.name;
      let description = event.description;
      let date = {
        start_date: event.start_time,
        end_date: event.end_time
      };
      let location = {
        latitude: event.place.location.latitude,
        longitude: event.place.location.longitude,
        name: event.place.location.city || event.place.location.region
      };
      let fbId = event.id;

      return new Event(name, description, date, location, fbId);
    });
  }

}

module.exports = FormatEvents;