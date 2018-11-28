const socket = io();

// var topics = {
//     configRequest: 'sear/config/request',
//     configResponse: 'sear/config/request',
//     statusRequest: 'sear/status/request',
//     statusResponse: 'sear/status/response'
//   }

var topics = {
    configRequest: 'sear/config/request',
    configResponse: 'sear/config/response',
    statusRequest: 'sear/status/request',
    statusResponse: 'sear/status/response'
  }

socket.on(topics.statusResponse, function (msg) {
    $('#socketTest').append($('<li>').text(msg));
});