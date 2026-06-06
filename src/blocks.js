import { board } from "./game.js"


// Make the DIV element draggable:
dragElement(document.getElementById("brick"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  elmnt.onmousedown = dragMouseDown;


  function dragMouseDown(e) {
    if (e.ctrlKey) {
      //make this object selected
      board.forEach(element => {
        if (element.brick_copy.childNodes[1] == elmnt) {
          if (!element.selected) {
            element.selected = true
            element.brick_copy.childNodes[1].childNodes[7].style.display = "block";
          } else {
            element.selected = false
            element.brick_copy.childNodes[1].childNodes[7].style.display = "none";
          }
        }
      });
    }
    if (e.shiftKey) {

    }

    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
    elmnt.style.zIndex = 11;

  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    elmnt.style.zIndex = 10;
    //try_merge(elmnt)

  }
}

export { dragElement }