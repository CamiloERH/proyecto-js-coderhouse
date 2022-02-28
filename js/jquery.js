if(!localStorage.getItem('color')){
    localStorage.setItem('color', "61, 153, 112");
} else {
    const storageColor = localStorage.getItem('color');
    $(":root").css("--main-bg-color", storageColor);
}

const colors = [
    "61, 153, 112",
    "62, 44, 65",
    "134, 72, 121",
    "59, 82, 73",
    "32, 32, 64",
    "197, 76, 130",
    "120, 120, 120",
    "232, 99, 10",
    "64, 112, 136"
];

let aux = 0;
$("#changeColor").on("click", () => {
    const color = colors[++aux % colors.length];
    $(":root").css("--main-bg-color", color);
    localStorage.setItem('color', color);
});

let bool = false;
const i = $("#changeBackground").children('i');
$("#changeBackground").on("click", () => {
    if(bool){
        $(":root").css("--background-color", "211, 222, 220");
        i.attr('class', 'fa-solid fa-moon');
    } else {
        $(":root").css("--background-color", "0, 0, 0");
        i.attr('class', 'fa-solid fa-sun')
    }
    bool = !bool;
});
