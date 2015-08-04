function initialize(){

  var markers = [];
  
  var mapOptions = {
    overviewMapControl:true,
    rotateControl:true,
    scaleControl:true,
    mapTypeControl: true,
    mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR, position:google.maps.ControlPosition.TOP_CENTER},
    zoomControl: true,
    zoomControlOptions: {style: google.maps.ZoomControlStyle.DEFAULT}
    };



  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(38.00536101289634, -84.54357147216797),
      new google.maps.LatLng(38.0694467480777, -84.45568084716797)
      );
  
  map.fitBounds(defaultBounds);

  map.data.setStyle(function(feature) {
    var status = feature.getProperty('Status');
    if (status === 'Progressing') {var color = '#5cb85c'}
    else if (status === 'Stalled') {var color = '#f0ad4e'}
    else if (status === 'Stopped') {var color = '#d9534f'}
    else {}
    return {icon: {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    scale: 10,
    strokeColor: '#333',
    strokeWeight: 4
    }};
});

  map.data.loadGeoJson('data/projects.geojson')

  var infowindow = new google.maps.InfoWindow();

  map.data.addListener('click', function(event) {


      if (event.feature.getProperty('Status') === 'Progressing') {var status_button = "<p class=\"status good-status\">Project is Progressing</p>"}
      else if (event.feature.getProperty('Status') === 'Stalled') {var status_button = "<p class=\"status warning-status\">Project is Stalled</p>"}
      else if (event.feature.getProperty('Status') === 'Stopped') {var status_button = "<p class=\"status bad-status\">Project is Stopped</p>"}
      else {}  

      infowindow.setContent(
        "<h3>" + event.feature.getProperty('Project') + "</h3>" +
        "<p>" + event.feature.getProperty('Description') + "</p>" +
        status_button +
        "<p class=\"tight\"><strong>Start Date: </strong>" + event.feature.getProperty('StartDate') + "</p>" +
        "<p class=\"tight\"><strong>End Date: </strong>" + event.feature.getProperty('EndDate') + "</p>" +
        "<p><strong>Project Budget: </strong>" + FormatCurrency(event.feature.getProperty('Budget')) + "</p>" +       
        "<p><strong>Current Task: </strong>" + event.feature.getProperty('Current') + 
        "<br>This task is due on " + event.feature.getProperty('CurrentDueDate') + "</p>" +
        "<p><strong>Last Task Completed: </strong>" + event.feature.getProperty('LastTask') +        
        "<br>This task was completed on " + event.feature.getProperty('LastTaskDate') + "</p>" +
        "<div class=\"col-sm-6 chart\" id=\"budget-chart\"></div>" +
        "<div class=\"col-sm-6 chart\" id=\"time-chart\"></div>"
                );


      infowindow.setPosition(event.latLng)
      infowindow.open(map);

      var budgetchart = c3.generate({
        padding: {
          top: 5,
          right: 0,
          bottom: 0,
          left: 10,
                },
       bindto: '#budget-chart',
       size: {height: 200, width: 200},
       donut: {
          title: "Budget",
          label: {show: false}
                }, 
       data: {
         columns: [
          ['Expense', event.feature.getProperty('Expense')],
          ['Available', event.feature.getProperty('Budget') - event.feature.getProperty('Expense')]
                ],
         type : 'donut',
         colors: {
            Expense: '#5cb85c',
            Available: '#428bca',
                 }
             },
        tooltip: {
          position: function (data, width, height, element) {
              return {top: -20, left: 20}},
          format: {
              title: function (d) { return d; },
              value: function (value, ratio, id) {
                     return FormatCurrency(value) + " (" + parseFloat((ratio * 100).toFixed(2)) + '%)';
              }
          }
                },
        legend: {hide: true}
        });

      var timechart = c3.generate({
        padding: {
          top: 5,
          right: 0,
          bottom: 0,
          left: 10,
                },
       bindto: '#time-chart',
       size: {height: 200, width: 200},
       donut: {
          title: "Schedule",
          label: {show: false}
                }, 
       data: {
         columns: [
          ['Spent', DaysIn(event.feature.getProperty('StartDate'))],
          ['Remaining', TotalDays(event.feature.getProperty('StartDate'), event.feature.getProperty('EndDate')) - DaysIn(event.feature.getProperty('StartDate'))]
                ],
         type : 'donut',
         colors: {
            Spent: '#5cb85c',
            Remaining: '#428bca',
                 }
             },
        tooltip: {
          position: function (data, width, height, element) {
              return {top: -20, left: -20}},
          format: {
              title: function (d) { return d; },
              value: function (value, ratio, id) {
                     return value + " days (" + parseFloat((ratio * 100).toFixed(2)) + '%)';
              }
          }
                },
        legend: {hide: true}
        });
  })

  };

google.maps.event.addDomListener(window, 'load', initialize);

function FormatCurrency (input){ 
if (input && $.isNumeric(input) === true) {
var rounded = Math.round(input)
return '$' + rounded.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
} else {return '$0'}};

function DaysIn (StartDate){
return Math.round(Math.abs(new Date() - new Date(StartDate))/86400000)
}

function TotalDays (StartDate, EndDate){
return Math.round(Math.abs(new Date(EndDate) - new Date(StartDate))/86400000)
}

$(document).ready(function(){
$.ajax({
    url: 'data/projects.geojson',
    dataType: 'json',
    success: function(data) {
    $.each(data.features, function(key, value){
      if (value.properties.Status === 'Progressing') {var status_button = "<p class=\"status good-status\">Progressing</p>"}
      else if (value.properties.Status === 'Stalled') {var status_button = "<p class=\"status warning-status\">Stalled</p>"}
      else if (value.properties.Status === 'Stopped') {var status_button = "<p class=\"status bad-status\">Stopped</p>"}
      else {}

    $("#project-tbody").append("<tr><td><p class=\"project-name\">" + value.properties.Project + "<p></td><td>" + status_button + "</td></tr>")
  })

    }});
})