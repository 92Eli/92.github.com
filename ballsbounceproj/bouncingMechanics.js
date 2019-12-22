const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d"); // This is made using CanvasRenderingContext2d

var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;


function randomNum(min, max, badNum) {
    var num;
    do {
        num = Math.floor(Math.random() * (max-min+1)) + min; // random between 0 and 1 * range + min to move the number up
    } while (num == badNum); // recalculate if the num is the tabooed num
    return num;
}

function Ball(x, y, velX, velY, color, size) {
    this.x = x; // constructor code
    this.y = y;
    this.velX = velX; // velX means velocity in the x direction by the way
    this.velY = velY;
    this.color = color;
    this.size = size;
}
Ball.prototype.draw = function() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI); // Makes a circle the right radius at the right spot (arc makes you input start/stop in radians)
    //ctx.ellipse(this.x, this.y, this.size, this.size, 0, 0, 2*Math.PI, false); // This is more complicated so we're not going to use this even though it would make more sense
    ctx.fill(); // have to fill it now
}
Ball.prototype.wallCollisionDetect = function() { // check for wall collisions
    if (((this.x + this.size) >= width) || ((this.x - this.size) <= 0)) { // if the ball is touching the left or right edges
        this.velX = -this.velX; // reverse the x velocity
    }
    if (((this.y - this.size) <= 0 && ballGravity === 0)) { // if the ball is touching the top and there is no gravity (with gravity balls can go offscreen)
        this.velY = -this.velY; // reverse the y velocity
    }
    if ((this.y + this.size) >= height) { // if the ball is touching the bottom wall
        this.velY = -this.velY;
        this.velY = this.velY+ballGravity; // reduce bounce -- is +ballGravity because velocity is negative (see above code)
    }
}
Ball.prototype.ballCollisionDetect = function() { // check for ball collisions
    for (let i = 0; i < balls.length; i++) { // check all balls in the array
        if (!(this === balls[i])) { // if the ball being checked is NOT the current ball that called the funciton
            const dx = this.x - balls[i].x; // get the x and y distances
            const dy = this.y - balls[i].y;
            const distance = Math.sqrt(dx*dx+dy*dy); // distance formula, yay math is actually useful

            if (distance < this.size + balls[i].size) { // A collision! The distance is smaller than the radii of the two circles
                switch (ballCollisionType) {
                    case 0:
                        break;
                    case 1:
                        //let hold = balls[i].color; // save the current color because we're going to...
                        //[i].color = this.color; // make the current ball become the checked ball's color
                        this.color = balls[i].color; // set this color to the other ball's old color
                        break;
                    case 2:
                        balls[i].color = this.color; // give your color
                        break;
                    case 3:
                        // bounce them!
                        /*let hold1 = this.velX; // save the velocities
                        let hold2 = this.velY;
                        this.velX = balls[i].velX; // idky but i think this would work
                        this.velY = balls[i].velY;
                        balls[i].velX = hold1;
                        balls[i].velY = hold2;*/ //not keeping these settings because they are buggier
                        this.velX = -(this.velX);
                        this.velY = -(this.velY);
                        balls[i].velX = -(balls[i].velX);
                        balls[i].velY = - (balls[i].velY);
                        break;
                    default:
                        console.error(new Error("ballCollisionType is unknown value. Resetting to 0..."));
                        ballCollisionType = 0;
                }
            }
        }
    }
}
Ball.prototype.updateBalls = function() { // moveand update the balls
    this.x += this.velX; // move the ball according to velocity
    this.y += this.velY;
    this.velY += ballGravity; // gravity! -- see more in the collision to bottom wall function
}

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    for (let i = 0; i < balls.length; i++) { // move the balls that get covered up
        if ((balls[i].x+balls[i].size) > window.innerWidth) { // if the ball touches outside the width
            balls[i].x = window.innerWidth - balls[i].size; // move just inside the window
        }
        if ((balls[i].y+balls[i].size) > window.innerHeight) { // same as above but for y/height
            balls[i].y = window.innerHeight - balls[i].size;
        }
    }
}

function setUrlData() {
    let completeURL = location.protocol + "//" + location.host + location.pathname; // currURL without params... yet
    let params = new URLSearchParams;

    params.append("ballsToMake", ballsToMake);
    params.append("ballTrail", Math.round(ballTrail*10)/10);
    params.append("ballCollisionType", ballCollisionType);
    params.append("ballGravity", Math.round(ballGravity*10)/10);

    completeURL = completeURL + "?" + params.toString();
    return completeURL;
}
function loadUrlData() {
    // not going to use URLSearchParams this time
    let searchData = location.search.slice(1); // cut the '?' off the search 
    searchData = searchData.split("#")[0]; // cut off stuff after # if there is any (there shouldn't)
    searchData = searchData.split("&"); // spit on & connector
    for (let i = 0; i < searchData.length; i++) {
        let term = searchData[i].split("="); // make term[0] the var name and term[1] the var value
        term[1] = parseFloat(term[1]); // make sure it's a number
        // term[0] = term[1]; -- this is what I want to essentially do, but I can't think of a better way than:
        switch(term[0]) {
            case "ballsToMake":
                ballsToMake = term[1];
                break;
            case "ballTrail":
                ballTrail = term[1];
                break;
            case "ballCollisionType":
                ballCollisionType = term[1];
                break;
            case "ballGravity":
                ballGravity = term[1];
                break; // not specifying a default because if it's not one of these, I don't want it!
        }
    }
}
function saveUrlData() {
    window.history.pushState(null, "New Ball Settings", setUrlData());
}

let balls = [];
let maxVel = 5;
let minVel = -maxVel;

var ballsToMake = 10;
var ballTrail = 0.7;
var ballCollisionType = 1;
var ballGravity = 0;

function updateBallCount() {
    while (balls.length < ballsToMake) { // error: balls sometimes spawn inside of others and get stuck (x+size,y+size)
        let size = randomNum(15, 25); // random reasonable size -- have to define this before the new Ball because x, y, and size need to access it
        let ball = new Ball(
            randomNum(0 + size, width - size), // spawn inside the canvas
            randomNum(0 + size, height - size),
            randomNum(minVel, maxVel, 0), // random velocities in either direction but not == 0
            randomNum(minVel, maxVel, 0),
            "rgb("+randomNum(0,255)+","+randomNum(0,255)+","+randomNum(0,255)+")", // random color
            size
        );

        balls.push(ball); // add the ball object to the array so it can be accessed
    }
    while (balls.length > ballsToMake) {
        balls.pop(); // removes last element
    }
    saveUrlData(); // and update URL
}

function loop() {
    ctx.fillStyle = "rgba(0, 0, 0, "+ballTrail+")"; // the transparency makes a "ghost" trail follow them
    ctx.fillRect(0, 0, width, height); // a nice dark background

    for (let i = 0; i < balls.length; i++) {
        balls[i].draw(); // draw each ball
        balls[i].wallCollisionDetect(); // do the specified code if there is a collision with walls
        balls[i].ballCollisionDetect(); // do the specified code if there is a collision with balls
        balls[i].updateBalls(); // move and update each ball
        /**TODO
         * make prototype UICollisionDetect on Ball
         * make wallCollisionDetect(), ballCollDet(), and UICollDet() switch a wallCollision/ballColl/UIColl var true/false
         * Make the updateBalls function update the ball's velocity based on velocity changes from wallCollision/ballColl/UIColl
         * Make updateBalls move the ball and do any other editing if needed (color change, )
         * 
         * Maybe make a new ballCollision mode: split
         */
    } // IDKY but they sometimes get stuck on walls

    requestAnimationFrame(loop); // loop again!
}
loop(); // start the loop


if (location.search) loadUrlData(); // if there are search params, load the data!
updateBallCount();

window.addEventListener("resize", resizeCanvas);

console.log("Inspired from: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_building_practice"); // log the cred
