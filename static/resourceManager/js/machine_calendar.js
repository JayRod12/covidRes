console.log('hey')

var timetable = new Timetable();
// timetable.setScope(0, 23); // optional, only whole hours between 0 and 23
// timetable.useTwelveHour();

timetable.addLocations(['Silent Disco', 'Nile', 'Len Room', 'Maas Room']);
timetable.addEvent('Frankadelic2', 'Nile', new Date(2015,7,17,10,45), new Date(2015,7,20,12,30));

timetable.addEvent('Frankadelic', 'Nile', new Date(2015,7,17,10,45), new Date(2015,7,17,12,30));

timetable.addLocations(['Rotterdam', 'Madrid', 'Los Angeles', 'London', 'New York', 'Jakarta', 'Tokyo']);

timetable.addEvent('Sightseeing', 'Rotterdam', new Date(2015,7,17,10,45), new Date(2015,7,17,12,30), '#');
timetable.addEvent('Zumba', 'Madrid', new Date(2015,7,17,12), new Date(2015,7,17,13), '#');
timetable.addEvent('Zumbu', 'Madrid', new Date(2015,7,17,13,30), new Date(2015,7,17,15), '#');
timetable.addEvent('Lasergaming', 'London', new Date(2015,7,17,17,45), new Date(2015,7,17,19,30), '#');
timetable.addEvent('All-you-can-eat grill', 'New York', new Date(2015,7,17,21), new Date(2015,7,18,1,30), '#');
timetable.addEvent('Hackathon', 'Tokyo', new Date(2015,7,17,11,30), new Date(2015,7,17,20)); // url is optional and is not used for this event
timetable.addEvent('Tokyo Hackathon Livestream', 'Los Angeles', new Date(2015,7,17,12,30), new Date(2015,7,17,16,15)); // url is optional and is not used for this event
timetable.addEvent('Lunch', 'Jakarta', new Date(2015,7,17,9,30), new Date(2015,7,17,11,45), '#');
var options = {
  url: '#', // makes the event clickable
  class: 'vip', // additional css class
  data: { // each property will be added to the data-* attributes of the DOM node for this event
    id: 4,
    ticketType: 'VIP'
  },
  onClick: function(event, timetable, clickEvent) {} // custom click handler, which is passed the event object and full timetable as context  
};
timetable.addEvent('Jam Session', 'Nile', new Date(2015,7,17,21,15), new Date(2015,7,17,23,30), options);

var renderer = new Timetable.Renderer(timetable);
renderer.draw('.timetable'); // any css selector