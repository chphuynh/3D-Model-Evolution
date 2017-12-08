var canvas;
var targetImage;
var camera, scene, renderer;
var geometry, material, mesh;

//init();
//animate();

function preload(){
    targetImage = loadImage("image.png");
    canvas = document.createElement('canvas');
    canvas.id = "the_canvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "absolute";

    document.body.appendChild(canvas);

    targetImage.loadPixels();
}

function setup() {
    noStroke();
}

function draw(){
    background(255);
    if(targetImage){
        //console.log(pixels);
        //console.log(evaluateFitness());
    }
}

window.addEventListener('load', function() {
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
    camera.position.z = 1;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { canvas: the_canvas, antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    animate();
});

function animate() {

    requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render( scene, camera );

}

function mouseClicked() {
    console.log(get(mouseX, mouseY));
}

function evaluateFitness() {
    loadPixels();
    let score = 0;
    for (let p = 0; p < pixels.length; p += 9) {
        let diff = (pixels[p]-targetImage.pixels[p]);
        score -= Math.abs(diff);
    }
    return score;
}