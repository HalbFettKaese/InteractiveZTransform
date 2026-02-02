import { objectFromFunction as objectFromKeys } from "./util";

export type ProgramInfo<Attributes extends string, Uniforms extends string> = {
    program: WebGLProgram,
    attribLocations: {
        [attributeName in Attributes]: number
    },
    uniformLocations: {
        [uniformName in Uniforms]: WebGLUniformLocation | null
    }
};

type ShaderType = WebGL2RenderingContext["VERTEX_SHADER" | "FRAGMENT_SHADER"];

export function loadShaderProgram<
    const Attributes extends string,
    const Uniforms extends string
    >(
        gl: WebGL2RenderingContext,
        vsSource: string,
        fsSource: string,
        attributes: readonly Attributes[],
        uniforms: readonly Uniforms[]
    ): ProgramInfo<Attributes, Uniforms> | null {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (vertexShader === null || fragmentShader === null) return null;

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
            shaderProgram,
        )}`,
        );
        return null;
    }
    return {
        program: shaderProgram,
        attribLocations: objectFromKeys(attributes, attribute => gl.getAttribLocation(shaderProgram, attribute)),
        uniformLocations: objectFromKeys(uniforms, uniform => gl.getUniformLocation(shaderProgram, uniform)),
    };
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: WebGL2RenderingContext, type: ShaderType, source: string) {
    const shader = gl.createShader(type)!;

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}