var canvas;
var context;

var maxX = 8;
var maxY = 12;
var blockSize = 20;
var fields;

var currentBlock;
var currentBlockX;
var currentBlockY;
var currentBlockHeight = 0;
var currentBlockWidth = 0;

var moveBlockX = 0;

var BLOCK_COLORS = ["#FFFFFF", "#808080", "#FF0000", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF"];

var gameTimer;
var gameSpeed = 100;
var blockSpeed = 1000;
var blockDelay = 0;

function gameStart()
{
    canvas = document.getElementById("gameCanvas");
    canvas.width = maxX * blockSize;
    canvas.height = maxY * blockSize;
    context = canvas.getContext("2d");
    fields = [];
    for ( var i = 0; i < maxX; i++ )
    {
        var column = [];
        for ( var j = 0; j < maxY; j++ )
        {
            //column.push( Math.floor( Math.random() * BLOCK_COLORS.length ) );
            column.push( -1 );
        }
        fields.push(column);
    }

    currentBlock = [];
    for ( var i = 0; i < 4; i++ )
    {
        var column = [];
        for ( var j = 0; j < 4; j++ )
        {
            column.push(-1);
        }
        currentBlock.push(column);
    }

    nextBlock();
    render();

    gameTimer = setInterval(gameLoop, gameSpeed);

    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
}

function nextBlock()
{
    currentBlockX = maxX / 2 - 2;
    currentBlockY = 0;

     // TODO: clear block
    var color = Math.floor( Math.random() * BLOCK_COLORS.length );
    currentBlock[0][0] = color;
    currentBlock[1][0] = color;
    currentBlock[2][0] = color;
    currentBlock[2][1] = color;
    currentBlockHeight = 2;
    currentBlockWidth = 3;
}

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

function postBlock()
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
        if ( currentBlockY + currentBlockHeight < maxY )
        {
            currentBlockY += 1;
        }
        else
        {
            postBlock();
            nextBlock();
        }
        rerender = true;
    }

    if ( moveBlockX != 0 )
    {
        if ( ( moveBlockX < 0 && currentBlockX > 0 ) || ( moveBlockX > 0 && currentBlockX + currentBlockWidth < maxX ) )
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

function keyUp(ev)
{
    if ( ev.keyCode == 37 || ev.keyCode == 39 )
    {
        moveBlockX = 0;
    }
}

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
