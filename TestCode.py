import bpy
from bpy import context
from mathutils import Vector, Matrix
import random

mutationAmount = 0.08
paramsPerGene = 15
numberOfIndividuals = 10
params = []


def generate():
    for x in range(0, numberOfIndividuals):
        for y in range(0, paramsPerGene):
            params.append(random.random())
        if len(bpy.data.objects) < numberOfIndividuals:
            bpy.ops.mesh.primitive_cube_add()

def recalculateNormals():
    for objext in bpy.data.objects:
        if objext.type == 'MESH':
            bpy.ops.object.select_all(action='DESELECT')
            objext.select = True
            bpy.context.scene.objects.active = objext
            # go edit mode
            bpy.ops.object.mode_set(mode='EDIT')
            # select al faces
            bpy.ops.mesh.select_all(action='SELECT')
            # recalculate outside normals 
            bpy.ops.mesh.normals_make_consistent(inside=False)
            # go object mode again
            bpy.ops.object.editmode_toggle()
            objext.select = False

def mutateObject(obj, index):
    mesh = obj.data
    verts = mesh.vertices
    mat_world = obj.matrix_world
    obj.select = True
    
    # Mutates vertices
    curVertIndex = 0
    for vert in verts:
        # Gene Mutation
        vec = Vector((params[index*paramsPerGene + curVertIndex] * 2, params[index*paramsPerGene + curVertIndex + 1] * 2, params[index*paramsPerGene + curVertIndex + 2] * 2))
        
        # Random Mutation
        #vec = Vector((random.random()*mutationAmount, random.random()*mutationAmount, random.random()*mutationAmount))
        
        vert.co = vec
        curVertIndex += 1
    
    # Centers origin to center of Mesh
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY')
    obj.location[0] = params[index*paramsPerGene+3]*10 - 5
    obj.location[1] = params[index*paramsPerGene+4]*10 - 5
    obj.location[2] = params[index*paramsPerGene+5]*10 - 5
    obj.select = False
    
    # Sets Object Color
    obj.color = (params[index*paramsPerGene+11], params[index*paramsPerGene+12], params[index*paramsPerGene+13], params[index*paramsPerGene+14])

# Very Slow Redraw
def testRedraw():
    bpy.ops.wm.redraw_timer(type='DRAW_WIN_SWAP', iterations=1)
    #bpy.data.scenes[0].update()

def clamp(n, minn, maxn):
    return max(min(maxn, n), minn)

def mutateParams():
    for i in range(0,len(params)):
        params[i] = clamp(params[i] + random.random() * mutationAmount - mutationAmount/2, 0, 1)

def mutateAll():
    for x in range(0,100):
        curIndex = 0
        mutateParams()
        for objects in bpy.data.objects:
            if objects.type == 'MESH':
                mutateObject(objects,curIndex)
                recalculateNormals()
                curIndex += 1
        testRedraw()

generate()   
mutateAll()
