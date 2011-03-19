var canvas;
var context;
var scoreDiv;

var maxX = 8;
var maxY = 12;
var blockSize = 20;
var fields;

var currentBlock;
var currentBlockX;
var currentBlockY;

var moveBlockX = 0;
var moveBlockY = 0;
var rotateBlock = 0;

var BLOCK_COLORS = ["#A0A0A0", "#808080", "#FF0000", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF"];
var gradients;

var LINE_COUNT_SCORE = [1, 5, 10, 50, 100];
var PIECES = [
    // mirrored L
    [[0,0,0,0],
     [1,1,1,0],
     [0,0,1,0],
     [0,0,0,0]],
    // L
    [[0,0,0,0],
     [0,0,1,0],
     [1,1,1,0],
     [0,0,0,0]],
    // bar
    [[0,0,0,0],
     [1,1,1,1],
     [0,0,0,0],
     [0,0,0,0]],
    // 2x2 block
    [[0,0,0,0],
     [0,1,1,0],
     [0,1,1,0],
     [0,0,0,0]],
    
    [[0,0,0,0],
     [1,1,0,0],
     [0,1,1,0],
     [0,0,0,0]],
    [[0,0,0,0],
     [0,1,1,0],
     [1,1,0,0],
     [0,0,0,0]]
];

var gameTimer;
var gameSpeed = 100;
var blockSpeed = 500;
var blockDelay = 0;
// array of existing pieces
var pieces = [];

var gameStarted = false;
var gameOver = false;

var score = 0;

/**
 * Makes a matrix of the given size and fill it with the given value.
 * @param x matrix x size
 * @param y matrix y size
 * @param value value to fill the matrix with
 * @return matrix initialized matrix 
 */
function makeMatrix(x,y,value)
{
    var matrix = [];
    for ( var i = 0; i < x; i++ )
    {
        var column = [];
        for ( var j = 0; j < y; j++ )
        {
            column.push(value);        
        }
        matrix.push(column);
    }
    return matrix;
}

/**
 * Starts the game.
 */
function initGame()
{
    gameStarted = false;
    scoreDiv = document.getElementById("scoreDiv");
    canvas = document.getElementById("gameCanvas");
    canvas.width = maxX * blockSize;
    canvas.height = maxY * blockSize;
    context = canvas.getContext("2d");
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
    initGradiants();
}

function initGradiants()
{
    gradients = []; 
    for ( var i = 0; i < BLOCK_COLORS.length; i++ )
    {
//        var gradient = context.createLinearGradient(0, 0, blockSize, blockSize);
        //gradient.addColorStop(0, "black");
//        gradient.addColorStop(0, "black");
//        gradient.addColorStop(1, BLOCK_COLORS[i]);
        //gradient.addColorStop(0.5, BLOCK_COLORS[i]);
//        gradient.addColorStop(1, "white");
//        gradients.push(gradient);
        gradients.push(BLOCK_COLORS[i]);
    }
}

/**
 * Stops the game.
 */
function startGame()
{
    if ( gameTimer )
    {
        clearInterval(gameTimer);
        gameTimer = null;
    }   
 
    fields = makeMatrix(maxX, maxY, -1);
    currentBlock = makeMatrix(4, 4, -1);
    moveBlockX = 0;
    moveBlockY = 0;
    rotateBlock = 0;
    blockDelay = 0;
    score = 0;

    initPieces();
    nextPiece();
    render();

    gameTimer = setInterval(gameLoop, gameSpeed);
    gameStarted = true;
    gameOver = false;
}

/**
 * Stops the game.
 */
function stopGame()
{
   if ( gameTimer )
   {
       clearInterval(gameTimer);
       gameTimer = null;
   }
   gameStarted = false;
}

function triggerGameOver()
{
   stopGame();
   gameOver = true;
   render();
}

/**
 * Initialize the different pieces.
 */
function initPieces()
{
    pieces = PIECES; // could have another set of pieces
} 


/**
 * Rotates the given piece 90 degrees.
 * @param piece piece array
 * @param right true if direction is right, false for left
 * @return rotated piece (new instance)
 */
function rotatePiece(piece, right)
{
    var rPiece = makeMatrix(4,4,0);
    for ( var i = 0; i < 4; i++ )
    {
        var column = piece[i];
        for ( var j = 0; j < 4; j++ )
        {
            var block = column[j];
            if ( right )
                rPiece[3-j][i] = block;
            else
                rPiece[j][3-i] = block;
        }
    }
    return rPiece;
}

/**
 * Produces a new piece and put it at the starting position.
 */
function nextPiece()
{
    currentBlockX = maxX / 2 - 2;
    currentBlockY = 0;
    
    var pieceIndex = Math.floor( Math.random() * pieces.length );
    var color = Math.floor( Math.random() * gradients.length );
    var rot = Math.floor( Math.random() * 4 ) - 1;
    var piece = pieces[pieceIndex];
    for ( var i = 0; i < 4; i++ )
    {
        var column = piece[i];
        for ( var j = 0; j < 4; j++ )
        {
            var block = column[j];
            if ( block != 0 )
            {
                firstRow = i;
            }
            currentBlock[j][i] = ( block != 0 )?color:-1;
        }
    }

    
    while ( rot >= 0 )
    {
        currentBlock = rotatePiece(currentBlock, true);
        rot--;
    }

    // find first row
    var firstRow = 0;
    for ( var j = 0; j < 4; j++ )
    {
        for ( var i = 0; i < 4; i++ )
        {
            if ( currentBlock[i][j] >= 0 )
            {
                firstRow = j;
                j = 4; // force break
                break;
            }
        }
    }

    // shift block up to make the first row match with the top border
    currentBlockY -= firstRow;

    if ( pieceOverlaps( currentBlockX, currentBlockY, currentBlock ) )
    {
        triggerGameOver();
    }
}

/**
 * Draws a block at the given position.
 * @param x X position
 * @param y Y position
 * @param block block type
 */
function drawBlock(x, y, block)
{
     if ( block < 0 )
     {
         return;
     }
     context.fillStyle = gradients[block];
     context.fillRect(x, y, blockSize, blockSize);
     context.fillStyle = "#000000";
     context.strokeRect(x, y, blockSize, blockSize);
}

/**
 * Renders the game field.
 */
function render()
{
    context.fillStyle = "#FFFFFF";
    context.fillRect(0,0, blockSize * maxX, blockSize * maxY );

    var x = 0;
    var y = 0;
    for ( var i = 0; i < maxX; i++ )
    {
        var column = fields[i];
        y = 0;
        for ( var j = 0; j < maxY; j++ )
        {
            var block = column[j];
            drawBlock(x, y, block);
            y += blockSize;
        }
        x += blockSize;
    }

    x = currentBlockX * blockSize;
    y = currentBlockY * blockSize;
    for ( var i = 0; i < 4; i++ )
    {
        var column = currentBlock[i];
        y = currentBlockY * blockSize;
        for ( var j = 0; j < 4; j++ )
        {
             var block = column[j];
             drawBlock(x,y, block);
             y += blockSize;
        }
        x += blockSize;
    }

    if ( gameOver )
    {
       context.font = "bold 20px Times"; 
       context.fillStyle = "#000000";
       var gameOverText = "Game Over !"
       var m = context.measureText(gameOverText);
       context.fillText(gameOverText, canvas.width / 2 - m.width / 2, canvas.height / 2 - 10);
    }
}

/**
 * Places the piece in the field matrix.
 */
function postPiece()
{
    var x = currentBlockX;
    var y = currentBlockY;
    for ( var i = 0; i < 4; i++ )
    {
        var column = currentBlock[i];
        y = currentBlockY;
        for ( var j = 0; j < 4; j++ )
        {
            var block = column[j];
            if ( block >= 0 )
            {
                fields[x][y] = block;
            }
            y++;
        }
        x += 1;
    }

    var lineCount = processLines();
    score += LINE_COUNT_SCORE[lineCount];
    scoreDiv.innerHTML = score;
            
    nextPiece();
}

/**
 * Find whether lines must be removed, then remove them.
 * @return number of lines that have been removed
 */
function processLines()
{
    var lineCount = 0;
    var y = maxY;
    while ( y >= 0 )
    {
        var x = 0;
        // as long as there are no empty fields in the line, continue
        while ( x < maxX && fields[x][y] >= 0 )
        {
            x++;
        }

        // if the loop exited because we reached the end of the line
        if ( x >= maxX )
        {
            lineCount++;
            // it means, the line didn't contain any empty block
            // remove line by shifting down the fields
            for ( var j = y; j > 0; j-- )
            {
                for ( var i = 0; i < maxX; i++ )
                {
                    fields[i][j] = fields[i][j - 1];
                }
            }
            // TODO: very first row?
        }
        else
        {
            y--;
        }
    }
    return lineCount;
}

/**
 * Returns the block from the field matrix at the given position.
 * @param x X position
 * @param y Y position
 * @return block type or -1 if empty
 */
function blockAt(x, y)
{
    if ( x >= 0 && x < maxX
        && y >= 0 && y < maxY )
    {
        return fields[x][y];
    }
    return 1; // assume blocks outside border
}

/**
 * Returns whether the given piece would overlap with blocks in the fields matrix.
 * @param x X position of the piece
 * @param y Y position of the piece
 * @param piece piece matrix
 * @return true if an overlap would occur, false otherwise
 */
function pieceOverlaps(x,y,piece)
{
    for ( var i = 0; i < 4; i++ )
    {
        var column = piece[i];        
        for ( var j = 0; j < 4; j++ )
        {
            var block = column[j];
            if ( block >= 0 && blockAt(i + x, j + y) >= 0 )
            {
                return true;
            }
        }
    }
    return false;
}

/**
 * Game loop.
 */
function gameLoop()
{
    if ( !gameStarted )
    {
        return;
    }

    var rerender = false;
    if ( blockDelay < blockSpeed )
    {
        blockDelay += gameSpeed;
    }
    else
    {
        blockDelay = 0;
        if ( !pieceOverlaps( currentBlockX, currentBlockY + 1, currentBlock ) )
        {
            currentBlockY += 1;
        }
        else
        {
            postPiece();
       }
        rerender = true;
    }

    if ( rotateBlock != 0 )
    {
        // TODO: collision test
        var rotatedBlock = rotatePiece(currentBlock, (rotateBlock>0));
        if ( !pieceOverlaps( currentBlockX, currentBlockY, rotatedBlock ) )
        {
            currentBlock = rotatedBlock;
            rerender = true;
        }
        rotateBlock = 0;
    }

    if ( moveBlockX != 0 )
    {
        if ( !pieceOverlaps( currentBlockX + moveBlockX, currentBlockY, currentBlock) )
        {
            currentBlockX += moveBlockX;
        }
        rerender = true;
    }

    if ( moveBlockY != 0 )
    {
        if ( !pieceOverlaps( currentBlockX, currentBlockY + moveBlockY, currentBlock) )
        {
            currentBlockY += moveBlockY;
        }
        else
        {
            postPiece();
        }
        rerender = true;
    }

    if ( rerender )
    {
        render();
    }

}

/**
 * Key up event handler.
 */
function keyUp(ev)
{
    if ( ev.keyCode == 37 || ev.keyCode == 39 )
    {
        moveBlockX = 0;
        ev.preventDefault();
    }
    else if ( ev.keyCode == 40 )
    {
        moveBlockY = 0;
        ev.preventDefault();
    }
}

/**
 * Key down event handler.
 */
function keyDown(ev)
{
    if ( ev.keyCode == 37 ) // left
    {
        moveBlockX = -1;
        ev.preventDefault();
    }
    else if ( ev.keyCode == 39 ) // right
    {
        moveBlockX = 1;
        ev.preventDefault();
    }
    else if ( ev.keyCode == 38 ) // up
    {
        rotateBlock = -1;
        ev.preventDefault();
    }
    else if ( ev.keyCode == 40 ) // down
    {
        moveBlockY = 1;
        ev.preventDefault();
    }
} 
