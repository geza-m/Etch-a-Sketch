const PEN = 'pen';
const ERASEALL = 'eraseCanvas';
const BUCKET = 'bucket';
const RESIZE = 'resize';
const SAVE = 'save';
const LOAD = 'load';

let canvasWidth = 16;
let canvasHeight = 16;

let isDrawing = false;
let currentColor = '#40c6e7';
let colorToFill="#ffffff" //the color to be substituted by the fill
let transparentColor = '#eeeeee';

let container = document.querySelector('#container');
let activeMenu;

const makeDraggable =(id) => {
    const menu = document.querySelector(id);
    addEventListenersForDrag(menu);
}

makeDraggable("#colormenu");
makeDraggable("#toolsMenu");
makeDraggable('#resizemenu');
makeDraggable("#savemenu");

//create drawing grid
function createGrid(width, height){

    const viewHeight = window.innerHeight;
    const viewWidth = window.innerWidth;

    const totalSquares = width * height;

    let squareSize;
    if (viewWidth < viewHeight) {
        squareSize =  Math.floor(viewWidth/canvasWidth*0.8);
    }
    else {
        squareSize =  Math.floor(viewHeight/canvasHeight*0.8);
    }

    // for (let i=0; i < totalSquares; i++) {
    //     const square =document.getElementById(`s${i}`);
    //     square.style.width = `${squareSize}px`;
    //     square.style.height = `${squareSize}px`;
    // }

    for (let i = 0; i < height; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        container.append(row);
    
        for (let j = 0; j < width; j++) {
            
            const square = document.createElement('div');
            square.classList.add('square');
            square.setAttribute('id',"s"+(i*width+j).toString());
            square.style.width = `${squareSize}px`;
            square.style.height = `${squareSize}px`;
            square.style.backgroundColor = transparentColor;
            row.append(square);
        }
    }




}

createGrid(canvasWidth,canvasHeight);

function removeGrid() {
    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }
 

}


const rgba2hex = (rgba) =>{
    if (rgba.charAt(0) ==="#") {
        return rgba}
            return `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`}

//toolsMenu menu
const toolsMenu = document.querySelector('#toolsMenu');
toolsMenu.addEventListener('click', (e) => {
    console.log('tool',e.target.id);
    switch (e.target.id) {
        case PEN: {
            changeState(penState);
            
            break;
        } 
        case ERASEALL: {
            eraseCanvas();
            break;
        } 
        case BUCKET: {
            changeState(paintBucketState)
            
            break;
        } 
        case RESIZE: {
    
            showResizeMenu();
            dimBackground('resizemenu');
            const cancel = document.getElementById('resizeCancel');
            const ok = document.querySelector('#resizeOk');

            function resizeOK() { 
                const newHeight = parseInt(document.querySelector('#heightinput').value);
                const newWidth =  parseInt(document.querySelector('#widthinput').value);
                resizeCanvas(newWidth, newHeight);
                resizeCancel();
            }
            function resizeCancel() { 
                unDimBackground();
                hideResizeMenu();
                ok.removeEventListener('click', resizeOK);
                cancel.removeEventListener('click', resizeCancel);

            }
            ok.addEventListener('click',resizeOK );
            cancel.addEventListener('click', resizeCancel);
            break;
        } 
        case SAVE: {
            saveData();
            break;
        } 
        case LOAD: {
            loadData();
            break;
        } 
    }
});

function eraseCanvas() {
    const totalSquares = canvasWidth*canvasHeight;
    for (let i=0; i < totalSquares; i++) {
        document.getElementById(`s${i}`).style.backgroundColor = transparentColor;
    }
}

function saveData() {
    const gridData = gridToJSONData();
    localStorage.setItem("gridData", gridData);
}

function loadData() {
    const gridData = localStorage.getItem("gridData");
    const gridArray = JSON.parse(gridData);
    drawGridData(gridArray,canvasWidth,canvasHeight);

}


//dim background during menu pop-up
function dimBackground(nonDimmedElementId) {
    const cont = document.querySelector('#maincontainer');
    for (var i = 0; i < cont.children.length; i++) {
        if (cont.children[i].id != nonDimmedElementId) {
            cont.children[i].style['pointer-events'] = 'none';
            cont.children[i].classList.add('dimmed');
        }
    }
}
function unDimBackground() {
    const cont = document.querySelector('#maincontainer');
    for (var i = 0; i < cont.children.length; i++) {
            cont.children[i].style['pointer-events'] = 'all';
            cont.children[i].classList.remove('dimmed');
    }
}
//resize
function showResizeMenu() {
    const resizeMenu = document.querySelector('#resizemenu');
    resizeMenu.style.visibility = "visible";
    document.querySelector('#widthinput').value = canvasWidth;
    document.querySelector('#heightinput').value = canvasHeight;
   
}
function hideResizeMenu() {
    const resizeMenu = document.querySelector('#resizemenu');
    resizeMenu.style.visibility = "hidden";
}

function gridToJSONData() {
    const gridArray = [];
    const totalSquares = canvasWidth*canvasHeight;
    for (let i=0; i < totalSquares; i++) {
        gridArray.push(document.getElementById(`s${i}`).style.backgroundColor);
    }
    return JSON.stringify(gridArray);
}

function gridToArray() {
    const gridArray = [];
    const totalSquares = canvasWidth*canvasHeight;
    for (let i=0; i < totalSquares; i++) {
        gridArray.push(document.getElementById(`s${i}`).style.backgroundColor);
    }
    return gridArray;
}

function drawGridData(gridData, newWidth, newHeight) {

    const totalSquares = canvasWidth*canvasHeight;
    const startColumn = Math.max(0,Math.floor((newWidth - canvasWidth)/2));
    const startRow = Math.max(0,Math.floor((newHeight - canvasHeight)/2));
    const newTotalSquares = newWidth * newHeight;

    const startPos = startRow*newWidth + newHeight;
    for (let i=0; i < totalSquares; i++) {
        //let n = (startRow + Math.floor(i/canvasWidth))*width + startColumn  + (i%canvasHeight);
        let n = startRow*newWidth + startColumn + Math.floor(i/canvasWidth)*newWidth  + (i%canvasWidth);
        if (n >=0 && n < newTotalSquares) {
            document.getElementById(`s${n}`).style.backgroundColor = gridData[i];
        }

    }

}

function resizeCanvas(newWidth, newHeight) {
    
    const gridData = gridToArray();
    removeGrid();
    createGrid(newWidth, newHeight);
    // Math.floow(i/6) = row
    // i%6 = column
    drawGridData(gridData, newWidth, newHeight);
    canvasWidth = newWidth;
    canvasHeight = newHeight;
}


//floodfill
async function floodfill(id) {
    const sq = document.querySelector(`#${id}`);
    const squarenum = parseInt(id.substring(1)); //remove 1st letter from id e.g: s21 -> 21 
    if ( squarenum < 0 || squarenum >= canvasWidth * canvasHeight) {return;}
    if (rgba2hex(sq.style.backgroundColor) === rgba2hex(currentColor)) {return;}
    if (rgba2hex(sq.style.backgroundColor) != rgba2hex(colorToFill)) {return;}
    
    sq.style.backgroundColor = currentColor;
    
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const d=10;
    await delay(d);

    const down = squarenum+canvasWidth;
    if (down < canvasWidth*canvasHeight) {
        floodfill(`s${down}`);
    }
    const up = squarenum-canvasWidth;
    if (up >=0 ) {
        floodfill(`s${up}`);
    }
    const left = squarenum+1;
    if (left >= Math.floor(squarenum/canvasWidth)*canvasWidth) {
        floodfill(`s${left}`);
    }
    const right = squarenum-1;
    if (right < Math.floor(squarenum/canvasWidth)*canvasWidth+canvasWidth) {
        floodfill(`s${right}`);
    }
}

//disable right click context menu
container.addEventListener('contextmenu', (event)=> {
    event.preventDefault();
})

//zoom with mouse wheel
let scale = 1;
const elements = document.querySelectorAll(".square");
document.addEventListener('wheel', (event)=> {
    event.preventDefault();

    const newScale = event.deltaY > 0 ? scale - 0.08 : scale + 0.08;
    if (newScale > 0.01 && newScale < 5) {
        scale = newScale;
    }
    container.style.transform = `scale(${scale})`;
    // add { passive: false } preventDefault inside passive event listener -> wheel event is passive as default = no waiting for js
}, { passive: false });

//mouse input PEN and BUCKET
container.addEventListener('mousedown', (e)=>{

    if (e.button === 0) {
        switch (currentState.name) {
            case BUCKET: {
                colorToFill=e.target.style.backgroundColor; //the color to be substituted by the fill
                floodfill(e.target.id); 
                break;
            }
            case PEN: {
                    isDrawing = true;
                    e.target.style.backgroundColor = currentColor;
                break;
            }
        } 
    }   
    else if (e.button === 2) {
        let color = e.target.style.backgroundColor;
        currentColor= (color === "") ? transparentColor : rgba2hex(color);
        colorPicker.value=currentColor;
    }


});

container.addEventListener('mouseover',(e)=>{

    if (isDrawing) {
        e.target.style.backgroundColor = currentColor;
        if (e.button === 0) {
        }
    }
});

container.addEventListener('mouseup', (e)=>{
    isDrawing = false;
    //reactivate pointer event on the context menu 
    colorMenu.style['pointer-events'] = 'auto'
});



//touch input
container.addEventListener('touchmove',(e)=>{
    e.preventDefault();
        //deactivate pointer event to not catch the context menu instead of a square
        colorMenu.style['pointer-events'] = 'none';

        const touch = e.touches[0];
        const el=document.elementFromPoint(touch.clientX,touch.clientY);
        el.style.backgroundColor = currentColor;
        
});

container.addEventListener('touchend',(e)=>{
        //reactivate pointer event on the context menu
        colorMenu.style['pointer-events'] = 'auto';   
});


//color picker
function updateColorPickerColor() {
    colorPicker.value=rgba2hex(currentColor);
}
const colorPicker = document.querySelector('#colorPicker');
updateColorPickerColor();
colorPicker.addEventListener("input", updateColor, false);
colorPicker.addEventListener("change", watchColorPicker, false);

function watchColorPicker(event) {
    createSwatch();
}

function updateColor(e) {
    currentColor=e.target.value;
}

function createSwatch() {
    const palette = document.querySelector('#palette');
    const swatch =document.createElement('div');
    swatch.classList.add('swatch','clickable');
    swatch.style.backgroundColor = currentColor;
    palette.append(swatch); 
}



//palette 
swatches = document.querySelectorAll('.swatch');
swatches.forEach(swatch => {
    swatch.style.backgroundColor = currentColor;
});

//floating menu
var colorMenu = document.querySelector("#colormenu");
var isDragging = false;
var mouseX = 0;
var mouseY = 0;
let clientX;
let clientY;

//drag menu
function addEventListenersForDrag(elem) {
    if (!elem) {return;}
    elem.addEventListener("mousedown", function(e) {
    
        isDragging = true;
        mouseX = e.clientX - elem.offsetLeft;
        mouseY = e.clientY - elem.offsetTop;
    });
    
    elem.addEventListener("mousemove", function(e) { 
        if (isDragging) {
            elem.style.left = e.clientX - mouseX + "px";
            elem.style.top = e.clientY - mouseY + "px";
        }
    });
    
    elem.addEventListener("touchstart", function(e) {
    
        isDragging = true;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        mouseX = clientX - elem.offsetLeft;
        mouseY = clientY - elem.offsetTop;
    
    });
    
    elem.addEventListener("touchmove", function(e) {
    
        e.preventDefault();
        if (isDragging) {
    
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            elem.style.left = clientX - mouseX + "px";
            elem.style.top = clientY - mouseY + "px";  
        }
    });
    
    elem.addEventListener("touchend", function(e) {
        isDragging = false;
    });
    
    elem.addEventListener("mouseup", function() {
    isDragging = false;
    });
}

//pick swatches 
const palette = document.querySelector('#palette');
palette.addEventListener('click', function(e) {
    if (e.target.classList.contains('swatch')) {
        currentColor = e.target.style.backgroundColor;
        updateColorPickerColor();
    }
});


function highlightToolButton(id) {
    const tool = document.querySelector(id);
    tool.classList.add("highlight");
}
function removehiglightFromToolButton(id) {
    const tool = document.querySelector(id);
    tool.classList.remove("highlight");
};

const penState = {
    name : PEN,
    enter: () => {
        highlightToolButton("#pen");
        container.classList.add('penCursor');
        ;
    },
    active: () => {},
    exit: () => {
        removehiglightFromToolButton("#pen");
        container.classList.remove('penCursor');
    }
}
const paintBucketState = {
    name : BUCKET,
    enter: () => {
        highlightToolButton("#bucket");
        container.classList.add('paintbucketCursor');
        },
    active: () => {},
    exit: () => {
        removehiglightFromToolButton("#bucket");
        container.classList.remove('paintbucketCursor')}
}

let currentState;
function changeState(newState) {
    if (currentState) {currentState.exit();} 
    newState.enter()
    currentState = newState;
}


changeState(penState);