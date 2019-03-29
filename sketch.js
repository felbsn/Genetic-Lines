

var cWidth = 700;
var cHeight = 700;
var widthScale = 0.1;
var heightScale = 0.1;
var canvas;

var xTarget = 0, yTarget = 0;

var started = false;


var mfslider;
var mcslider;
var frslider;
var pcslider;
var randslider;
var checkbox;

var waitFinish = false;
var running = false;
var finished = true;

var loggerElm;



var xWidth = 600;
var xHeight = 600;

var xs = cWidth /100;

var ys = cHeight/10;


function curveFunc(c , mf)
{
  var sqt = Math.sqrt(c);
  return sqt / (mf*(sqt -c ));
}

function drawFunc()
{

strokeWeight(5);

 
stroke(0 , 0 , 0);
point( 22*xs ,cHeight- 1*ys)
stroke(255 , 30 , 30);
point( 35*xs , cHeight- 4*ys)


strokeWeight(3);


var s = 100
for (let index = 1; index < s; index++) {

  var rat = index / s;


  stroke(180 , 180 , 0);

  point( index * xs , cHeight -5 );


  stroke(180 , 50 ,180);


  var val = curveFunc(index /s   ,mutationFactor  )*10

  point( index * xs , cHeight -val  );

  
}


//endShape()

}





function draw() {
  clear();
  background(220);
  checkValues();

 // drawFunc()  
  if (!running) {

    frameRate(30)
    setupEnv();

    if (finished) {
      if (bestFit) {
        bestFit.drawFull();
      }

    } else {

      drawLinesSucces()
    }

    drawMatrix(mx);

  } else {

    frameRate(frameRateValue)


    train();


 
    drawMatrix(mx);
  }


  return false;
}




function setupEnv() {
  if (mouseIsPressed)
    if (mouseButton === CENTER) {
      markSector(mouseX, mouseY, 2)
    } else
      if (mouseButton === LEFT) {

        markSector(mouseX, mouseY, 1)
      }
      else
        if (mouseButton === RIGHT) {

          markSector(mouseX, mouseY, 0)
        }
}


function train() {
  var alives = 0;
  var succes = 0;
  finished = false;
  if (liners.length == 0) {
    console.log("inital generation")
    createInitialLines(1);
  }


  for (let index = 0; index < liners.length; index++) {
    const element = liners[index];

    element.iterateX();




    alives += element.alive;
    succes += element.succes;
  }


  
  drawLines();
  if (alives == 0) {

    if (succes > 0) {

 
      if(waitFinish)
      {
        //finished = true;
       // started = false;
        //$("#startButton").click();
      //  htmlLog("succes gen : " + (generation + 1));

        drawLinesSucces()
      }else{



  


        console.log("generating next batch...")

        generation++;
  
  
        htmlLog("generation: " + generation );
       
  
        liners = generateNextGen();



      }




    } else {
      console.log("generating next batch...")

      generation++;


      htmlLog("generation: " + generation );
     

      liners = generateNextGen();
    



    }


  }
}

function finishCurrent()
{


}


function generateNextGen() {

  liners.sort(function(a, b){return (a.foundGoals.length == b.foundGoals.length ? a.traces.length - b.traces.length : b.foundGoals.length - a.foundGoals.length  )  });
  

  var nextGet = [];

  
  nextGet.push(liners[0].clone());

  while(nextGet.length < populateFactor)
  {
    let rnd = Math.random();
    let cl = liners[   Math.floor( rnd*rnd *liners.length  )].clone();
    cl.mutate();
    nextGet.push(cl);



  }

  for (let index = 0; index <  fullRandomCount; index++) {
    nextGet.push( new Liner(50 ,  [ 255 * Math.random()   , 255 * Math.random() , 255 * Math.random()  ]) );
    
  }


  return nextGet;
}






function htmlLog(str) {

  loggerElm.innerHTML += str + '<br>';
}
function htmlLogClear() {
  loggerElm.innerHTML = "";
}

$(document).contextmenu(() => { return false });




function drawMatrix(matrix) {
  strokeWeight(1);
  stroke(0);
  fill(60, 110, 170);

  for (let i = 0; i < matrix.length; i++) {
    const element = matrix[i];
    for (let j = 0; j < element.length; j++) {
      const value = element[j];
      if (value == 1) {
        rect(i * widthScale, j * heightScale, widthScale, heightScale, 10);
      }
      else
        if (value == 2) {

          fill(70, 204, 120);
          ellipse(i * widthScale + widthScale / 2, j * heightScale + heightScale / 2, widthScale, heightScale)
          fill(60, 110, 170);
        }
    }
  }
}

function drawLines() {
  for (let index = 0; index < liners.length; index++) {
    const element = liners[index];
    element.drawFull();

  }
}
function drawLinesSucces() {



  for (let index = 0; index < liners.length; index++) {

    const element = liners[index];
    if(element.succes)
      element.drawFull();
      else
      element.drawGhost();

  }
}

function markSector(x, y, markAs = 1) {
  if (x >= 0 && y >= 0 && x < cWidth && y < cHeight) {

    var ox = int(x / widthScale);
    var oy = int(y / heightScale);

    if (mx[ox][oy] == 2)
    {
      GOAL_COUNT--;
    }


    if (markAs == 2) {
      //if (mx[xTarget][yTarget] == 2) mx[xTarget][yTarget] = 0;


      GOAL_COUNT++;

      xTarget = ox;
      yTarget = oy;
    }

    mx[ox][oy] = markAs;

  } else {

  }
}


function setup() {

  $("#startButton").click(function (btn) {
    console.log("btn" + btn);

    running = !running;

    if (running) {

      $("#startButton").html("Pause");
      $("#startButton").removeClass("btn-primary");
      $("#startButton").addClass("btn-warning");

    } else {


       drawLines();

      $("#startButton").html("Start");
      $("#startButton").addClass("btn-primary");
      $("#startButton").removeClass("btn-warning");
    }

  });

  $("#restartButton").click(function (btn) {
    console.log("restart " + btn);


    htmlLog("restarting...")


    htmlLogClear();



    generation = 0;

    if (running) {
      $("#startButton").click();
    }
    finished = false;
    liners = [];
    bestFit = null;



  });

  mfslider = document.getElementById("mutationScaleFactorSlider");
  mcslider = document.getElementById("mutationCountSlider");
  frslider = document.getElementById("frameRateSlider");
  pcslider = document.getElementById("populationCountslider");
  randslider = document.getElementById("frCountslider");
  loggerElm = document.getElementById("logElement");
  checkbox =  document.getElementById("cmn-toggle-4");

  cnv = createCanvas(cWidth, cHeight);

  cnv.style('display', 'relative');
  cnv.parent("canvasContainer")


  canvas = cnv.canvas;

  widthScale = cWidth / 15.0;
  heightScale = cHeight / 15.0;

  strokeWeight(1);
  stroke(0);

  fill(255, 204, 0);

}



function checkValues() {


  waitFinish = checkbox.checked;
  mutationLimit = float(mcslider.value);
  mutationFactor = float(mfslider.value) / 100;
  frameRateValue = int(frslider.value);
  populateFactor = int(pcslider.value)
  fullRandomCount = int(randslider.value)
}
