var p5_canvas;
var threejs_canvas
var camera, scene, renderer;
var light;

let windowWidth = 400;
let windowHeight = 400;

const genesPerIndividual = 20;
const paramsPerGene = 29;
var childrenPerGeneration = 10;

const mutationAmount = 0.001;

let meshArray = [];
let currentDesign = [];
let currentScore;

var image, targetImage;

function setup() {
    p5_canvas = createCanvas(windowWidth, windowHeight, 'p2d');

    image = new Image;
    image.onload = function()
    {
        p5_canvas.drawingContext.drawImage(image,0,0);
    }
    targetImage = loadImage("target_1.png");  //Target image here
    targetImage.loadPixels();
    currentScore = Number.NEGATIVE_INFINITY;
}


function draw(){
    
    // Snapshots three.js canvas to p5.ja canvas
    if(renderer)
        image.src = renderer.domElement.toDataURL();

}

let controls;

window.addEventListener('load', function() {
    camera = new THREE.PerspectiveCamera( 70, windowWidth / windowHeight, 0.01, 10 );
    camera.position.z = 1;

    scene = new THREE.Scene();

    scene.add( new THREE.AmbientLight( 0x0c0c0c) );

    light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 25, 25, 25 );
    scene.add( light );

    currentDesign = generateGenes();
    generateMeshes();
    applyMutation(currentDesign);

    controls = new THREE.TrackballControls(camera);
    controls.target.set(0,0,0);

    threejs_canvas = document.getElementById("threejs");

    renderer = new THREE.WebGLRenderer( {canvas: threejs_canvas, antialias: true, preserveDrawingBuffer: true } );
    renderer.setSize( windowWidth, windowHeight );
    document.body.appendChild( renderer.domElement );

    animate();
});

function animate() {
    requestAnimationFrame( animate );

    controls.update();
    
    renderer.render( scene, camera );

    evolve();
}

function evolve(){
    let localScore = Number.NEGATIVE_INFINITY;
    let localDesign = currentDesign;
    //Generate childrenPerGeneration amount and choose best (random for now)
    for(let g = 0; g < childrenPerGeneration; g++){
        let child = mutateDesign(currentDesign);
        //draw the design on p5js canvas to score
        applyMutation(currentDesign);
        let childScore = evaluateFitness();
        if(childScore > localScore){
            localDesign = child;
            localScore = childScore;
            console.log("New high score: " + localScore.toString())
        }
        currentDesign = localDesign;
        currentScore = localScore;
    }
}

function evaluateFitness(){
    //returns a random number for now
    //let fitness = random();  //Keep in case we want to get out of local maxima?
    
    loadPixels();
    let fitness = 0;
    for (let p = 0; p < pixels.length; p += 9) {
       let diff = (pixels[p]-targetImage.pixels[p]);
       fitness -= Math.abs(diff);
    }
    return fitness;
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

        meshArray[i].position.x = design[i*paramsPerGene + 24]-0.5;
        meshArray[i].position.y = design[i*paramsPerGene + 25]-0.5;
        meshArray[i].position.z = design[i*paramsPerGene + 26] - 0.75;

        meshArray[i].rotation.x = design[i*paramsPerGene + 27];
        meshArray[i].rotation.y = design[i*paramsPerGene + 28];
        meshArray[i].geometry.center();
        meshArray[i].geometry.verticesNeedUpdate = true;
        meshArray[i].geometry.computeFaceNormals();
    }

    light.position.x = Math.sin(design[design.length-3]) * 2;
    light.position.y = Math.cos(design[design.length-2]) * 2;
    light.position.z = Math.cos(design[design.length-1]) * 2;
}

function mouseClicked() {
    console.log(get(mouseX, mouseY));
}