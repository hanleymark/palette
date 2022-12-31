const palette = new Palette(document.querySelectorAll(".colour"), 5);
const ADD_BUTTONS = document.querySelectorAll(".add-button");

const GenerateMethod = {
    Monochromatic: 0,
    Analogous: 1,
    Complementary: 2,
    Random: 3,
};

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

function Palette(paletteElements, size = 5, method) {
    this.paletteElements = paletteElements;
    // Generate colours array with 5 null items so that it can be iterated over
    this.paletteColours = Array.apply(null, Array(5)).map(function () { });

    this.generate = function (method) {
        switch (method) {
            case GenerateMethod.Random:
                this.generateRandom();
                break;
            default:
                this.generateRandom();
        }
    };

    this.generateRandom = function () {
        for (let i = 0; i < this.paletteColours.length; i++) {
            this.paletteColours[i] = new Colour(
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256));
        };

        console.log(`Palette: ${this.paletteColours}`);
    }

    this.display = function () {
        numberOfColours = this.paletteColours.length;
        this.paletteElements.forEach((element, index) => {
            if (index < numberOfColours) {
                element.style.backgroundColor = this.paletteColours[index].getHexString();
                element.classList.remove("hidden");
                element.classList.add("visible");
            }
            else {
                element.classList.remove("visible");
                element.classList.add("hidden");
            }
        });
    }
}

palette.generate(GenerateMethod.Random);
palette.display();