import { dragElement } from "./blocks.js";
import { client } from "./client.js";

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


var board = []
var merges = []

async function InitGame(data) {
    var startDIV = document.getElementById("startPage");
    startDIV.style.display = "none";
    gameDIV.style.display = "block";
    var chatDIV = document.getElementById("chatbox");
    chatDIV.style.display = "block";
    slot_data = data

    var interval = setInterval(gameLoop, 1000);

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

function gameLoop() {
    createBord()
    check_for_merge()

    send_check()
}

function createBord() {
    if (Object.keys(slot_data).length === 0) { return false; }

    while (cards_to_add > 0) {

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
        //console.log(card_sheets)
        canvas.getContext('2d').drawImage(
            card_sheets[suit_int],
            64 * (value - 1),
            96 * 0,
            64,
            96,
            0,
            0,
            64,
            96
        );


        boardDIV.appendChild(brick_copy)
        board.push(new Card(brick_copy, suit, value, false))
        total_added_cards++
        cards_to_add -= 1
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

class Card {
    constructor(brick_copy, suit, value, selected) {
        this.brick_copy = brick_copy;
        this.suit = suit;
        this.value = value;
        this.selected = selected;

    }
}

class Merge {
    constructor(type, sub_cards) {
        this.type = type
        this.sub_cards = sub_cards
    }
}

/*
function try_merge(current_card){
    var posX = current_card.elmnt.offsetTop
    var posY = current_card.elmnt.offsetLeft

    var card_array = document.getElements("brick")

    card_array.forEach(element => {
        var delX = element.offsetTop
        var delY = element.offsetLeft

        if ((distance(posX, posY, delX, delY) < 10) & ((posX != delX) & (posY != delY))) {
            // merge here
        } 
    });
}
*/
// maybe rework to ctrl / shift click instead of drag
// then need to store some data about each

function check_for_merge() {
    var cards_to_merge = []
    board.forEach(element => { if (element.selected) { cards_to_merge.push(element) } });


    if (cards_to_merge.length < 3) { return }
    cards_to_merge.sort((function (a, b) { return a.value - b.value; }))
    console.log(cards_to_merge)


    // test for strait
    var failed = false
    var test_suit = cards_to_merge[0].suit
    var test_value = cards_to_merge[0].value
    for (let i = 1; i < cards_to_merge.length; i++) {
        const card = cards_to_merge[i];
        console.log(card)
        console.log(test_value)
        if (!((card.value == String(Number(test_value) + 1)) & (card.suit == test_suit))) {
            failed = true;
            break;
        }
        test_value++;
    }
    if (!failed) {
        // do merging for strait
        merges.push(new Merge("strait", cards_to_merge))
        cards_to_merge.forEach(element => {
            element.selected = false;
            element.brick_copy.childNodes[1].childNodes[7].style.display = "none";
        });
        console.log("new merge")
        return
    }



    //test symbol
    failed = false
    test_value = cards_to_merge[0].value
    test_suit = []
    for (let i = 1; i < cards_to_merge.length; i++) {
        const card = cards_to_merge[i];
        if (!((card.value == test_value) & (test_suit.includes(card.suit)))) {
            failed = true;
            break;
        }
        test_suit.push(card.suit);
    }
    if (!failed) {
        // do merging for symbol
        merges.push(new Merge("symbol", cards_to_merge))
        cards_to_merge.forEach(element => {
            element.selected = false;
            element.brick_copy.childNodes[1].childNodes[7].style.display = "none";
        });
        console.log("new merge")
        return
    }


    console.log("Illiga merge tried")
    cards_to_merge.forEach(element => {
        element.selected = false
        element.brick_copy.childNodes[1].childNodes[7].style.display = "none";

    });

}

function send_check() {
    var amount_merges = 0
    merges.forEach(element => {
        amount_merges += element.sub_cards.length
    });

    for (let id = 1; id <= amount_merges; id++) {
        client.check(id + 10_000);
    }

    if (amount_merges >= board.length) {
        client.goal();
    }



}





export { InitGame, OnitemsReceived, merges, board }