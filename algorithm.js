function matrix(m, n) {
    return Array.from({
        // generate array of length m
        length: m
        // inside map function generate array of size n
        // and fill it with `0`
    }, () => new Array(n).fill(0));
};
function clearMatrix()
{
    for (let i = 0; i < mx.length; i++) {
        const element = mx[i];

        for (let j = 0; j < element.length; j++) {
            element[j] = 0;
        }
        
    }
}


var generation = 0;
var bestFit = null;

var matrixWidth = 15;
var matrixHeight = 15;


var mutationBias = 0.05;
var mutationFactor = 0.02;
var mutationLimit = 3;
var frameRateValue = 1;
var fullRandomCount = 2;


var populateFactor = 3;
var selectCount = 1;
var liners = [];


var xBegin = 8 ;
var yBegin = 14;

mx = matrix(matrixWidth, matrixHeight);


const LN_VISITED = 2;
const LN_EMPTY = 0;
const LN_BLOCK = 1;

const LN_ST_NORM = 1;
const LN_ST_MUTATED = 2;
const LN_ST_BLOCKED = 3;
const LN_ST_SUCCES = 4;
const LN_ST_DEAD = 5;




const LN_RIGHT = 0;
const LN_UP_RIGHT = 1;
const LN_UP =2;
const LN_UP_LEFT = 3
const LN_LEFT = 4;



function createInitialLines(count)
{
  for (let i = 0; i < count; i++) {

    var lin = new Liner(50 ,  [ 255 * Math.random()   , 255 * Math.random() , 255 * Math.random()  ]);
    lin.setBegin(xBegin , yBegin);
    liners.push( lin );
  }
}



class Liner
{
    constructor(maxMoves , color ) {

        if(color)
        this.color = color;
        else
        this.color = [ 255 * Math.random()   , 255 * Math.random() , 255 * Math.random()  ];

        this.moves = [];
        this.traces = [];

        this.alive = true;
        this.succes = false;
        this.maxMoveCount = maxMoves;
        this.currentMove = 0;
 
        this.x;
        this.y;
 
        this.xBegin;
        this.yBegin;
 
    }

    setBegin(x0 , y0)
    {
        this.x = x0;
        this.y = y0;

        this.xOld = this.x ;
        this.yOld = this.y ;

        this.xBegin = x0;;
        this.yBegin = y0;


    }

    clone()
    {
        let c = new Liner(50 );

        c.setBegin(this.xBegin, this.yBegin);
        c.color = this.color.slice();

        c.maxMoveCount = this.maxMoveCount;
        c.moves = this.moves.slice();
        return c;
    }


    drawFull()
    {
        if(this.traces.length >= 1)
        {
            strokeWeight(7)

            if(this.succes)
            stroke(0,255 ,0  , 240);
            else
            if(!this.alive)
            stroke(0,0 ,0  , 160);
            else
            stroke(this.color[0] ,this.color[1] ,this.color[2]  , 230);

 
            noFill();
            beginShape();
            curveVertex( this.xBegin * widthScale + widthScale/2,  this.yBegin* heightScale + heightScale/2);
            curveVertex( this.xBegin * widthScale + widthScale/2,  this.yBegin* heightScale + heightScale/2);
    
     
            for (let index = 0; index < this.traces.length; index++) {
                const element = this.traces[index];
               curveVertex( element.x * widthScale + widthScale/2, element.y * heightScale + heightScale/2);
            }
            curveVertex( this.traces[this.traces.length-1].x * widthScale + widthScale/2, this.traces[this.traces.length-1].y * heightScale + heightScale/2);
            endShape();

        }



    }

 

    calculateManhatten(xTarget , yTarget)
    {
        let lx = xTarget - this.x;
        let ly = yTarget - this.y;


        return  Math.abs(lx) +Math.abs(ly);
    }

    calculateDistance(xTarget , yTarget)
    {
        let lx = xTarget - this.x;
        let ly = yTarget - this.y;

        return Math.sqrt(  lx*lx + ly*ly);


    }

    restart()
    {
        this.currentMove = 0
        this.lastMove = LN_UP;

        this.alive  = true ;
        this.succes = false;

        this.x = this.xBegin ;
        this.y = this.yBegin ;
        this.xOld = this.x ;
        this.yOld = this.y ;

        this.traces = [];
    }

    mutate()
    {
        let mutates = Math.min(mutationLimit , this.moves.length);

        for (let i = 0; i <  Math.floor(Math.random() * mutates)  ; i++) {


            let mIndex = Math.floor(Math.random() * (this.moves.length *(1.0- mutationFactor) )  +(this.moves.length * mutationFactor )  )

            this.moves[mIndex] = this.RandomMovement(  mIndex > 0 ?  this.moves[mIndex-1] : LN_UP );

            this.color[0] = Math.floor(this.color[0]*0.85 +  (Math.random()* 255 ) *0.15);
            this.color[1] = Math.floor(this.color[1]*0.85 +  (Math.random()* 255 ) *0.15);
            this.color[2] = Math.floor(this.color[2]*0.85 +  (Math.random()* 255 ) *0.15);
        }



    }

    iterateX() {
        if (this.alive && !this.succes) {

            let move ;

            if(this.moves.length > this.currentMove)
            {
                move = this.moves[this.currentMove];     
            }else
            {
                move = this.RandomMovement(this.currentMove > 0 ? this.moves[this.currentMove-1]: LN_UP );
                this.moves.push(move);

            }

            this.advance(move);
            this.currentMove++;

            if ( this.currentMove > this.maxMoveCount  ||  !this.checkBounds())
            {
                this.alive = false;
                this.traces.push({x:this.x , y:this.y , status:LN_ST_BLOCKED});
            }else
            {

                if(mx[this.x][this.y] == 2)
                {
 
                  
                    this.succes = true;
                    this.alive = false;
                    this.traces.push({x:this.x , y:this.y , status:LN_ST_SUCCES});
           
                }else
                this.traces.push({x:this.x , y:this.y , status:LN_ST_NORM});
            }


        }
    }

 
    RandomMovement(lastM)
    {
        var move =   Math.floor(Math.random() * 5) ;
        if(Math.abs(lastM- move ) >= 4) 
        {
                move = lastM;
        }
        return move; 
    }

 

    advance(move)
    {
        switch(move)
        {
            case LN_RIGHT:
            this.x++;
            break;
            case LN_LEFT:
            this.x--;
            break;
            case LN_UP:
            this.y--;
            break;
            case LN_UP_RIGHT:
            this.y--;
            this.x++;
            break;
            case LN_UP_LEFT:
            this.y--;
            this.x--;
            break;
            case LN_UP:
            this.y--;
            break;
            default:
            console.log("unimplemented things...")
            break;
        }
    }

 
    checkBounds()
    {
        if(this.x >= 0 && this.y >= 0 && this.y < matrixHeight && this.x < matrixWidth && mx[this.x][this.y] != 1 )
        {
            return true;
        }else{
 
            return false;
        }
    }

}