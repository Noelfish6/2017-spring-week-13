console.log('Example');

/*This example demonstrates how we can use dynamic visuals to represent
"speed" as a data attribute*/

//Plot-1: a basic implementation
const w = d3.select('.plot-1').node().clientWidth,
	h = d3.select('.plot-1').node().clientHeight;

//Suppose we have a <path> with an arbitrary attr "d", and also a speed attribute
const pathData = {
	//we generate 20 random points, just to show that <path> can be arbitary
	points: d3.range(20).map(function(d){return {x:Math.random()*w, y:Math.random()*(h-100)+50}}).sort(function(a,b){return b.x-a.x}),
	speed: .5 //this value doesn't mean much in and of itself. We can fine tune later
}

//To show dynamic visuals i.e. animations, we rely on a combination of <svg> and <canvas>
const svg = d3.select('.plot-1').append('svg')
	.attr('width',w)
	.attr('height',h)
	.style('position','absolute')
	.style('top',0)
	.style('left',0);
const canvas = d3.select('.plot-1').append('canvas')
	.attr('width',w)
	.attr('height',h)
	.style('position','absolute')
	.style('top',0)
	.style('left',0);
const ctx = canvas.node().getContext('2d');

//Draw <path> on <svg> layer
//Boring old stuff here...
const line = d3.line()
	.x(function(d){return d.x})
	.y(function(d){return d.y})
	.curve(d3.curveStep);
let path = svg.append('path').datum(pathData)
	.attr('d',function(d){return line(d.points)})
	.style('fill','none')
	.style('stroke','rgb(100,100,100)')
	.style('stroke-width','2px');

//Now the interesting part
//the <path> Element in <svg> has a few nifty methods
// .getTotalLength() --> Returns computed length of the <path>
// .getPointAtLength() --> Given input of between 0-1, it will output the xy coordinate of the 
let length = path.node().getTotalLength();
console.log(length);
console.log(path.node().getPointAtLength(0)); //x,y point in <svg> coordinate of first point along <path>
console.log(path.node().getPointAtLength(length)); //x,y point in <svg> coordinate of last point along <path>

//So, the next step is to sample a bunch of points (let's say 10) at regular intervals along <path>
//Go ahead, draw these on the <canvas> element
const NUM_OF_POINTS = 10;
const T0 = new Date(); //current time, we'll see how we'll use this
let samplePoints = d3.range(0,length,length/NUM_OF_POINTS)
	.map(function(l){
		return path.node().getPointAtLength(l)
	});
updateCanvas(samplePoints);

function updateCanvas(ps){
	ctx.clearRect(0,0,w,h);
	ctx.beginPath();
	ps.forEach(function(p){
		ctx.moveTo(p.x, p.y)
		ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
	});
	ctx.fill();
}

//Now, the animation
//The basic idea is this: as the animation progresses, we will "re-sample" the 10 points by choosing a different offset start
function step(){
	let T1 = new Date(); //current time of the new animation frame
	let t = T1-T0; //how much time has passed since the start of the animation
	console.log(t);
	let distance = t * pathData.speed; //how much distance we've travelled
	let offset = distance%(length/NUM_OF_POINTS);
	let samplePoints = d3.range(offset,length,length/NUM_OF_POINTS)
		.map(function(l){
			return path.node().getPointAtLength(l)
		});
	updateCanvas(samplePoints);

	requestAnimationFrame(step);
}

step();



