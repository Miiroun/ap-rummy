//import readline from "node:readline";

import { Client, clientStatuses} from "https://unpkg.com/archipelago.js/dist/archipelago.min.js";
import { InitGame, OnitemsReceived, merges } from "./game.js"
//import { Client } from "archipelago.js";

(new URL(window.location.href)).searchParams.forEach((x, y) =>
    document.getElementById(y).value = x)

// Create a new Archipelago client
const client = new Client();

function showText(text, color = "#000000") {
    const chat = document.getElementById("chat");
    const messageElement = document.createElement("div");

    const nodeElement = document.createElement("span");
    nodeElement.innerText = text;
    nodeElement.style.color = color;


    messageElement.appendChild(nodeElement);
    chat.appendChild(messageElement);

    console.log(text)

}

//display chat
client.messages.on("message", onMessage);
function onMessage(text, nodes) {
    // Plaintext to console, because why not?
    console.log(text);

    const chat = document.getElementById("chat");
    const messageElement = document.createElement("div");

    for (const node of nodes) {
        const nodeElement = document.createElement("span");
        nodeElement.innerText = node.text;

        // could do code to change color depening on message in future
        nodeElement.style.color = "#000000";

        messageElement.appendChild(nodeElement);
    }

    chat.appendChild(messageElement);
}




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
        "slot_data": true
    }

    var slot_data
    try {
        slot_data = await client.login(url, slot, "AP-Rummy", conn_options)
        console.log("connected")
    }
    catch (error) {
        console.error("Failed to connect:", error);
        showText(error.toString())
        showText("Failed to connect, check that your hostname, port, name and password are correct and that your room is alive.")
    }
    if (slot_data) {
        InitGame(slot_data)
    }

}
const form = document.getElementById("connection_details")
form.addEventListener("submit", connect_to_server);


client.items.on("itemsReceived", async (items, index) => {
    await OnitemsReceived(items, index)

});


// Disconnect from the server when unloading window.
window.addEventListener("beforeunload", () => {
    client.disconnect();
})



function send_message(e) {
    var messageDIV = document.getElementById("Message")
    if (messageDIV.value[0] == "/") {
        const commands = ["help", "ready"]
        switch (messageDIV.value) {
            case "/help":
                showText("The avalibe commands are: " + commands + ".");
                break;
            case "/ready":
                client.updateStatus(clientStatuses.ready);
                showText("You are ready")
                break;
            default:
                showText("The command: " + messageDIV.value + ", is not defined, did you mean" + commands + ".")
                break;
        }

    } else {
        if (client.ClientStatus != 0) {
            client.messages.say(messageDIV.value);
            messageDIV.value = ""
        } else {

            showText("faild to send message, not connected?")
        }
    }
    e.preventDefault();
}
var message_forum = document.getElementById("send_chat_forum");
message_forum.addEventListener("submit", send_message);


export { client, showText }
