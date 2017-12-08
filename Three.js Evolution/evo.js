var canvas;
var camera, scene, renderer;
var geometry, material, mesh;

let windowWidth = 400;
let windowHeight = 400;


const mutationAmount = 0.01;

//init();
//animate();

function setup() {
    canvas = createCanvas(windowWidth, windowHeight, 'p2d');
    noStroke();
}

function draw(){
    background(255);

}

window.addEventListener('load', function() {
    camera = new THREE.PerspectiveCamera( 70, windowWidth / windowHeight, 0.01, 10 );
    camera.position.z = 1;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    geometry.dynamic = true;
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( windowWidth, windowHeight );
    document.body.appendChild( renderer.domElement );

    animate();
});

function animate() {
    requestAnimationFrame( animate );

    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.02;

    mutate();

    renderer.render( scene, camera );
}

function generate() {

}

function mutate(){
    for(var i = 0; i < mesh.geometry.vertices.length; i++)
    {
        mesh.geometry.vertices[i].x += random() * mutationAmount - mutationAmount/2;
        mesh.geometry.vertices[i].y  += random() * mutationAmount - mutationAmount/2;
        mesh.geometry.vertices[i].z  += random() * mutationAmount - mutationAmount/2;
    }

    mesh.rotation.x += random() * mutationAmount;
    mesh.rotation.y += random() * mutationAmount;
    mesh.geometry.center();
    mesh.geometry.verticesNeedUpdate = true;
}

function mouseClicked() {
    console.log(get(mouseX, mouseY));
}