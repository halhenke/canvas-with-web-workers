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

  this.totalWorkers;
}


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

