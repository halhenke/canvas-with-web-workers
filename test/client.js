var expect = chai.expect;

describe('PixelIMage', function() {
  beforeEach(function () {
    this.pi = new PixelImage('mosaic');
  });

  describe('safeHexString', function() {
    describe('when given a number greter than 16', function() {
      it('should return the expected Hexadecimal string', function() {
        expect(this.pi.safeHexString(20)).to.equal('14');
      });
    });
    describe('when given a number less than 16', function() {
      it('should return the expected Hexadecimal string with a leading 0', function() {
        expect(this.pi.safeHexString(10)).to.equal('0a');
      });
    });
  });

  describe('toHexURL', function() {
    it('should begin with "/color/"', function() {
      expect(this.pi.toHexURL(24, 99, 123)).to.have.string('/color/');
    });
    it('should contain the expected hex representation of the rgb color', function() {
      expect(this.pi.toHexURL(24, 99, 123)).to.have.string('18637b');
    });
  });

  describe('sample', function() {
    it('should try to average an array of rgba values appropriately', function() {
      var red = 45;
      var green = 56;
      var blue = 155;
      var colorArray = [];
      _.times(TILE_WIDTH*TILE_HEIGHT, function() {
        colorArray = colorArray.concat([red, green, blue, 0.2]);
      })
      expect(this.pi.sample({data: colorArray})).to.equal(this.pi.toHexURL(red, green, blue));
    });
  });
});
