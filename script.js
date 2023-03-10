const palette = new Palette(document.querySelectorAll(".colour"), 5);
const ADD_ZONES = document.querySelectorAll(".add-zone");
const ADD_BUTTONS = document.querySelectorAll(".add-button");
const TOOLBAR_CONTAINERS = document.querySelectorAll(".toolbar-container");
const info = document.querySelectorAll(".information");
const colourPickers = document.querySelectorAll(".colour-picker");

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
    this.locked = false;

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

    this.getContrast = function () {
        return ((this.red * 299) + (this.green * 587) + (this.blue * 114)) / 1000;
    }

    this.getForegroundColour = function () {
        return (this.getContrast() > 128) ? "#000" : "#fff";
    }

    this.getColourName = function (element) {
        hex = this.getHexString().replace("#", "").toUpperCase();
        url = `https://www.thecolorapi.com/id?hex=${hex}`;
        fetch(url)
        .then((response) => {
            //console.log(response);
            return response.json();
        })
        .then((data) => {
            element.innerHTML = data.name.value;
        });
        return "";
    }
}

function Palette(paletteElements, size = 5, method) {
    this.MAX_COLOURS = 10;
    this.MIN_COLOURS = 1;
    this.paletteElements = paletteElements;
    // Generate colours array with 5 null items so that it can be iterated over
    this.paletteColours = Array.apply(null, Array(size)).map(function () { });

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

            if (!this.paletteColours[i]) {

                this.paletteColours[i] = new Colour(
                    Math.floor(Math.random() * 256),
                    Math.floor(Math.random() * 256),
                    Math.floor(Math.random() * 256));
            }
            else {
                if (!this.paletteColours[i].locked) {
                    this.paletteColours[i] = new Colour(
                        Math.floor(Math.random() * 256),
                        Math.floor(Math.random() * 256),
                        Math.floor(Math.random() * 256));
                }
            }
        };
    }

    this.display = function () {
        numberOfColours = this.paletteColours.length;
        this.paletteElements.forEach((element, index) => {
            if (index < numberOfColours) {
                element.style.backgroundColor = this.paletteColours[index].getHexString();
                info[index].style.backgroundColor = this.paletteColours[index].getHexString();
                element.classList.remove("hidden");
                element.classList.add("visible");

                info[index].classList.remove("hidden");
                info[index].classList.add("visible");

            }
            else {
                element.classList.remove("visible");
                element.classList.add("hidden");
                info[index].classList.remove("visible");
                info[index].classList.add("hidden");
            }

            // Change the style of the last add mouseover zone to be wider
            element.children[2].classList.remove("end-add-zone");
            element.children[2].children[0].classList.remove("end-add-button");

            if (index == this.paletteColours.length - 1) {
                element.children[2].classList.add("end-add-zone");
                element.children[2].children[0].classList.add("end-add-button");
            }
        });

        // Set contrasting white or black foreground colour for each palette colour
        this.paletteColours.forEach((colour, index) => {
            this.paletteElements[index].style.color = colour.getForegroundColour();
            info[index].style.color = colour.getForegroundColour();
            //info[index].children[0].innerHTML = colour.getHexString().toUpperCase();
            info[index].firstChild.innerHTML =
                this.paletteColours[index].locked ?
                    this.paletteColours[index].getHexString().toUpperCase() + "<br>(locked)" :
                    this.paletteColours[index].getHexString().toUpperCase();
            colourPickers[index].value = colour.getHexString();

            colour.getColourName(info[index].children[1]);
        });


    }

    this.setUpToolbars = function () {
        let toolbar = document.getElementsByTagName("template")[0];
        this.paletteElements.forEach((element, index) => {
            let clone = toolbar.content.cloneNode(true);
            let toolbarElements = clone.querySelectorAll(".material-symbols-outlined");
            // Add listeners to each toolbar button with index of colour to which toolbar belongs
            toolbarElements[0].addEventListener("mousedown", () => { this.removeColour(index); }, false);
            toolbarElements[1].addEventListener("mousedown", () => { this.moveLeft(index); }, false);
            toolbarElements[2].addEventListener("mousedown", () => { this.moveRight(index); }, false);
            toolbarElements[3].addEventListener("mousedown", () => { this.copyToClipboard(index); }, false);
            toolbarElements[4].addEventListener("mousedown", () => { this.toggleLockColour(index, toolbarElements[4]); }, false);
            toolbarElements[5].addEventListener("mousedown", () => { this.pickColour(index); }, false);

            let toolbarContainer = element.querySelector(".toolbar-container");
            toolbarContainer.style.display = "none";
            toolbarContainer.appendChild(clone);
        });

    }

    this.setUpListeners = function () {
        // Set up swatch end zone listeners to display add buttons
        ADD_ZONES.forEach((addZone) => {
            addZone.addEventListener("mouseover", (event) => {
                // Strip 'add-zone' from element Id to leave number of add zone that triggered mouseover event
                let addZone = +(event.target.id.replace("add-zone", ""));

                if (!isNaN(addZone)) {
                    // Calculate the subscript of the button to make visible
                    let addButton = Math.floor((addZone + 1) / 2);

                    if (this.paletteColours.length < this.MAX_COLOURS) {
                        ADD_BUTTONS[addButton].style.display = "block";
                    }

                    for (let i = 0; i < ADD_BUTTONS.length; i++) {
                        if (i != addButton) {
                            ADD_BUTTONS[i].style.display = "none";
                        }
                    }
                }
            }, false);

            addZone.addEventListener("mouseleave", (event) => {
                if (!event || !event.relatedTarget) {
                    return;
                }
                let leftFromId = event.relatedTarget.id ?? "nullish";
                if (leftFromId.search("add") != -1) {
                    return;
                }

                ADD_BUTTONS.forEach((addButton) => {
                    addButton.style.display = "none";
                });
            }, false);
        });

        // Set up onclick event listeners for add colour buttons
        for (let i = 0; i < this.MAX_COLOURS; i++) {
            let img = document.querySelector(`#add-img${i}`);
            img.addEventListener("mousedown", () => { this.addColour(i); }, false);
        }

        // Set up mouseover event listeners for colour bars to make toolbar appear/disappear
        for (let i = 0; i < this.paletteElements.length; i++) {
            paletteElements[i].addEventListener("mouseenter", (event) => {
                let toolbarIndex = +event.target.id.replace("colour", "");
                TOOLBAR_CONTAINERS[toolbarIndex].style.display = "flex";
            }, false);

            paletteElements[i].addEventListener("mouseleave", (event) => {
                let toolbarIndex = +event.target.id.replace("colour", "");
                TOOLBAR_CONTAINERS[toolbarIndex].style.display = "none";
            }, false);

            colourPickers[i].addEventListener("change", (event) => {

                if (this.paletteColours[i].locked) {
                    displayMessage("Unlock colour before changing");
                    colourPickers[i].value = this.paletteColours[i].getHexString();
                }
                else {
                    const hex = colourPickers[i].value.replace("#", "");
                    const r = parseInt(hex.slice(0, 2), 16);
                    const g = parseInt(hex.slice(2, 4), 16);
                    const b = parseInt(hex.slice(4, 6), 16);
                    this.paletteColours[i] = new Colour(r, g, b);
                    this.display();
                }
            })
        }
    }

    this.addColour = function (position) {
        if (this.paletteColours.length == this.MAX_COLOURS) {
            return;
        }
        if (position == 0) {
            let leftColour = this.paletteColours[0];
            let r = Math.floor(leftColour.red * 0.95);
            let g = Math.floor(leftColour.green * 0.95);
            let b = Math.floor(leftColour.blue * 0.95);
            this.paletteColours.unshift(new Colour(r, g, b));
            this.display();
            return;
        }

        if (position == this.paletteColours.length) {
            let rightColour = this.paletteColours.slice(-1)[0];
            // Get highest value component and set brightness increment so that it can not exceed 0xFF
            let highComponent = Math.max(rightColour.red, rightColour.green, rightColour.blue);
            let spaceLeft = this.MAX_COLOURS - this.paletteColours.length;
            let multiplier = 1 + ((255 - highComponent) / 700);
            let r = Math.floor(rightColour.red * multiplier);
            let g = Math.floor(rightColour.green * multiplier);
            let b = Math.floor(rightColour.blue * multiplier);
            this.paletteColours.push(new Colour(r, g, b));
            this.display();
            return;
        }

        let leftColour = this.paletteColours[position - 1];
        let rightColour = this.paletteColours[position];
        let newColour = this.getIntermediateColour(leftColour, rightColour);

        this.paletteColours.splice(position, 0, newColour);

        this.display();
    }

    this.removeColour = function (index) {
        if (this.paletteColours[index].locked) {
            displayMessage("Unlock before removing");
            return;
        }
        if (this.paletteColours.length > this.MIN_COLOURS) {
            this.paletteColours.splice(index, 1);
            this.display();
        }
    }

    this.moveLeft = function (index) {
        if (this.paletteColours[index].locked) {
            displayMessage("Unlock before moving");
            return;
        }
        if (index > 0) {
            let temp = this.paletteColours[index];
            this.paletteColours.splice(index, 1);
            this.paletteColours.splice(index - 1, 0, temp);
            this.display();
        }
    }

    this.moveRight = function (index) {
        if (this.paletteColours[index].locked) {
            displayMessage("Unlock before moving");
            return;
        }
        if (index < this.paletteColours.length - 1) {
            let temp = this.paletteColours[index];
            this.paletteColours.splice(index, 1);
            this.paletteColours.splice(index + 1, 0, temp);
            this.display(); message
        }
    }

    this.copyToClipboard = function (index) {
        navigator.clipboard.writeText(this.paletteColours[index].getHexString());
        displayMessage("Copied to clipboard");
    }

    this.toggleLockColour = function (index, toolbarElement) {
        this.paletteColours[index].locked = !this.paletteColours[index].locked;
        toolbarElement.innerHTML = this.paletteColours[index].locked ? "lock" : "lock_open";
        const message = this.paletteColours[index].locked ? "Colour locked" : "Colour unlocked";
        info[index].firstChild.innerHTML =
            this.paletteColours[index].locked ?
                this.paletteColours[index].getHexString().toUpperCase() + "<br>(locked)" :
                this.paletteColours[index].getHexString().toUpperCase();
        displayMessage(message);
    }

    this.pickColour = function (index) {
        ;
    }

    this.getIntermediateColour = function (col1, col2) {
        let r = Math.floor(col1.red + (col2.red - col1.red) / 2);
        let g = Math.floor(col1.green + (col2.green - col1.green) / 2);
        let b = Math.floor(col1.blue + (col2.blue - col1.blue) / 2);

        return new Colour(r, g, b);
    }
    this.setUpToolbars();
}

function displayMessage(message) {
    const messageBox = document.querySelector("#message");
    messageBox.innerHTML = message;
    messageBox.style.display = "block";

    setTimeout(() => {
        messageBox.style.display = "none";
    }, 2000);
}

palette.generate(GenerateMethod.Random);
palette.setUpListeners();
palette.display();

document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        palette.generate();
        palette.display();
    }
});