
function initialize(){

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

ShowProject(event.feature.getProperty('join_id'))  

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
      if (value.properties.Status === 'Progressing') {var status_button = "<span class=\"status good-status\">Progressing</span>"}
      else if (value.properties.Status === 'Stalled') {var status_button = "<span class=\"status warning-status\">Stalled</span>"}
      else if (value.properties.Status === 'Stopped') {var status_button = "<span class=\"status bad-status\">Stopped</span>"}
      else {}
    $("#project-tbody").append("<tr style=\"cursor:pointer\" onclick=\"ShowProject(" + value.properties.join_id + ")\"><td><span class=\"project-name\">" + value.properties.Project + "</span></td><td>" + status_button + "</td></tr>")
  })

    }});
})

function ShowProject (join_id) {

 $('#myModal').modal('show');

$.ajax({
    url: 'data/projects.geojson',
    dataType: 'json',
    success: function(data) {
    $.each(data.features, function(key, value){
    if (value.properties.join_id === join_id){  

    if (value.properties.Status === 'Progressing') {var status_button = "<p class=\"status good-status\">Project is Progressing</p>"}
      else if (value.properties.Status === 'Stalled') {var status_button = "<p class=\"status warning-status\">Project is Stalled</p>"}
      else if (value.properties.Status === 'Stopped') {var status_button = "<p class=\"status bad-status\">Project is Stopped</p>"}
      else {}    
    

    $("#myModalLabel").html(
      "<h3>" + value.properties.Project + "</h3>" +
      "<p>" + value.properties.Description + "</p>")

    $("#project").html(
        status_button +
        "<p class=\"tight\"><strong>Start Date: </strong>" + value.properties.StartDate + "</p>" +
        "<p class=\"tight\"><strong>End Date: </strong>" + value.properties.EndDate + "</p>" +
        "<p><strong>Project Budget: </strong>" + FormatCurrency(value.properties.Budget) + "</p>" +       
        "<p><strong>Current Task: </strong>" + value.properties.Current + 
        "<br>This task is due on " + value.properties.CurrentDueDate + "</p>" +
        "<p><strong>Last Task Completed: </strong>" + value.properties.LastTask +        
        "<br>This task was completed on " + value.properties.LastTaskDate + "</p>" +
        "<div class=\"row\"><div class=\"col-sm-6 chart\" id=\"budget-chart\"></div>" +
        "<div class=\"col-sm-6 chart\" id=\"time-chart\"></div></div>"
                );
      var budgetchart = c3.generate({
        padding: {
          top: 10,
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
          ['Expense', value.properties.Expense],
          ['Available', value.properties.Budget - value.properties.Expense]
                ],
         type : 'donut',
         colors: {
            Expense: '#5cb85c',
            Available: '#428bca',
                 }
             },
        tooltip: {
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
          top: 10,
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
          ['Elapsed', DaysIn(value.properties.StartDate)],
          ['Remaining', TotalDays(value.properties.StartDate, value.properties.EndDate) - DaysIn(value.properties.StartDate)]
                ],
         type : 'donut',
         colors: {
            Elapsed: '#5cb85c',
            Remaining: '#428bca',
                 }
             },
        tooltip: {
          format: {
              title: function (d) { return d; },
              value: function (value, ratio, id) {
                     return value + " days (" + parseFloat((ratio * 100).toFixed(2)) + '%)';
              }
          }
                },
        legend: {hide: true}
        });


   
    }

else {}

  })

    }})

}
