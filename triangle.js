/*
Short disclaimer:
I dont want to lie that I did this project whole by myself... I didn't.
BUT, I really did my best to try to understand the basics
and follow this tutorial: http://www.kamaron.me/webgl-tutorial/01-setup-and-triangle
the same tutorial, but as video in youtube: https://www.youtube.com/watch?v=kB0ZVUrI4Aw
Which I found really helpful in addition to the Angel book.
So I hope this wont be taken as a full plagiat...
Kind regards,
Aidana
*/

//here is some additional GLSL code for a VERTEX shader 
var vertexShaderText = [
    'precision mediump float;',
    '',
    //vec n types are the arrays of floats with n elements 
    //vec2 for attribute with 2 elements-> X and Y
    'attribute vec2 vertPosition;',
    //vec3 for attribute with 3 elements for color -> R,G,B
    'attribute vec3 vertColor;',
    //Position is the standard attribute of fragments 
    //color is not, so color will be varying argument
    'varying vec3 fragColor;',
    '',
    'void main()',
    '{',
    //
    '  fragColor = vertColor;',
    //gl_Position is a position in a homogeneous clip space
    //this MUST be set in the vertex shader
    //gl_Position(x,y,z,w)
    '  gl_Position = vec4(vertPosition, 0.0, 1.0);',
    '}'
    ].join('\n');

//here is also FRAGMENT Shader   
var fragmentShaderText = [
    'precision mediump float;',
    '',
    //suppose to be R,G,B parameters
    'varying vec3 fragColor;',
    'void main()',
    '{',
    //gl_fragColor expects 4 params
    //R,G,B,A, where A is for alpha and could be set as 1
    '  gl_FragColor = vec4(fragColor, 1.0);',
    '}'
    ].join('\n'); 

var Pipeline = function () {
    console.log('This is working');
    /*
    Step 1 -> initialize WebGL
    */
    //Make a canvas(from html file) as a javascript object
    var canvas = document.getElementById('canvas-box');
    //now get a webgl context
    var gl = canvas.getContext('webgl');

    // if there will be problems with loading webgl
    // on other browsers, add a check
    if (!gl) {
        console.log('Probably you are using Internet explorer, i\'ll load experimental WebGL')
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert('Your browser is too old or doesnt recognize WebGL');
    }

    //Clear the webgl color on the canvas
    //Clearing WebGl Context to switch the color
    //gl.clearColor(R,G,B,A); A for alpha; 1.0 for opaque(0% transparent)
    gl.clearColor(0.5, 0.75, 0.85, 1.0);
    //gl.clear needs the arguments for depth buffer and the color buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /*
    Step 2 -> lets setup the pipeline itself
    */
    //1. Vertex shader
    //Create shaders
    //create and specify the vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    //specify the source code vor vertex shader
    gl.shaderSource(vertexShader,vertexShaderText);
    //compile the source
    gl.compileShader(vertexShader);
    //if there were no parameters set, throw an error
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }
    //2. Fragment shader
    //just do the same steps as for vertex shader:
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    //3. SHADER program!
    //this program is a combination of 1 vertex and 1 fragment shader
    //the output of vertex shader should match with inputs of fragmet shader
    var program = gl.createProgram();
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    //once a program were created, it needs to be linked
    //links 2 shaders together
    gl.linkProgram(program);
    //check linking 
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    } 
    //validate
    gl.validateProgram(program);
    //check validation
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    //4. Create a buffer for a triangle Vertices
    var trianglePoints = [
        //X,Y  R,G,B
        0.0, 0.6,  1.0,1.0,0.0,
        -0.7,-0.7, 1.0,0.0,0.0,
        0.7,-0.7,  0.0,0.0,1.0
    ];

    //gl.createBuffer(); allocates Buffer on the GPU
    var triangleVertexBuffer = gl.createBuffer();
    //on this stage we put the object above into the ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
    //now we can bind the data in triangle points to the 
    //array buffer with the static draw
    //WebGL expects here a floats32,
    //but the standard mode in JS is 64 so we need a conversion here 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trianglePoints),gl.STATIC_DRAW); 
   
    /*
    Step 3-> Attach the triangle points to the shader program we initiated above
    */
    //first of all we need to bind the points to attributes from shaders
    var positionAttribLocation = gl.getAttribLocation(program,'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program,'vertColor');

    //gl.vertexAttribPointer - this guy takes 6 args to help to map the attributes in vertex shaders
    //1-location of the attr,
    //2-nr of elements per vertex
    //3-type of element
    //4-just take false, true only for normalizing
    //5-size of vertex in bytes
    //6-the offset in bytes from begin to current attribute
    gl.vertexAttribPointer(
        positionAttribLocation, //attr location
        2, //nr of elements in attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //true for normalize, false for everything else
        5*Float32Array.BYTES_PER_ELEMENT, // Size of vertex
        0 //offset from begin of vertex to attribute
    );

    //need them 2ise, for position and the color, the color is below
    gl.vertexAttribPointer(
        colorAttribLocation, //attr color
        3, //R,G,B or nr of elements in color attribute
        gl.FLOAT,// the type
        gl.FALSE,// see above
        5*Float32Array.BYTES_PER_ELEMENT,//size of vertex
        2*Float32Array.BYTES_PER_ELEMENT// offset from begin of vertex to attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    /*
    Step 4 -> Finaly! draw a triangle
    */
   //bind the program to the pipeline(need this before we do anything) 
   gl.useProgram(program);
   //draws those arrays in the framebuffer
   //1 param, just using a triangles in this sample
   //2 param, nr of vertices to skip and we dont skip anything yet
   //3 param is the nr of vertices to draw
   gl.drawArrays(gl.TRIANGLES,0,3);


}//end pipeline