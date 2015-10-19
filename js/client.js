var selector;
var pixelFixer;
var reader = new FileReader();
var image = new Image;

window.onload = function() {
  selector = document.querySelector('input.imageReader');
  selector.onchange = function() {
    if (this.files && this.files[0]) {
      var imageFile = this.files[0];
      reader.readAsDataURL(imageFile);
    }
  };
};

reader.onload = function(e) {
  image.src = e.target.result;
  image.onload = function() {
    /**
     * Performance MEtrics
     */
    // console.profile('pixelate');
    // console.time('pixelate');

    pixelFixer = new PixelImage('mosaic');
    pixelFixer.pixelate(image);
  };
};
