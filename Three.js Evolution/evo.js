var p5_canvas;
var threejs_canvas;
var camera, scene, renderer;
var light;

let windowWidth = 300;
let windowHeight = 300;

const genesPerIndividual = 10;
const paramsPerGene = 29;
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
var targetImage;

var canvasImage;

var bestCanvas;

//Max num iterations since last best mutation was found
var resetCount = 300;
//Keep track of iterations since last best mutation
var genCount = 0;

function preload() {
    targetImage = loadImage(ideal.src);

}

function setup() {
    pixelDensity(1);

    p5_canvas = createCanvas(windowWidth, windowHeight, 'p2d');

    canvasImage = document.getElementById("best");
}

function draw(){

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

    if (genCount > resetCount){
        //Reset to last best mutation
        currentDesign = bestDesign;
        currentScore = bestScore;
        console.log("reset!");
        genCount = 0;
    }else{
        genCount++;
    }

    drawDesign(currentDesign);
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

function bundle(){
    this.cubes = [];
    this.others = [];
    this.light = [];
}

function generateGenes() {

    let design = new bundle();

    for(let i = 0; i < genesPerIndividual; i++)
    {
        // Matrix for initial cube shape
        let cube = [
            0.55, 0.55, 0.55, //a
            0.55, 0.55, 0.45, //b
            0.55, 0.45, 0.55, //c
            0.55, 0.45, 0.45, //d
            0.45, 0.55, 0.45, //e
            0.45, 0.55, 0.55, //f
            0.45, 0.45, 0.45, //g
            0.45, 0.45, 0.55  //h
        ];
        //The rest (24 - 29) are used for other values
        let other = [];
        for(let j = 24; j < paramsPerGene; j++)
        {
            other.push(random());
        }
        
        //Group up cube values
        design.cubes.push(cube);
        design.others.push(other);
    }

    for(let i = 0; i < 3; i++)
    {
        design.light.push(random());
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

function constrainVertices(){

}

function mutateDesign(design)
{
    var mutant = design;

    //Mutate each verex coordinates
    // for(let i = 0; i < mutant.cubes.length; i++){
    //     mutant.cubes[i][0] = constrain(mutant.cubes[i][0] + randomGaussian(0, mutationAmount), 0, 1); //A
    //     mutant.cubes[i][1] = constrain(mutant.cubes[i][1] + randomGaussian(0, mutationAmount), 0, 1);
    //     mutant.cubes[i][2] = constrain(mutant.cubes[i][2] + randomGaussian(0, mutationAmount), 0, 1);
    //     mutant.cubes[i][3] = constrain(mutant.cubes[i][3] + randomGaussian(0, mutationAmount), 0, 1); //B
    //     mutant.cubes[i][4] = constrain(mutant.cubes[i][4] + randomGaussian(0, mutationAmount), 0, 1);
    //     mutant.cubes[i][5] = constrain(mutant.cubes[i][5] + randomGaussian(0, mutationAmount), -1, 0);
    //     mutant.cubes[i][6] = constrain(mutant.cubes[i][6] + randomGaussian(0, mutationAmount), 0, 1); //C
    //     mutant.cubes[i][7] = constrain(mutant.cubes[i][7] + randomGaussian(0, mutationAmount), -1, 0);
    //     mutant.cubes[i][8] = constrain(mutant.cubes[i][8] + randomGaussian(0, mutationAmount), 0, 1);
    //     mutant.cubes[i][9] = constrain(mutant.cubes[i][9] + randomGaussian(0, mutationAmount), 0, 1); //D
    //     mutant.cubes[i][10] = constrain(mutant.cubes[i][10] + randomGaussian(0, mutationAmount), -1, 0);
    //     mutant.cubes[i][11] = constrain(mutant.cubes[i][11] + randomGaussian(0, mutationAmount), -1, 0);
    //     mutant.cubes[i][12] = constrain(mutant.cubes[i][12] + randomGaussian(0, mutationAmount), -1, 0); //E
    //     mutant.cubes[i][13] = constrain(mutant.cubes[i][13] + randomGaussian(0, mutationAmount), 0, 1);
    //     mutant.cubes[i][14] = constrain(mutant.cubes[i][14] + randomGaussian(0, mutationAmount), 0, 1);
    //     mutant.cubes[i][15] = constrain(mutant.cubes[i][15] + randomGaussian(0, mutationAmount), -1, 0); //F
    //     mutant.cubes[i][16] = constrain(mutant.cubes[i][16] + randomGaussian(0, mutationAmount), 0, 1);
    //     mutant.cubes[i][17] = constrain(mutant.cubes[i][17] + randomGaussian(0, mutationAmount), -1, 0);
    //     mutant.cubes[i][18] = constrain(mutant.cubes[i][18] + randomGaussian(0, mutationAmount), -1, 0); //G
    //     mutant.cubes[i][19] = constrain(mutant.cubes[i][19] + randomGaussian(0, mutationAmount), -1, 0);
    //     mutant.cubes[i][20] = constrain(mutant.cubes[i][20] + randomGaussian(0, mutationAmount), 0, 1);
    //     mutant.cubes[i][21] = constrain(mutant.cubes[i][21] + randomGaussian(0, mutationAmount), -1, 0); //H
    //     mutant.cubes[i][22] = constrain(mutant.cubes[i][22] + randomGaussian(0, mutationAmount), -1, 0);
    //     mutant.cubes[i][23] = constrain(mutant.cubes[i][23] + randomGaussian(0, mutationAmount), -1, 0);
    // }

    //Unconstrained cube vertices
    for(let i = 0; i < mutant.cubes.length; i++){
        for(j = 0; j < mutant.cubes[i].length; j++){
            mutant.cubes[i][j] = constrain(
                (mutant.cubes[i][j] +
                randomGaussian(0,mutationAmount)),
                0,
                1);
        }
    }
    

    //Mutate other attributes
    for(let i = 0; i < mutant.others.length; i++){
        for(j = 0; j < mutant.others[i].length; j++){
            mutant.others[i][j] = constrain(
                (mutant.others[i][j] +
                randomGaussian(0,mutationAmount)),
                0,
                1);
        }
    }

    //Mutate light attributes
    for(let i = 0; i < mutant.light.length; i++){
        mutant.light[i] = constrain(
            mutant.light[i] +
            randomGaussian(0,mutationAmount),
            0,
            1);
    }

    return mutant;
}

function applyMutation(design){
    for(let i = 0; i < meshArray.length; i++)
    {
        for(let j = 0; j < meshArray[i].geometry.vertices.length; j++)
        {
            meshArray[i].geometry.vertices[j].x = design.cubes[i][j*3]*2-1;
            meshArray[i].geometry.vertices[j].y = design.cubes[i][j*3+1]*2-1;
            meshArray[i].geometry.vertices[j].z = design.cubes[i][j*3+2]*2-1;
        }

        meshArray[i].position.x = design.others[i][0];
        meshArray[i].position.y = design.others[i][1];
        meshArray[i].position.z = design.others[i][2];

        meshArray[i].rotation.x = design.others[i][3];
        meshArray[i].rotation.y = design.others[i][4];
        meshArray[i].geometry.center();
        meshArray[i].geometry.verticesNeedUpdate = true;
        meshArray[i].geometry.computeFaceNormals();
    }

    light.position.x = Math.sin(design.light[0] * 3) * 5;
    light.position.y = Math.cos(design.light[1] * 3) * 5;
    light.position.z = Math.cos(design.light[2] * 3) * 5;
}
