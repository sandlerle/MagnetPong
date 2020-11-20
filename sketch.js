
let video;
let hp;
let poses = [];
let middleX = 0;
let middleXPlayer = 0;
let middleY = 0;
let strongness = 0;
let xposBall = 200;
let yposBall = 200;
let xmovBall = 0;
let ymovBall = 0;
let distancehand = 0;
let oldx = 0;
let oldy = 0;
let olds = 0;
let r1 = 200;
let r2 = 20;

//Pong Variablen:
let pedalWidth = 50;
let pedalHeight = 10;
let abstandRand = 20;

let scoreNPC = 0;
let scorePlayer = 0;





function setup() {
  var canvas = createCanvas(640, 480);
  canvas.parent('sketch_holder');
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  hp = ml5.handPose(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected

  hp.on('pose', function(results) {
    poses = results;
    // console.log(poses)
  });
  // Hide the video element, and just show the canvas
  video.hide();

  //Pong Things:
  player1 = new Spieler(pedalWidth, pedalHeight, abstandRand);
   spielball = new Kugel(10, pedalWidth, pedalHeight, abstandRand);
   npc1 = new NPCpedal(spielball, abstandRand);

   distance = createVector(0,0);


}

function modelReady() {
  select('#status').html('Model Loaded');
  hp.singlePose();
}

function draw() {
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);
  background(255,200);



  getMiddle();

  let mouse = createVector(middleX, middleY);

    let direction = p5.Vector.sub(mouse, spielball.position);

    direction.setMag(5);

    if(strongness<3.8){
      player1.show();
      player1.move();
    }




    spielball.show();
    spielball.move(player1.getPosition(), direction, npc1.getPosition());

    npc1.show();
    npc1.move();
    forcefield();
    scale(-1, 1);
    fill(0,50);
    textSize(100);
    textAlign(CENTER);
    text(scoreNPC, -width/2, height/2 - 120);
    text(scorePlayer, -width/2, height/2 + 180);


}

// Standart Funktionen HandTracking:
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    // let pose = poses[i].pose;
    // for (let j = 0; j < pose.keypoints.length; j++) {
    //   // A keypoint is an object describing a body part (like rightArm or leftShoulder)
    //   let keypoint = pose.keypoints[j];
    //   // Only draw an ellipse is the pose probability is bigger than 0.2
    //   if (keypoint.score > 0.2) {
    //     fill(255, 0, 0);
    //     noStroke();
    //     ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
    //   }
    // }
    let pose = poses[i];
    // console.log(pose)
    for (let j = 0; j < pose.landmarks.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.landmarks[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      // if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint[0], keypoint[1], 10, 10);
      // }
    }
  }
}
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let annotations = poses[i].annotations;
    // For every skeleton, loop through all body connections
    stroke(255, 0, 0);
    for (let j = 0; j < annotations.thumb.length - 1; j++) {
      // let partA = annotations.thumb[j][0];
      // let partB = annotations.thumb[j][1];
      line(annotations.thumb[j][0], annotations.thumb[j][1], annotations.thumb[j + 1][0], annotations.thumb[j + 1][1]);
    }
    for (let j = 0; j < annotations.indexFinger.length - 1; j++) {
      line(annotations.indexFinger[j][0], annotations.indexFinger[j][1], annotations.indexFinger[j + 1][0], annotations.indexFinger[j + 1][1]);
    }
    for (let j = 0; j < annotations.middleFinger.length - 1; j++) {
      line(annotations.middleFinger[j][0], annotations.middleFinger[j][1], annotations.middleFinger[j + 1][0], annotations.middleFinger[j + 1][1]);
    }
    for (let j = 0; j < annotations.ringFinger.length - 1; j++) {
      line(annotations.ringFinger[j][0], annotations.ringFinger[j][1], annotations.ringFinger[j + 1][0], annotations.ringFinger[j + 1][1]);
    }
    for (let j = 0; j < annotations.pinky.length - 1; j++) {
      line(annotations.pinky[j][0], annotations.pinky[j][1], annotations.pinky[j + 1][0], annotations.pinky[j + 1][1]);
    }

    line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.thumb[0][0], annotations.thumb[0][1]);
    line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.indexFinger[0][0], annotations.indexFinger[0][1]);
    line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.middleFinger[0][0], annotations.middleFinger[0][1]);
    line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.ringFinger[0][0], annotations.ringFinger[0][1]);
    line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.pinky[0][0], annotations.pinky[0][1]);
  }
}


//Funktionen Macht:
function getAbstand(X1, Y1, X2, Y2){
  let abstand = Math.sqrt((X1-X2)*(X1-X2)+(Y1-Y2)*(Y1-Y2));
  return abstand;
}
function getMiddle() {
  oldx = middleX;
  oldy = middleY;
  olds = strongness;

  for (let i = 0; i < poses.length; i++) {
    let annotations = poses[i].annotations;

    middleX = ((annotations.palmBase[0][0])+(annotations.thumb[0][0])+(annotations.indexFinger[0][0])+(annotations.middleFinger[0][0])+(annotations.ringFinger[0][0])+(annotations.pinky[0][0]))/6;
    middleY = ((annotations.palmBase[0][1])+(annotations.thumb[0][1])+(annotations.indexFinger[0][1])+(annotations.middleFinger[0][1])+(annotations.ringFinger[0][1])+(annotations.pinky[0][1]))/6;
    let strongnessThumb = getAbstand(annotations.palmBase[0][0],annotations.palmBase[0][1],annotations.thumb[3][0],annotations.thumb[3][1]);
    let strongnessindexFinger = getAbstand(annotations.palmBase[0][0],annotations.palmBase[0][1],annotations.indexFinger[3][0],annotations.indexFinger[3][1]);
    let strongnessmiddleFinger = getAbstand(annotations.palmBase[0][0],annotations.palmBase[0][1],annotations.middleFinger[3][0],annotations.middleFinger[3][1]);
    let strongnessringFinger = getAbstand(annotations.palmBase[0][0],annotations.palmBase[0][1],annotations.ringFinger[3][0],annotations.ringFinger[3][1]);
    let strongnesspinky = getAbstand(annotations.palmBase[0][0],annotations.palmBase[0][1],annotations.pinky[3][0],annotations.pinky[3][1]);
    strongness = 2000*(1/(strongnessindexFinger + strongnessmiddleFinger + strongnessringFinger + strongnesspinky));

    distancehand1 = annotations.palmBase[0][0];
    distancehand2 = annotations.palmBase[0][1];
    distancehand3 = (annotations.palmBase[0][2])*1000;
    console.log(strongness);
    strongness = (strongness*distancehand)/100;
    fill(66, 164, 245);
    noStroke();

    distancehand = getAbstand(annotations.palmBase[0][0],annotations.palmBase[0][1],annotations.middleFinger[0][0],annotations.middleFinger[0][1]);


    //easing:
    let easing = 0.05;
    let dx = middleX - oldx;
    let dy = middleX - oldy;
    let ds = strongness - olds;
    middleX += dx * easing;
    middleY += dy * easing;
    middleXPlayer = (middleX*1.5)-160;
    if( middleXPlayer<0){
      middleX = 0;
    }
    if( middleXPlayer>639){
      middleX = 639;
    }
    strongness += ds * easing;
  }
}


function drawBall(){
  fill(86, 168, 50);
  noStroke();



  if (xposBall < middleX){
    xmovBall = strongness/100;
  }

  else if (xposBall > middleX){
    xmovBall = -strongness/100;
  }
  else{
    xmovBall = 0;
  }


  if (yposBall < middleY){
    ymovBall = strongness/100;
  }

  else if (yposBall > middleY){
    ymovBall = -strongness/100;
  }
  else{
    ymovBall = 0;
  }

  xposBall = xposBall + xmovBall;
  yposBall = yposBall + ymovBall;
  ellipse(xposBall,yposBall,10,10,);
}
function forcefield(){


   if (strongness>3.8) {
     r1-=10;
     if(r1<20){
       r1=200;
     }
     fill(200,230,255, 190);
     noStroke();
     ellipse(middleX, middleY, r1, r1);
   }
   else{
     r2+=1;
     if(r2>60){
       r2=20;
     }
     fill(255, 218, 200, 190);
     noStroke();
     ellipse(middleX, middleY, r2, r2);
   }
}
//Funktinen Pong:
//KLassendefinition
class Kugel{
    constructor(radius, pW, pH, abstand){
        this.timer = 0;
        this.position = createVector(random(width/2-50, width/2+50),random(height/2-50, height/2+50));
        this.velocity = createVector(random(-1.0,1.0),random(-4.0,4.0));
        this.accelaration = createVector(0,0);

        this.r = radius;
        this.farbe = color(0,190);
        this.pedalW = pedalWidth;
        this.pedalH = pedalHeight;
        this.dist = abstand;
        this.distance = createVector(0,0);
        this.distanceX;
        this.distanceY;
        this.playerPos = createVector(0,0);
        if (this.velocity.x < 1 && this.velocity.x > -1) this.velocity.x = 1;
        if (this.velocity.y < 1 && this.velocity.y > -1) this.velocity.y = 2;
    }


    move(playerPosition, direction, pcPosition){
        if(middleY<this.position.y){
          if (strongness>3.8 && this.velocity.y<0){
            let steering = p5.Vector.sub(direction, this.velocity);
            this.accelaration.add(steering);
          }
        }


        this.velocity.add(this.accelaration);
        this.position.add(this.velocity);
        this.accelaration.mult(0);

        //abprallen
        if(this.position.x > width || this.position.x < 0) this.velocity.x*=-1;
        //if(this.position.y > height || this.position.y < 0) this.velocity.y*=-1;
        if(this.position.y > height){
          scoreNPC+=1;
          this.position = createVector(random(width/2-50, width/2+50),random(height/2-50, height/2+50));
          this.velocity = createVector(random(-1.0,1.0),random(-4.0,4.0));
          if (this.velocity.x < 1 && this.velocity.x > -1) this.velocity.x = 1;
          if (this.velocity.y < 1 && this.velocity.y > -1) this.velocity.y = 2;
        }

        if(this.position.y < 0){
          scorePlayer+=1;
          this.position = createVector(random(width/2-50, width/2+50),random(height/2-50, height/2+50));
          this.velocity = createVector(random(-1.0,1.0),random(-4.0,4.0));
          if (this.velocity.x < 1 && this.velocity.x > -1) this.velocity.x = 1;
          if (this.velocity.y < 1 && this.velocity.y > -1) this.velocity.y = 2;
        }


        this.checkCollision(playerPosition, pcPosition);

        if (this.velocity > 6) this.velocity *= 0.98;
        //timer
        if (this.timer>0){
          this.timer-=1;
        }

    }

    show(){
        noStroke();
        fill(0);
        ellipse(this.position.x, this.position.y, this.r);
    }

    checkCollision(playerPosition, pcPosition){

      this.playerPos.x = playerPosition.x;
      this.playerPos.y = playerPosition.y;

      if (this.timer == 0){
        if (this.position.y > this.playerPos.y - this.pedalH  && this.position.y < this.playerPos.y + 50 && this.position.x < this.playerPos.x+this.pedalW/2 && this.position.x > this.playerPos.x-this.pedalW/2){
          this.velocity.y*=-1;
          this.timer += 50;
        }

      }

      this.pcPos = pcPosition;
      if (this.timer == 0){
        if (this.position.y < 20 + this.pedalH && this.position.x < this.pcPos+this.pedalW/2 && this.position.x > this.pcPos-this.pedalW/2){
          this.velocity.y*=-1;
          this.timer += 50;
        }
      }
    }

}

class NPCpedal{
  constructor(ball, abstand){
    this.y = 0 + abstand;
    this.x = width/2;
    this.pWidth = 50;
    this.pHeight = 10;
    this.target = ball;
    this.dist = abstand;

    this.velocity = 0;
    this.accelaration = 0.1;
  }

  show(){
    rectMode(CENTER);
    fill(0);
    rect((constrain(this.x, this.pWidth/2, width - this.pWidth/2)), this.dist, this.pWidth, this.pHeight);
  }

  move(){
    //this.x = this.target.position.x;
    let distance = this.target.position.x-this.x;

    if (this.target.position.x < this.x + 5 && this.target.position.x > this.x - 5) this.velocity *= 0.7;
    else{
      this.accelaration = map(distance, -640, 640, -1, 1)
      this.velocity += this.accelaration;
    }

    this.x += this.velocity;

  }

  getPosition(){
    return this.x;
  }
}


class Spieler{
  constructor(pWidth, pHeight, dist){
    //this.positionX = width/2;

    this.position = createVector(width/2, height - 20);
    this.playerSpeed = 0;
    this.pWidth = pWidth;
    this.pHeight = pHeight;
    this.dist = dist;
    this.resist = 0.85;
    this.accel = 1.0;
  }

  show(){
    rectMode(CENTER);
    fill(0);
    //rect((constrain(this.position.x, this.pWidth/2, width - this.pWidth/2)), height - this.dist, this.pWidth, this.pHeight);
    rect((constrain(this.position.x, this.pWidth/2, width - this.pWidth/2)), height - 20, this.pWidth, this.pHeight);
  }

  move(){
    //if (keyIsPressed){
    //  if (keyCode === LEFT_ARROW) this.playerSpeed -= this.accel;
    //  if (keyCode === RIGHT_ARROW) this.playerSpeed += this.accel;
    //}
    //this.playerSpeed *= this.resist;

    //this.position.x += this.playerSpeed;
    this.position.x = middleXPlayer;
    this.position.y = height - 20;

  }

  getPosition(){
    return this.position;
  }
}
