export const getColourVariable = (hex: string, type: string) => {
    return `:root {--color-${type}: ${hex};}`;
};

// change hex to rgb
export const getRGBColour = (hex: string, type: string) => {
    let colour = hex.replace(/#/g, "");
    // rgb values
    var r = parseInt(colour.slice(0, 2), 16);
    var g = parseInt(colour.slice(2, 4), 16);
    var b = parseInt(colour.slice(4, 6), 16);

    return `--color-${type}: ${r}, ${g}, ${b};`;
};

// get constrasting accessiblity colour
export const getAccessibleColour = (hex: string) => {
    let colour = hex.replace(/#/g, "");
    // rgb values
    var r = parseInt(colour.slice(0, 2), 16);
    var g = parseInt(colour.slice(2, 4), 16);
    var b = parseInt(colour.slice(4, 6), 16);
    var yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#FFFFFF";
};
