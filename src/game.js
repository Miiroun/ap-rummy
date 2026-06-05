import { dragElement } from "./blocks.js";

var slot_data = {}



var gameDIV = document.getElementById("game");
var boardDIV = document.getElementById("board")

var preset_brick = document.getElementById("preset_brick")


var card_sheets = [];
const suits = ["black_blue", "black_red", "black_white", "white_black"]
const suits_to_int = {
    "BLUE": 0,
    "RED": 1,
    "BLACK": 2,
    "WHITE": 3
}
for (var i = 0; i < suits.length; i++) {
    var image = new Image();
    image.src = "img/" + suits[i] + ".png";
    image.crossOrigin = true;
    card_sheets.push(image)
}

var cards_to_add = 0
var total_added_cards = 0

async function InitGame(data) {
    var startDIV = document.getElementById("startPage");
    startDIV.style.display = "none";
    gameDIV.style.display = "block";
    var chatDIV = document.getElementById("chatbox");
    chatDIV.style.display = "block";
    slot_data = data

    var interval = setInterval(createBord, 1000);

}

async function OnitemsReceived(items, index) {
    //if (Object.keys(slot_data).length === 0) {
    //return false;
    //slot_data["card_order"] = ["CARD: RED-10","CARD: BLUE-12","CARD: BLUE-4"]}
    //console.log("items" + items);
    //console.log("index" + index)

    for (let id = index; id < items.length; id++) {
        if (items[id] == "progressive card") {
            cards_to_add += 1
        }
    }
}


function createBord() {
    if (Object.keys(slot_data).length === 0) { return false; }

    while(cards_to_add > 0) {

        let brick_copy = preset_brick.cloneNode(true);
        brick_copy.setAttribute('id', "card: " + total_added_cards);
        //console.log(brick_copy.childNodes)
        var brick_child = brick_copy.childNodes[1]
        if (brick_child.id != "brick") throw "bad child of preset brick";
        brick_child.style.top = (Math.random() * 580) + "px";
        brick_child.style.left = (Math.random() * 1200) + "px";
        dragElement(brick_child);

        const card_order = slot_data["card_order"]
        const card = card_order[total_added_cards] // this shouldnt use id, need to only count the ids of cards, not other objects
        const temp = card.split(" ")[1].split("-")

        var suit = temp[0]
        var suit_int = suits_to_int[suit]
        var value = temp[1]

        //console.log(brick_child.childNodes);
        var canvas = brick_child.childNodes[5];
        console.log(card_sheets)
        canvas.getContext('2d').drawImage(
            card_sheets[suit_int],
            64 * value,
            96 * 0,
            64,
            96,
            0,
            0,
            64,
            96
        );


        boardDIV.appendChild(brick_copy)
        total_added_cards++
        cards_to_add -= 1
    }
}

export { InitGame, OnitemsReceived }