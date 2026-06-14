import { API } from "https://unpkg.com/archipelago.js/dist/archipelago.min.js";
import { init_block, init_merge } from "./blocks.js";
import { client, showText } from "./client.js";


var slot_data = {}



var gameDIV = document.getElementById("game");
var boardDIV = document.getElementById("board")

var preset_brick = document.getElementById("preset_brick")
var preset_merge = document.getElementById("preset_merge")

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
    //image.crossOrigin = true;
    card_sheets.push(image)
}

var cards_to_add = 0
var total_added_cards = 0


var board = []
var merges = []


const audio_cardflick = new Audio("audio/card_flick.mp3");
const audio_unconnect = new Audio("audio/un_connect.mp3");
const audio_bad = new Audio("audio/bad.mp3");
const audio_win = new Audio("audio/win.mp3");



var max_allowed_straits = 2
var max_allowed_melds = 2


var won = false

async function InitGame(data) {
    var mess = { cmd: "Get", keys: ["rummy merges: " + client.name] }
    var startDIV = document.getElementById("startPage");
    startDIV.style.display = "none";
    gameDIV.style.display = "block";
    var chatDIV = document.getElementById("chatbox");
    chatDIV.style.display = "block";
    slot_data = data


    gameDIV.style.width = window.innerWidth * 0.8
    gameDIV.style.height = window.innerHeight * 0.8

    document.addEventListener("keyup", function (event) {
        //console.log(event.code)
        if (event.code === "ControlLeft" || event.code == "ControlRight") {
            //console.log("this");
            check_for_merge();
            send_check()
        }
    });
    createBord()

    await client.socket.send(mess)
    var pack = await client.socket.on("retrieved", OnDataPackageRecived);
    await client.socket.on("invalidPacket", function (event) {
        console.log("Invalid packet")
        console.log(event)
    })


    var interval = setInterval(gameLoop, 1000);

}
function OnDataPackageRecived(event) {
    //console.log("on package")
    // console.log(event)
    //console.log(event["keys"])

    if (Object.hasOwn(event["keys"], "rummy merges: " + client.name)) {
        var merges_rec = event["keys"]["rummy merges: " + client.name]
        if (!merges_rec) { return false; }

        //showText(String(merges_rec))

        //console.log(merges_rec)
        merges_rec.forEach(text_merge => {
            var to_merge = []
            //console.log(text_merge)
            //console.log(typeof(text_merge))
            var text_to_array_merge = text_merge.split(",")
            //console.log(text_to_array_merge)
            //console.log()

            text_to_array_merge.forEach(card => {
                var temp = card.split("-");
                var suit_ = temp[0];
                var value_ = temp[1];
                // console.log(suit_, value_)
                // console.log(board)
                var tempCard = board.find((element) => (element.suit == suit_ && element.value == value_)) //(element.suit == suit) && (element.value == value)

                if (tempCard == undefined) {
                    console.log(board)
                    console.log(suit_, value_)
                    throw new Error("Could not find brick to merge in board ");
                }

                // console.log(tempCard)
                to_merge.push(tempCard)
            });

            // console.log(to_merge)
            crate_merge("dataStorage", to_merge, true)
        });
    }
}


async function OnitemsReceived(items, index) {
    for (let id = 0; id < items.length; id++) {
        switch (items[id].toString()) {
            case "progressive card":
                cards_to_add += 1;
                break;
            case "progressive meld":
                max_allowed_melds++;
                var gui_melds = document.getElementById("gui_melds")
                if (max_allowed_melds > 2) {
                    gui_melds.textContent = String(max_allowed_melds)
                }
                if (max_allowed_melds >= 4) {
                    gui_melds.textContent = "∞"

                }
                break;
            case "progressive strait":
                max_allowed_straits++;
                var gui_straits = document.getElementById("gui_straits")
                if (max_allowed_straits > 2) {
                    gui_straits.textContent = String(max_allowed_straits)
                }
                if (max_allowed_straits >= 5) {
                    gui_straits.textContent = "∞"

                }
                break;
            case "Shuffle":
                audio_unconnect.play();
                board.forEach(element => {
                    var brick_child = element.brick_copy.childNodes[1]
                    brick_child.style.top = ((Math.random() * 0.6 + 0.1) * window.innerHeight) + "px";
                    brick_child.style.left = ((Math.random() * 0.8 + 0.1) * window.innerWidth) + "px";
                });
                merges.forEach(element => {
                    var merge_copy = element.merge_copy
                    merge_copy.style.top = ((Math.random() * 0.6 + 0.1) * window.innerHeight) + "px";
                    merge_copy.style.left = ((Math.random() * 0.8 + 0.1) * window.innerWidth) + "px";
                });
                break;
            case "Unmerge":
                audio_unconnect.play();
                if (merges.length >= 1) {
                    var merg = merges[Math.floor(Math.random() * merges.length)];
                    if (merg.sub_cards.length < 13) {
                        unMerge(merg.merge_copy)
                    }
                }
                break;
            default:
                console.log("error, invalid item recived " + items[id])
                break;
        }

    }
}

function gameLoop() {
    createBord()
    //check_for_merge()

    //send_check()
    // showText(max_allowed_melds)
    // showText(max_allowed_straights)
}

function createBord() {
    if (Object.keys(slot_data).length === 0) { return false; }
    const card_order = slot_data["card_order"]


    while (cards_to_add > 0) {
        //check if already added all cards
        if (total_added_cards >= card_order.length) { return false; }


        let brick_copy = preset_brick.cloneNode(true);
        brick_copy.setAttribute('id', "card: " + total_added_cards);
        //console.log(brick_copy.childNodes)
        var brick_child = brick_copy.childNodes[1]
        if (brick_child.id != "brick") throw "bad child of preset brick";
        brick_child.style.top = ((Math.random() * 0.6 + 0.1) * window.innerHeight) + "px";
        brick_child.style.left = ((Math.random() * 0.8 + 0.1) * window.innerWidth) + "px";
        new init_block(brick_child);

        const card = card_order[total_added_cards] // this shouldnt use id, need to only count the ids of cards, not other objects
        const temp = card.split(" ")[1].split("-")

        var suit = temp[0]
        var suit_int = suits_to_int[suit]
        var value = temp[1]

        //console.log(brick_child.childNodes);

        // var scale = Math.sqrt(window.innerHeight**2+window.innerWidth) / 1000
        var scale = 1
        // console.log(scale)
        //console.log(window.innerHeight)

        var canvas = brick_child.childNodes[5];
        //console.log(card_sheets)
        canvas.getContext('2d').drawImage(
            card_sheets[suit_int],
            64 * (Number(value) - 1),
            96 * 0,
            64,
            96,
            0,
            0,
            64 * scale,
            96 * scale
        );


        boardDIV.appendChild(brick_copy)
        board.push(new Card(brick_copy, suit, value, false))
        total_added_cards++;
        cards_to_add -= 1 / slot_data["CARD_PER_ITEM"];
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

class Card {
    brick_copy;
    suit;
    value;
    selected;

    constructor(brick_copy, suit, value, selected) {
        this.brick_copy = brick_copy;
        this.suit = suit;
        this.value = value;
        this.selected = selected;

    }
}

class Merge {
    type;
    sub_cards;
    merge_copy;

    constructor(type, sub_cards, merge_copy) {
        this.type = type;
        this.sub_cards = sub_cards;
        this.merge_copy = merge_copy;
    }
}




function crate_merge(type, cards_to_merge, from_datastorage = false) {
    let merge_copy = preset_merge.cloneNode(true);

    new init_merge(merge_copy)

    boardDIV.appendChild(merge_copy)

    merge_copy.style.top = (cards_to_merge[0].brick_copy.childNodes[1].offsetTop) + "px";
    merge_copy.style.left = (cards_to_merge[0].brick_copy.childNodes[1].offsetLeft) + "px";

    cards_to_merge.forEach(element => {
        element.selected = false;
        var newCanvas = document.createElement('canvas');
        var oldCanvas = element.brick_copy.childNodes[1].childNodes[5];//.cloneNode(true)


        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;
        var newContext = newCanvas.getContext('2d');
        newContext.drawImage(oldCanvas, 0, 0);
        merge_copy.appendChild(newCanvas);
        element.brick_copy.childNodes[1].childNodes[7].style.display = "none";
        element.brick_copy.style.display = "none"

        board.splice(board.indexOf(element), 1)
    });
    merges.push(new Merge(type, cards_to_merge, merge_copy))




    //console.log("new merge")
    //showText("new " + type + " created")
    audio_cardflick.play();




    if (!from_datastorage) {
        var values = []
        cards_to_merge.forEach(element => {
            values.push(element.suit + "-" + element.value)
        });
        // updates data storage
        let data_op = [{ operation: "update", value: [values.toString()] }]
        //console.log("value that is sent to data storage: " + values.toString())
        //data_op.implement(API.DataStorageOperation)
        let mess = { cmd: "Set", default: [], key: "rummy merges: " + client.name, operations: data_op, want_reply: false }
        client.socket.send(mess)
    }
    //new API.SetPacket("Set",[],  API.UpdateDataStorageOperation, false))


    send_check()



    return
}

function check_for_merge() {
    var cards_to_merge = []
    board.forEach(element => { if (element.selected) { cards_to_merge.push(element) } });


    if (cards_to_merge.length < 3) { return }
    cards_to_merge.sort((function (a, b) { return a.value - b.value; }))


    // test for strait
    var failed = false
    var test_suit = cards_to_merge[0].suit
    var test_value = cards_to_merge[0].value
    for (let i = 1; i < cards_to_merge.length; i++) {
        const card = cards_to_merge[i];
        if (!((card.value == String(Number(test_value) + 1)) && (card.suit == test_suit))) {
            failed = true;
            break;
        }
        test_value++;
    }
    if (!failed) {
        if ((cards_to_merge.length <= max_allowed_straits) || (max_allowed_straits >= 5)) {
            crate_merge("strait", cards_to_merge)
            return;
        } else {
            showText("You dont have enought progresive strait for this")
        }
    }



    //test meld
    failed = false
    test_value = cards_to_merge[0].value
    test_suit = []
    for (let i = 0; i < cards_to_merge.length; i++) {
        const card = cards_to_merge[i];
        if (!((card.value == test_value) && (!test_suit.includes(card.suit)))) {
            failed = true;
            break;
        }
        test_suit.push(card.suit);
    }
    if (!failed) {
        if ((cards_to_merge.length <= max_allowed_melds) || (max_allowed_melds >= 4)) {
            crate_merge("meld", cards_to_merge)
            return;
        } else {
            showText("You dont have enought progresive meld for this")
        }
    }


    //console.log("Illiga merge tried")
    showText("Illegal merge tried")
    audio_bad.play();

    cards_to_merge.forEach(element => {
        element.selected = false
        element.brick_copy.childNodes[1].childNodes[7].style.display = "none";

    });

}


function unMerge(merge, set_select = false) {
    audio_cardflick.play();

    var this_merge = merges.find((element) => (element.merge_copy == merge))
    if (this_merge == undefined) {
        throw new Error("Could not find merge to delete in board ");
    }

    var posX = this_merge.merge_copy.offsetTop
    var posY = this_merge.merge_copy.offsetLeft

    var i = 0
    this_merge.sub_cards.forEach(element => {
        element.brick_copy.style.display = "block"
        var brick_child = element.brick_copy.childNodes[1]
        brick_child.style.top = (posX) + "px";
        brick_child.style.left = (posY + i * (64 + 4) - 4) + "px";
        if (set_select) {
            element.brick_copy.childNodes[1].childNodes[7].style.display = "block";
            element.selected = set_select
        }
        i++;
        board.push(element)
    });


    if (true) {
        var values = []
        this_merge.sub_cards.forEach(element => {
            values.push(element.suit + "-" + element.value)
        });
        // updates data storage
        let data_op = [{ operation: "remove", value: values.toString() }]
        //data_op.implement(API.DataStorageOperation)
        let mess = { cmd: "Set", default: [], key: "rummy merges: " + client.name, operations: data_op, want_reply: false }
        client.socket.send(mess)
    }

    this_merge.merge_copy.remove();
    merges.splice(merges.indexOf(this_merge), 1)

    send_check()

}

function send_check() {
    var amount_merges = 0
    merges.forEach(element => {
        amount_merges += element.sub_cards.length
    });

    var gui_merges = document.getElementById("gui_merges")
    gui_merges.textContent = String(amount_merges)


    var list_to_check = []
    for (let id = 1; id <= amount_merges; id++) {
        list_to_check.push(id + 10_000)
        // client.check(id + 10_000)
    }
    client.check(...list_to_check);

    if (board.length == 0 && !won) {
        client.goal();
        audio_win.play();
        showText("Congratulations! you completed ap-rummy");
        won = true
    }
}




export { InitGame, OnitemsReceived, merges, board, unMerge }