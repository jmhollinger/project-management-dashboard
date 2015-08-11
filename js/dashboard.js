var data_key = 'https://docs.google.com/spreadsheets/d/1gmQoxpSve6Zzi2Ak1Q3c5PzLvCHRW8YkShZcPZETKzo/pubhtml';

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

  var marker, i;

  var tabletop = Tabletop.init( { key: data_key,
	                     callback: showInfo,
	                     simpleSheet: true,
	                     parseNumbers: true,
	          			 } )

  function showInfo(data, tabletop) {
  var bounds = new google.maps.LatLngBounds();
  $.each(data, function(index, key) {
    
    var status = (key.Status);
    if (status === 'Progressing') {var color = '#5cb85c'}
    else if (status === 'Stalled') {var color = '#f0ad4e'}
    else if (status === 'Stopped') {var color = '#d9534f'}
    else {}
    var position = new google.maps.LatLng(key.Y, key.X);
    bounds.extend(position);
    marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    scale: 10,
    strokeColor: '#333',
    strokeWeight: 3
    }})



      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          ShowProject(key.ID);
        }
      })(marker, i));
	})
  	map.fitBounds(bounds);
	}
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

var tabletop = Tabletop.init( { key: data_key,
                     callback: showInfo,
                     simpleSheet: true,
                     parseNumbers: true,
          			 } )

function showInfo(data, tabletop) {
    $.each(data, function(index, key) {
      if (key.Status === 'Progressing') {var status_button = "<span class=\"status btn btn-success\">Progressing</span>"}
      else if (key.Status === 'Stalled') {var status_button = "<span class=\"status btn btn-warning\">Stalled</span>"}
      else if (key.Status === 'Stopped') {var status_button = "<span class=\"status btn btn-danger\">Stopped</span>"}
      else {}
    $("#project-tbody").append("<tr style=\"cursor:pointer\" onclick=\"ShowProject(" + key.ID + ")\"><td><span class=\"project-name\">" + key.Project + "</span></td><td>" + status_button + "</td></tr>")
  })

    }});



function ShowProject (project_id) {

var tabletop = Tabletop.init( { key: data_key,
                     callback: showInfo,
                     simpleSheet: true,
                     parseNumbers: true,
                     query: "id = " + project_id,
                     postProcess: function(element) {
                       element["expense"] = parseInt(element["expense"].replace(/\$|\,/g, ""))
                       element["budget"] = parseInt(element["budget"].replace(/\$|\,/g, ""))}
          			 } )
 

function showInfo(data, tabletop) {
    console.log(data)
    if (data[0].Status === 'Progressing') {var status_button = "<p class=\"status good-status\">Project is Progressing</p>"}
    else if (data[0].Status === 'Stalled') {var status_button = "<p class=\"status warning-status\">Project is Stalled</p>"}
    else if (data[0].Status === 'Stopped') {var status_button = "<p class=\"status bad-status\">Project is Stopped</p>"}
    else {}      

    $("#myModalLabel").html(
      "<h3>" + data[0].Project + "</h3>" +
      "<p>" + data[0].Description + "</p>")

    $("#project").html(
        status_button +
        "<p class=\"tight\"><strong>Start Date: </strong>" + data[0].StartDate + "</p>" +
        "<p class=\"tight\"><strong>End Date: </strong>" + data[0].EndDate + "</p>" +
        "<p><strong>Project Budget: </strong>" + FormatCurrency(data[0].Budget) + "</p>" +       
        "<p><strong>Current Task: </strong>" + data[0].Current + 
        "<br>This task is due on " + data[0].CurrentDueDate + "</p>" +
        "<p><strong>Last Task Completed: </strong>" + data[0].LastTask +        
        "<br>This task was completed on " + data[0].LastTaskDate + "</p>" +
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
          ['Expense', data[0].Expense],
          ['Available', data[0].Budget - data[0].Expense]
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
          ['Elapsed', DaysIn(data[0].StartDate)],
          ['Remaining', TotalDays(data[0].StartDate, data[0].EndDate) - DaysIn(data[0].StartDate)]
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
$('#myModal').modal('show');
}