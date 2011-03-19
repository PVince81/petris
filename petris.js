var canvas;
var context;

var maxX = 8;
var maxY = 12;
var blockSize = 20;
var fields;

var currentBlock;
var currentBlockX;
var currentBlockY;

var moveBlockX = 0;

var BLOCK_COLORS = ["#FFFFFF", "#808080", "#FF0000", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF"];

var gameTimer;
var gameSpeed = 100;
var blockSpeed = 500;
var blockDelay = 0;
// array of existing pieces
var pieces = [];

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
function gameStart()
{
    canvas = document.getElementById("gameCanvas");
    canvas.width = maxX * blockSize;
    canvas.height = maxY * blockSize;
    context = canvas.getContext("2d");
    fields = makeMatrix(maxX, maxY, -1);
    currentBlock = makeMatrix(4, 4, -1);

    initPieces();
    nextPiece();
    render();

    gameTimer = setInterval(gameLoop, gameSpeed);

    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
}

/**
 * Initialize the different pieces.
 */
function initPieces()
{
    pieces = [];
    
    // mirrored L
    pieces.push([[0,0,0,0],[1,1,1,0],[0,0,1,0],[0,0,0,0]]);
    // L
    pieces.push([[0,0,0,0],[0,0,1,0],[1,1,1,0],[0,0,0,0]]);
    // bar
    pieces.push([[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]);
    // 2x2 block
    pieces.push([[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]]);            
    
    pieces.push([[0,0,0,0],[1,1,0,0],[0,1,1,0],[0,0,0,0]]);            
    pieces.push([[0,0,0,0],[0,1,1,0],[1,1,0,0],[0,0,0,0]]);            
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
                rPiece[3-i][j] = block;            
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
    var color = Math.floor( Math.random() * BLOCK_COLORS.length );
    var rot = Math.floor( Math.random() * 4 ) - 1;
    var piece = pieces[pieceIndex];
    for ( var i = 0; i < 4; i++ )
    {
        var column = piece[i];
        for ( var j = 0; j < 4; j++ )
        {
            var block = column[j];
            currentBlock[j][i] = ( block != 0 )?color:-1;            
        }
    }
    
    while ( rot >= 0 )
    {
        currentBlock = rotatePiece(currentBlock, true);
        rot--;
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
     context.fillStyle = BLOCK_COLORS[block];
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
}

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
 * Returns whether the current piece can be moved to the given direction.
 * @param vx direction on the x axis (-1, 0 or 1)
 * @param vy direction on the y axis (-1, 0 or 1)
 * @return true if there is no block in the way, false otherwise
 */
function canMove(vx,vy)
{
    for ( var i = 0; i < 4; i++ )
    {
        var column = currentBlock[i];        
        for ( var j = 0; j < 4; j++ )
        {
            var block = column[j];
            if ( block >= 0 && blockAt(i + currentBlockX + vx, j + currentBlockY + vy) >= 0 )
            {
                return false;
            }
        }
    }
    return true;
}

/**
 * Game loop.
 */
function gameLoop()
{
    var rerender = false;
    if ( blockDelay < blockSpeed )
    {
        blockDelay += gameSpeed;
    }
    else
    {
        blockDelay = 0;
        if ( canMove(0, 1) )
        {
            currentBlockY += 1;
        }
        else
        {
            postPiece();
            nextPiece();
        }
        rerender = true;
    }

    if ( moveBlockX != 0 )
    {
        if ( canMove(moveBlockX, 0) )
        {
            currentBlockX += moveBlockX;
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
    }
}

/**
 * Key down event handler.
 */
function keyDown(ev)
{
    if ( ev.keyCode == 37 )
    {
        moveBlockX = -1;
    }
    else if ( ev.keyCode == 39 )
    {
        moveBlockX = 1;
    }

} 
