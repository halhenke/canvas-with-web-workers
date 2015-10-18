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
  for (var i = 0; i < sectionRows.length; i++) {
    var row = sectionRows[i];
    var promiseRow = [];
    cols = row.length;
    for (var j = 0; j < row.length; j++) {
      var block = row[j];
      promiseRow.push(getColorPromise(block));
    }
    promiseBlock = promiseBlock.concat(promiseRow);
  }
  Promise.all(promiseBlock).then(function(resolvedBlock) {
    var promiseGrid = [];
    for (var k = 0; k < resolvedBlock.length; k += cols ) {
      promiseGrid.push(resolvedBlock.slice(k, k + cols));
    }
    postMessage({
      section: sectionNum,
      grid: promiseGrid
    });
    close();
  });
};

var getColorPromise = function(block) {
  var color = block.color;
  var x = block.x;
  var y = block.y;
  return fetchColor(color, x, y);
};


var fetchColor = function(color, x, y) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', color, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      if (xhr.status === 200) {
      // If successful, resolve the promise by passing back the request response
        resolve({
          color: xhr.response,
          x: x,
          y: y,
          width: TILE_WIDTH,
          height: TILE_HEIGHT
        });
      } else {
      // If it fails, reject the promise with a error message
        reject(Error('Image didn\'t load successfully; error code:' + xhr.statusText));
      }
    };
    xhr.onerror = function() {
      reject(Error('There was a network error.'));
    };
    xhr.send();
  });
};
