
/**Paths to used images */
const TILE_NORMAL_PATH = "./images/tile_default.png";
const TILE_FLAG_PATH = "./images/tile_flag.png";
const TILE_BOMB_PATH = "./images/tile_bomb.png";
const TILE_CHECKED_PATH = "./images/tile_checked.png";
const TILE_ONE_PATH = "./images/tile_one.png";
const TILE_TWO_PATH = "./images/tile_two.png";
const TILE_THREE_PATH = "./images/tile_three.png";
const TILE_FOUR_PATH = "./images/tile_four.png";
const TILE_FIVE_PATH = "./images/tile_five.png";
const TILE_SIX_PATH = "./images/tile_six.png";
const TILE_SEVEN_PATH = "./images/tile_seven.png";
const TILE_EIGHT_PATH = "./images/tile_eight.png";
const TILE_INFINITY_PATH = "./images/tile_infinity.png";

const KABOOM_SOUND = "./sounds/kaboom.mp3";

const NUMERIC_TILES = [TILE_ONE_PATH, TILE_TWO_PATH, TILE_THREE_PATH, TILE_FOUR_PATH, TILE_FIVE_PATH, TILE_SIX_PATH, TILE_SEVEN_PATH, TILE_EIGHT_PATH];

/**Field parameters */
const FIELD_DIM = 12;
const FIELD_SIZE = FIELD_DIM * FIELD_DIM;

/** Classnames */
const GRID_CLASSNAME = '.grid';
const TILE_CLASSNAME = 'tile';
const ATTRIBUTE_TILENAME = 'data-tile';
const ATTRIBITE_CHECKED = 'tile--checked';
const ATTRIBITE_FLAGGED = 'tile--flagged';
const ATTRIBUTE_BOMB = 'tile--bomb';

/** In-game parameters */
let bombs = [];
let numbers = [];
let grid;
let bombFrequency = 0.2; 
let gameOver = false;


/**Solves if there will be a bomb on the tile */
function do_solution(x, y){
    bombs.push(`${x},${y}`);
    if (x > 0) numbers.push(`${x-1},${y}`);
    if (x < FIELD_DIM - 1) numbers.push(`${x+1},${y}`);
    if (y > 0) numbers.push(`${x},${y-1}`);
    if (y < FIELD_DIM - 1) numbers.push(`${x},${y+1}`);
    if (x > 0 && y > 0) numbers.push(`${x-1},${y-1}`);
    if (x < FIELD_DIM - 1 && y < FIELD_DIM - 1) numbers.push(`${x+1},${y+1}`);
    if (y > 0 && x < FIELD_DIM - 1) numbers.push(`${x+1},${y-1}`);
    if (x > 0 && y < FIELD_DIM - 1) numbers.push(`${x-1},${y+1}`);
}


/** Parses and splits coordinates */
function parse_coordinates(){
    for(let i=0; i < numbers.length; i++){
        let num = numbers[i];
        let coords = num.split(',');
		let tile = document.querySelectorAll(`[data-tile="${parseInt(coords[0])},${parseInt(coords[1])}"]`)[0];
		let dataNum = parseInt(tile.getAttribute('data-num'));
		if (!dataNum) dataNum = 0;
		tile.setAttribute('data-num', dataNum + 1);
    }
}

/**Processes one tile */
function process_tile(tile, x, y){
    tile.setAttribute(ATTRIBUTE_TILENAME, `${x},${y}`);
    let random_boolean = Math.random() < bombFrequency;
    if (random_boolean) do_solution(x,y);

    //Right mouse button click event
    tile.oncontextmenu = function(e) {
        e.preventDefault();
        add_flag(tile);
    }

    //Left mouse button click event
    tile.addEventListener('click', function(e) {
        clickTile(tile);
    });
}

/**Process field */
function process_field(grid){
    let x = 0;
    let y = 0;
    for(const tile of grid.children){
        process_tile(tile, x, y);
        x++;
        if (x >= FIELD_DIM) {
            x = 0;
            y++;
        }
    }
    parse_coordinates();

}

/** Clears numbers and bombs arrays */
function clear_arrays(){
    numbers = [];
    bombs = [];
    gameOver = false;
    
}

/**Creates game field */
function create_board(grid){
    if(!grid) return
    clear_arrays();
    for(let i = 0; i < FIELD_SIZE; i++){
        const tile = document.createElement('img');
        tile.classList.add(TILE_CLASSNAME);
        tile.setAttribute('src', TILE_NORMAL_PATH);
        grid.appendChild(tile);
    }
    process_field(grid);
}

/**Put a flag on a tile (or remove) */
function add_flag(tile){
	if (gameOver) return;
	if (!tile.classList.contains(ATTRIBITE_CHECKED)) {
		if (!tile.classList.contains(ATTRIBITE_FLAGGED)) {
			tile.setAttribute('src', TILE_FLAG_PATH);
			tile.classList.add(ATTRIBITE_FLAGGED);
			} else {
			tile.setAttribute('src', TILE_NORMAL_PATH);
			tile.classList.remove(ATTRIBITE_FLAGGED);
		}
	}
}


/**Left mouse button click on tile */
const clickTile = (tile) => {
	if (gameOver) return;
	if (tile.classList.contains(ATTRIBITE_CHECKED) || tile.classList.contains(ATTRIBITE_FLAGGED)) return;
	let coordinate = tile.getAttribute(ATTRIBUTE_TILENAME);
	if (bombs.includes(coordinate)) {
		endGame(tile);
		} else {
		
		let num = tile.getAttribute('data-num');
		if (num != null) {
			tile.classList.add(ATTRIBITE_CHECKED);
            tile.setAttribute('src', TILE_CHECKED_PATH);
            if(num < 0 || num > NUMERIC_TILES.length) tile.setAttribute('src', TILE_INFINITY_PATH);
            else tile.setAttribute('src', NUMERIC_TILES[num-1]);
            console.log(`There are ${num} bombs around!`);
            if(num == 0 ) tile.setAttribute('src', TILE_CHECKED_PATH);
			setTimeout(() => {
				checkVictory();
			}, 100);
			return;
		}
		checkTile(tile, coordinate);
	}
	tile.classList.add(ATTRIBITE_CHECKED);
    tile.setAttribute('src', TILE_CHECKED_PATH);
}




/**Check tiles nearby */
const checkTile = (tile, coordinate) => {

	let coords = coordinate.split(',');
	let x = parseInt(coords[0]);
	let y = parseInt(coords[1]);
	
	setTimeout(() => {
		if (x > 0) {
			let targetW = document.querySelectorAll(`[data-tile="${x-1},${y}"`)[0];
			clickTile(targetW, `${x-1},${y}`);
		}
		if (x < FIELD_DIM - 1) {
			let targetE = document.querySelectorAll(`[data-tile="${x+1},${y}"`)[0];
			clickTile(targetE, `${x+1},${y}`);
		}
		if (y > 0) {
			let targetN = document.querySelectorAll(`[data-tile="${x},${y-1}"]`)[0];
			clickTile(targetN, `${x},${y-1}`);
		}
		if (y < FIELD_DIM - 1) {
			let targetS = document.querySelectorAll(`[data-tile="${x},${y+1}"]`)[0];
			clickTile(targetS, `${x},${y+1}`);
		}
		
		if (x > 0 && y > 0) {
			let targetNW = document.querySelectorAll(`[data-tile="${x-1},${y-1}"`)[0];
			clickTile(targetNW, `${x-1},${y-1}`);
		}
		if (x < FIELD_DIM - 1 && y < FIELD_DIM - 1) {
			let targetSE = document.querySelectorAll(`[data-tile="${x+1},${y+1}"`)[0];
			clickTile(targetSE, `${x+1},${y+1}`);
		}
		
		if (y > 0 && x < FIELD_DIM - 1) {
			let targetNE = document.querySelectorAll(`[data-tile="${x+1},${y-1}"]`)[0];
			clickTile(targetNE, `${x+1},${y-1}`);
		}
		if (x > 0 && y < FIELD_DIM - 1) {
			let targetSW = document.querySelectorAll(`[data-tile="${x-1},${y+1}"`)[0];
			clickTile(targetSW, `${x-1},${y+1}`);
		}
	}, 10);
}

/**End of the game */
const endGame = (tile)=>{
	gameOver = true;
    tile.setAttribute('src', TILE_BOMB_PATH);
    var audio = new Audio(KABOOM_SOUND);
    audio.play();

    for(const current_tile of grid.children){
        let coordinate = current_tile.getAttribute(ATTRIBUTE_TILENAME);
		if (bombs.includes(coordinate)) {
			current_tile.classList.remove(ATTRIBITE_FLAGGED);
			current_tile.classList.add(ATTRIBITE_CHECKED, ATTRIBUTE_BOMB);
            current_tile.setAttribute('src', TILE_BOMB_PATH);
        }	 
    }

    alert("GAME OVER! U EXPLODED URSELF!");
}

/** Are ya winning son?  */
const checkVictory = () => {
	let win = true;
    for(const ctile of grid.children){
        let coordinate = ctile.getAttribute(ATTRIBUTE_TILENAME);
		if (!ctile.classList.contains(ATTRIBITE_CHECKED) && !bombs.includes(coordinate)) win = false;
    }
	if (win) {
		alert("Congratulations! You won!");
		gameOver = true;
	}
}



/**Game start function */
function start(){
    clear_arrays();
    grid = document.querySelector(GRID_CLASSNAME);
    grid.replaceChildren();
    create_board(grid);
    alert(`On the field were created ${bombs.length} bombs!`);
}




start();
