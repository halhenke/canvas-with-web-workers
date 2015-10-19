/**
 * Responsible for transforming the image into a series of pixellated
 * blocks and then spawning WebWorkers to fetch corresponding 'tiles'
 * from the server.
 */
function PixelImage(canvasID) {
  var element = document.getElementById(canvasID);
  this.context = element.getContext('2d');
  this.rowDelay = 100;
  this.width = element.width;
  this.height = element.height;
  this.pixelatedImage = {
    rows: []
  };
  this.fakeCanvas = document.createElement('canvas');
  this.fakeCanvas.setAttribute('width', this.width);
  this.fakeCanvas.setAttribute('height', this.height);
  this.fakeContext = this.fakeCanvas.getContext('2d');

  this.totalWorkers = 4;
  this.myWorkers = [];
  for (var i = 0; i < this.totalWorkers; i++) {
    this.myWorkers[i] = new Worker('js/worker.js');
    this.myWorkers[i].onmessage = this.workerDone.bind(this);
  }
  this.processedRows = 0;
}

PixelImage.prototype.workerDone = function(e) {
  this.pixelatedImage.rows[e.data.section] = e.data.grid;
  this.processedRows++;
  if (this.processedRows === this.totalWorkers) {
    this.rowByRow(this.pixelatedImage.rows.reduce(function(a, b) {
      return a.concat(b);
    }, []));
  }
};

/**
 * Main function
 * - divides the image vertically into equal sections
 * based on the number of WebWorkers
 */
PixelImage.prototype.pixelate = function(image) {
  this.imageScale(image);
  for (var i = 0; i < this.totalWorkers; i++) {
    var sectionHeight = this.height / this.totalWorkers;
    var y = sectionHeight * i;
    this.canvasSection(i, 0, y, this.width, y + sectionHeight);
  }
};


PixelImage.prototype.canvasSection = function(sectionNum, startX, startY, sectionWidth, sectionHeight) {
  var sectionRows = [];
  for (var y = startY; y < sectionHeight; y = y + TILE_HEIGHT) {
    var row = [];
    for (var x = startX; x < sectionWidth; x = x + TILE_WIDTH) {
      var sampleRect = this.fakeContext.getImageData(x, y, TILE_WIDTH, TILE_HEIGHT);
      var avgColor = this.sample(sampleRect);
      row.push({
        color: avgColor,
        x: x,
        y: y
      });
    }
    sectionRows.push(row);
  }
  this.myWorkers[sectionNum].postMessage(JSON.stringify({
    type: 'colorize',
    section: sectionNum,
    data: sectionRows
  }));
};


PixelImage.prototype.imageScale = function(unscaledImage) {
  var hRatio = this.width / unscaledImage.width;
  var vRatio = this.height / unscaledImage.height;
  var ratio = Math.min( hRatio, vRatio );
  var centerShiftX = ( this.width - unscaledImage.width * ratio ) / 2;
  var centerShiftY = ( this.height - unscaledImage.height * ratio ) / 2;

  //  If user chooses another image - clear the context
  this.fakeContext.clearRect(0, 0, this.width, this.height);
  this.context.clearRect(0, 0, this.width, this.height);
  this.fakeContext.drawImage(unscaledImage, 0, 0, unscaledImage.width, unscaledImage.height,
    centerShiftX, centerShiftY, unscaledImage.width * ratio, unscaledImage.height * ratio);
};

PixelImage.prototype.sample = function(rect) {
  var r, g, b, a;
  var totalPixels = TILE_WIDTH * TILE_HEIGHT;
  r = g = b = a = 0;
  for (var i = 0; i < rect.data.length; i = i + 4) {
    r += rect.data[i];
    g += rect.data[i + 1];
    b += rect.data[i + 2];
    a += rect.data[i + 3];
  }
  r = Math.trunc(r / totalPixels);
  g = Math.trunc(g / totalPixels);
  b = Math.trunc(b / totalPixels);
  return this.toHexURL(r, g, b);
};

PixelImage.prototype.toHexURL = function(red, green, blue) {
  return '/color/'
   + this.safeHexString(red)
   + this.safeHexString(green)
   + this.safeHexString(blue);
};


PixelImage.prototype.safeHexString = function(num) {
  var hex = Number(num).toString(16);
  if (hex.length !== 2) {
    hex = '0' + hex;
  }
  return hex;
};


PixelImage.prototype.rowByRow = function(rows) {
  var row = rows.shift(rows);
  if (row !== undefined) {
    Promise.all(row).then(function(resolvedRow) {
      this.rowRender(resolvedRow);
      setTimeout(this.rowByRow.bind(this), this.rowDelay, rows);
    }.bind(this));
  }
};

PixelImage.prototype.rowRender = function(row) {
  var imageRow = [];
  for (var i = 0; i < row.length; i++) {
    var block = row[i];
    imageRow.push(blockImage(block));
  }
  // Change to render into a context first...
  Promise.all(imageRow).
    then(function(renderedRow) {
      for (var j = 0; j < renderedRow.length; j++) {
        this.context.drawImage(renderedRow[j].image, renderedRow[j].x, renderedRow[j].y, TILE_WIDTH, TILE_HEIGHT);
      }
    }.bind(this));
};

var blockImage = function(block) {
  var img = new Image;
  img.src = URL.createObjectURL(block.color);
  return new Promise(function(resolve) {
    img.onload = function() {
      resolve({
        image: img,
        x: block.x,
        y: block.y
      });
    };
  });
};
