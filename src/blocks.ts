import { board, unMerge } from "./game.js"



class dragElement {
  pos1 : number
  pos2 : number
  pos3 : number
  pos4 : number
  elmnt : any

  constructor(elmnt) {
    this.pos1 = 0;
    this.pos2 = 0;
    this.pos3 = 0;
    this.pos4 = 0;
    this.elmnt = elmnt;
    this.elmnt.onmousedown = this.dragMouseDown.bind(this);

  }


  dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    document.onmouseup = this.closeDragElement.bind(this);
    // call a function whenever the cursor moves:
    document.onmousemove = this.elementDrag.bind(this);

  }

  elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    this.pos1 = this.pos3 - e.clientX;
    this.pos2 = this.pos4 - e.clientY;
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    // set the element's new position:
    this.elmnt.style.top = (this.elmnt.offsetTop - this.pos2) + "px";
    this.elmnt.style.left = (this.elmnt.offsetLeft - this.pos1) + "px";
  }
  closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    //try_merge(elmnt)

  }
}

// Make the DIV element draggable:
//new dragElement(document.getElementById("brick"));


class init_block extends dragElement {
  constructor(elmnt) {
    super(elmnt)
  }

  dragMouseDown(e) {
    if (e.ctrlKey) {
      //make this object selected
      let found = false
      board.forEach(element => {
        if (element.brick_copy.childNodes[1] == this.elmnt) {
          found = true
          if (!element.selected) {
            element.selected = true
            element.brick_copy.childNodes[1].childNodes[7].style.display = "block";
          } else {
            element.selected = false
            element.brick_copy.childNodes[1].childNodes[7].style.display = "none";
          }
        }
      });
      if (!found) {
        console.log("did not find element that was clicked on")
        console.log(this.elmnt)
        console.log(board)
      }
    }

    super.dragMouseDown(e)
    this.elmnt.style.zIndex = 15;

  }


  closeDragElement() {
    super.closeDragElement()
    this.elmnt.style.zIndex = 10;


  }
}


class init_merge extends dragElement {
  constructor(elmnt) {
    super(elmnt)
  }

  dragMouseDown(e) {
    if (e.shiftKey) {
      unMerge(this.elmnt)
    } else {
      super.dragMouseDown(e)
    }
  }

}


export { init_block, init_merge }