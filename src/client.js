//import readline from "node:readline";

import { Client } from "https://unpkg.com/archipelago.js/dist/archipelago.min.js";
import {InitGame, OnitemsReceived} from "./game.js"
//import { Client } from "archipelago.js";

// https://stackoverflow.com/a/71574505
var params = window.location.search.slice(1).split("&");
//convert the params to an object
var data = params.reduce((obj, param) => {
    var pair = param.split("=");
    return {
        ...obj,
        [pair[0]]: decodeURIComponent(pair[1])
    }
}, {});
//console.log({data});
//insert values by matching input name to data object key
const fillable_forms = ["Hostname", "Port", "Name", "Password"]
for (var index in fillable_forms) {
    const key = fillable_forms[index]
    if (key in data) {
        document.getElementById(key).value = data[key]
    }
}
// document.querySelectorAll("input").forEach(input => input.value = data[input.name]);



// Create a new Archipelago client
const client = new Client();

// start chat from phar
client.messages.on("message", onMessage);


function onMessage(text, nodes) {
    // Plaintext to console, because why not?
    console.log(text);

    const chat = document.getElementById("chat");
    const messageElement = document.createElement("div");

    for (const node of nodes) {
        const nodeElement = document.createElement("span");
        nodeElement.innerText = node.text;

        switch (node.type) {
            case "entrance":
                nodeElement.style.color = "#6495ED";
                break;

            case "location":
                nodeElement.style.color = "#00FF7F";
                break;

            case "color":
                // not really correct, but technically the only color nodes the server returns is "green" or "red"
                // so it's fine enough for an example.
                nodeElement.style.color = node.color;
                break;

            case "player":
                if (node.player.slot === client.players.self.slot) {
                    // It's us!
                    nodeElement.style.color = "#EE00EE";
                } else {
                    // It's them!
                    nodeElement.style.color = "#FAFAD2";
                }
                break;

            case "item": {
                // doesn't account for prog+useful or other combinations, but this is just as an example
                if (node.item.progression) {
                    nodeElement.style.color = "#AF99EF";
                } else if (node.item.useful) {
                    nodeElement.style.color = "#6D8BE8";
                } else if (node.item.trap) {
                    nodeElement.style.color = "#FA8072";
                } else {
                    nodeElement.style.color = "#00EEEE";
                }
            }

            // no special coloring needed
            case "text":
            default:
                break;
        }

        messageElement.appendChild(nodeElement);
    }

    chat.appendChild(messageElement);
    messageElement.scrollIntoView(false);
}
// end chat from phar

const form = document.getElementById("connection_details")




// Connect to the Archipelago server
async function connect_to_server(event) {
    if (event !== null) {
        event.preventDefault()
    }
    var url = document.getElementById("Hostname").value + ":" + document.getElementById("Port").value
    var slot = document.getElementById("Name").value
    var password = document.getElementById("Password").value ? document.getElementById("Password").value : null
    var conn_options = {
        password: password,
        "slot_data" : true
    }
    if ("Protocol" in data) {
        var pro = data["Protocol"].split("://").pop().split("@")
        url = pro[1]
        slot = pro[0].split(":")[0]
        conn_options["password"] = password ?? pro[0].split(":")[1]
    }
    console.log(url)
    console.log(slot)


    try{
        var slot_data = await client.login(url, slot, "AP-Rummy", conn_options)
        console.log("connected")
        InitGame(slot_data)
    }
    catch(error){
            console.error("Failed to connect:", error);
    }

}
form.addEventListener("submit", connect_to_server);


client.items.on("itemsReceived", async (items, index) => {
    await OnitemsReceived(items, index)

});


// Disconnect from the server when unloading window.
window.addEventListener("beforeunload", () => {
     client.disconnect();
})

if (false) {
    client.goal();
    client.check(id);
}

if (data["auto"] === "True") {
    console.log("autoconnecting")
    connect_to_server(null)
}


function send_message(e){
    var messageDIV = document.getElementById("Message")
    if (client.ClientStatus != 0){
    client.messages.say(messageDIV.value);
    messageDIV.value = ""
    } else {
        messageDIV.value = "faild to send, not connected"

    }

  e.preventDefault();
}
var message_forum = document.getElementById("send_chat_forum");
message_forum.addEventListener("submit", send_message);



