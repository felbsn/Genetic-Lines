

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


var running = false;
var finished = true;

var loggerElm;






function draw() {
  clear();
  background(220);
  checkValues();


  if (!running) {

    frameRate(30)
    setupEnv();

    if (finished) {
      if (bestFit) {
        bestFit.drawFull();
      }

    } else {

      drawLines()
    }

    drawMatrix(mx);

  } else {

    frameRate(frameRateValue)
    train();
    drawLines()
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

  if (alives == 0) {

    if (succes > 0) {

      console.log("Some line Reach the target...")
      finished = true;
      $("#startButton").click();
      started = false;
      bestFit = getBestFit(xTarget, yTarget);

      htmlLog("succes gen : " + (generation + 1));

    } else {
      console.log("generating next batch...")

      generation++;




      let best = getBestFit(xTarget, yTarget);

      htmlLog("generation: " + generation + " best Dist:" + best.calculateDistance(xTarget, yTarget).toFixed(2));



      liners = [];
      if (best) {
        liners.push(best.clone());

        for (let i = 0; i < populateFactor - 1; i++) {
          let lin = best.clone()
          lin.mutate();
          liners.push(lin);
        }

        for (let i = 0; i < fullRandomCount; i++) {

          let lin = new Liner(100);

          lin.setBegin(xBegin, yBegin);

          liners.push(lin);
        }




      }




    }


  }
}


function getBestFit(x, y, tolerance = 1.0) {

  let bestFit = liners[0];
  let bestDist = liners[0].calculateDistance(x, y);
  let ix = 0;
  for (let i = 1; i < liners.length; i++) {
    const elm = liners[i];
    let dist = elm.calculateDistance(x, y);

    console.log("distances: " + dist)


    if (dist < bestDist) {
      bestFit = liners[i];
      bestDist = dist;
      ix = i;
    } else {
      if (dist - tolerance < bestDist && bestFit.traces.length > elm.traces.length) {
        bestFit = liners[i];
        bestDist = dist;
        ix = i;

      }

    }

  }

  console.log("best One is : " + ix + " as " + bestDist)

  return bestFit;
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

function markSector(x, y, markAs = 1) {
  if (x >= 0 && y >= 0 && x < cWidth && y < cHeight) {

    var ox = int(x / widthScale);
    var oy = int(y / heightScale);


    if (markAs == 2) {
      if (mx[xTarget][yTarget] == 2) mx[xTarget][yTarget] = 0;

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
  mutationLimit = float(mcslider.value);
  mutationFactor = float(mfslider.value) / 100;
  frameRateValue = int(frslider.value);
  populateFactor = int(pcslider.value)
  fullRandomCount = int(randslider.value)
}
