// console.log('Worker is up and going');
importScripts('mosaic.js');
importScripts('pixelImage.js');

onmessage = function(event) {
  var message = JSON.parse(event.data);
  switch (message.type) {
  case 'colorize':
    colorize(message.section, message.data);
    break;
  default:
    close();
  }
};

var colorize = function(sectionNum, sectionRows) {
  var promiseBlock = [];
  var cols;
};

var getColorPromise = function(block) {
  return fetchColor(color, x, y);
};


var fetchColor = function(color, x, y) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', color, true);
    xhr.responseType = 'blob';
  });
};
