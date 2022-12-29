let PALETTE_SIZE = 5;

function Colour(red, green, blue) {
    this.red = red;
    this.green = green;
    this.blue = blue;

    this.getHexString = function () {
        // Get hex values of red, green and blue components
        const r = this.red.toString(16);
        const g = this.green.toString(16);
        const b = this.blue.toString(16);

        let rgb = "#";
        // Pad one digit hex numbers with leading zero and add to hex string
        rgb += r.length < 2 ? "0" + r : r;
        rgb += g.length < 2 ? "0" + g : g;
        rgb += b.length < 2 ? "0" + b : b;

        return rgb;
    }
};

col = new Colour(1, 254, 253);

console.log(col.getHexString());