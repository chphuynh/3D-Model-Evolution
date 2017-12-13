var p5_canvas;
var threejs_canvas;
var camera, scene, renderer;
var light;

let windowWidth = 300;
let windowHeight = 300;

var genesPerIndividual = 10;
var paramsPerGene = 29;
var childrenPerGeneration = 1;

const mutationAmount = 0.001;

let meshArray = [];
// remember the best design ever seen
let bestDesign;
let bestScore;

// remember the current design
// (best of the most recent generation)
let currentDesign;
let currentScore;

// store the image we are trying to recreate
let targetImage;

var canvasImage;

var bestCanvas;

var currentSrc = ideal.src;


function preload() {
    targetImage = loadImage(ideal.src);

}

function setup() {
    pixelDensity(1);

    p5_canvas = createCanvas(windowWidth, windowHeight, 'p2d');
    // p5_canvas.parent(document.getElementById("down"))
    canvasImage = document.getElementById("best");
    // canvasImage = new Image;
    // image.onload = function()
    // {
    //     p5_canvas.drawingContext.drawImage(canvasImage,0,0);
    // }
}

function draw(){
    
    // // Snapshots three.js canvas to p5.ja canvas
    // if(renderer)
    //     canvasImage.src = renderer.domElement.toDataURL();
}

let controls;

window.addEventListener('load', function() {
    camera = new THREE.PerspectiveCamera( 70, windowWidth / windowHeight, 0.01, 10 );
    camera.position.z = 1;
    camera.position.x = 1.2;

    scene = new THREE.Scene();

    // Lighting for scene
    scene.add( new THREE.AmbientLight( 0x0c0c0c) );

    // Light to be mutated
    light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 25, 25, 25 );
    scene.add( light );


    // Genetic Algorithm Setup
    setupGenetics();

    // Mouse Camera Movement
    controls = new THREE.TrackballControls(camera);
    controls.target.set(0,0,0);


    // Three.js Canvas Setup
    threejs_canvas = document.getElementById("threejs");
    renderer = new THREE.WebGLRenderer( {canvas: threejs_canvas, antialias: true, preserveDrawingBuffer: true } );
    renderer.setSize( windowWidth, windowHeight );
    document.body.appendChild( renderer.domElement );

    // Three.js Update Function
    animate();
});


function modifyCubes(num)
{
    genesPerIndividual += num;
    setupGenetics();
}

function setupGenetics()
{
    targetImage.loadPixels();

    currentDesign = generateGenes();
    bestDesign = currentDesign;

    currentScore = Number.NEGATIVE_INFINITY;
    bestScore = currentScore;
    generateMeshes();
    applyMutation(currentDesign);    
}

function animate() {
    requestAnimationFrame( animate );

    controls.update();
    
    renderer.render( scene, camera );

    if(p5_canvas)
        iterate();

    if(ideal.src != currentSrc)
    {
        blackWhite();
        setupGenetics();
    }
}


function iterate()
{
    evolve();
    if (currentScore > bestScore) {
        console.log(    "global improvement",
                currentScore);
        bestDesign = currentDesign;
        bestScore = currentScore;
        canvasImage.src = renderer.domElement.toDataURL();
    }

    drawDesign(currentDesign);

    // if (keyIsDown(SHIFT)) {
    //     drawDesign(currentDesign);
    // } else {
    //     drawDesign(bestDesign);
    // }
}

function evolve(){
    let localScore = Number.NEGATIVE_INFINITY;
    let localDesign = currentDesign;
    //Generate childrenPerGeneration amount and choose best (random for now)
    for(let g = 0; g < childrenPerGeneration; g++){
        let child = mutateDesign(currentDesign);
        //draw the design on p5js canvas to score
        drawDesign(child);

        let childScore = evaluateFitness();

        if(childScore > localScore){
            localDesign = child;
            localScore = childScore;
        }
        currentDesign = localDesign;
        currentScore = localScore;
    }
}

function drawDesign(design)
{
    applyMutation(design);
    //canvasImage.src = renderer.domElement.toDataURL();
    p5_canvas.drawingContext.drawImage(threejs_canvas,0,0);
}

function evaluateFitness(){
    targetImage.loadPixels();
    loadPixels();
    let score = 0;

    for (let p = 0; p < pixels.length; p += 9) {
       let diff = (pixels[p]-targetImage.pixels[p]);
       score -= Math.abs(diff);
    }

    return score;
}

function generateGenes() {

    let design = [];
    for(let i = 0; i < genesPerIndividual; i++)
    {

        // Matrix for initial cube shape
        design = design.concat([
            0.55, 0.55, 0.55, 
            0.55, 0.55, 0.45,
            0.55, 0.45, 0.55,
            0.55, 0.45, 0.45,
            0.45, 0.55, 0.45,
            0.45, 0.55, 0.55,
            0.45, 0.45, 0.45,
            0.45, 0.45, 0.55
        ]);

        for(let j = 24; j < paramsPerGene; j++)
        {
            design.push(random());
        }

    }

    for(let i = 0; i < 3; i++)
    {
        design.push(random());
    }

    return design;
}

function generateMeshes() {
    for(let i = 0; i < genesPerIndividual; i++)
    {
        let geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
        geometry.dynamic = true;
        let material = new THREE.MeshLambertMaterial({color: 0xffffff, overdraw: 0.5});
        let new_mesh = new THREE.Mesh( geometry, material );
        meshArray.push(new_mesh);
        scene.add( new_mesh );
    }
}

function mutateDesign(design)
{
    let mutant = design.slice();

    for (let i = 0; i < mutant.length; i++) {
        mutant[i] = constrain(
        mutant[i] +
        randomGaussian(0,mutationAmount),
        0,
        1);
    }

    return mutant;
}

function applyMutation(design){
    for(var i = 0; i < meshArray.length; i++)
    {
        for(var j = 0; j < meshArray[i].geometry.vertices.length; j++)
        {
            meshArray[i].geometry.vertices[j].x = design[i*paramsPerGene + j*3] * 2 - 1;
            meshArray[i].geometry.vertices[j].y = design[i*paramsPerGene + j*3 + 1] * 2 - 1;
            meshArray[i].geometry.vertices[j].z = design[i*paramsPerGene + j*3 + 2] * 2 - 1;
        }

        meshArray[i].position.x = design[i*paramsPerGene + 24]-0.25;
        meshArray[i].position.y = design[i*paramsPerGene + 25]-0.25;
        meshArray[i].position.z = design[i*paramsPerGene + 26] - 0.5;

        meshArray[i].rotation.x = design[i*paramsPerGene + 27];
        meshArray[i].rotation.y = design[i*paramsPerGene + 28];
        meshArray[i].geometry.center();
        meshArray[i].geometry.verticesNeedUpdate = true;
        meshArray[i].geometry.computeFaceNormals();
    }

    light.position.x = Math.sin(design[design.length-3] * 3) * 5;
    light.position.y = Math.cos(design[design.length-2] * 3) * 5;
    light.position.z = Math.cos(design[design.length-1] * 3) * 5;
}

// function mouseClicked() {
//     console.log(get(mouseX, mouseY));
// }

function blackWhite()
{
    var tempCanvas = document.getElementById("temp");
    var tempCtx = tempCanvas.getContext('2d');
    var tempImg = new Image;
    tempImg.src = ideal.src;
    tempCtx.drawImage(tempImg, 0, 0, 300, 300);

    var imgData = tempCtx.getImageData(0,0,300,300);

    for (var i = 0; i < 300*300*4; i+= 4)
    {
     var redValue = imgData.data[i];
     var greenValue = imgData.data[i+1];
     var blueValue = imgData.data[i+2];

     var greyValue = parseInt((redValue + greenValue + blueValue) / 3);

     imgData.data[i] = greyValue;
     imgData.data[i+1] = greyValue;
     imgData.data[i+2] = greyValue;
    }

    tempCtx.putImageData(imgData,0,0);

    ideal.src = tempCanvas.toDataURL();
    currentSrc = ideal.src;
}