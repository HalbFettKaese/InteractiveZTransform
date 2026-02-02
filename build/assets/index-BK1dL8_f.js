(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function e(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(i){if(i.ep)return;i.ep=!0;const o=e(i);fetch(i.href,o)}})();var P=typeof Float32Array<"u"?Float32Array:Array;function l(){var t=new P(2);return P!=Float32Array&&(t[0]=0,t[1]=0),t}function p(t,r){return t[0]=r[0],t[1]=r[1],t}function f(t,r,e){return t[0]=r[0]+e[0],t[1]=r[1]+e[1],t}function V(t,r,e){return t[0]=r[0]-e[0],t[1]=r[1]-e[1],t}function U(t,r,e){return t[0]=r[0]*e[0],t[1]=r[1]*e[1],t}function I(t,r,e){return t[0]=r[0]/e[0],t[1]=r[1]/e[1],t}function h(t,r,e){return t[0]=r[0]*e,t[1]=r[1]*e,t}function L(t,r){var e=r[0]-t[0],n=r[1]-t[1];return Math.sqrt(e*e+n*n)}function b(t){var r=t[0],e=t[1];return Math.sqrt(r*r+e*e)}function R(t,r){return t[0]*r[0]+t[1]*r[1]}var u=V,g=U,w=I;(function(){var t=l();return function(r,e,n,i,o,s){var a,A;for(e||(e=2),n||(n=0),i?A=Math.min(i*e+n,r.length):A=r.length,a=n;a<A;a+=e)t[0]=r[a],t[1]=r[a+1],o(t,t,s),r[a]=t[0],r[a+1]=t[1];return r}})();const z=`#version 300 es\r
precision mediump float;\r
vec2 corners[4] = vec2[4](\r
    vec2(-1., 1.),\r
    vec2(-1.,-1.),\r
    vec2( 1., 1.),\r
    vec2( 1.,-1.)\r
);\r
out vec2 uv;\r
\r
uniform vec2 uViewCorner0;\r
uniform vec2 uViewCorner1;\r
\r
void main() {\r
    vec2 corner = corners[gl_VertexID % 4];\r
    uv = mix(uViewCorner0, uViewCorner1, corner * 0.5 + 0.5);\r
    gl_Position = vec4(corner, 0., 1.);\r
}`,O=`#version 300 es\r
precision mediump float;\r
in vec2 uv;\r
out vec4 fragColor;\r
\r
uniform vec2[64] uZeros;\r
uniform vec2[64] uPoles;\r
uniform int uNumZeros;\r
uniform int uNumPoles;\r
uniform float uFactor;\r
\r
uniform int uDisplayFunc;\r
\r
vec2 cmul(vec2 a, vec2 b) {\r
    return vec2(a.x*b.x-a.y*b.y, a.x*b.y + a.y*b.x);\r
}\r
vec2 cdiv(vec2 a, vec2 b) {\r
    return cmul(a, vec2(b.x, -b.y)) / dot(b, b);\r
}\r
\r
vec3 hue(float angle) {\r
    return clamp(2. - 2. * abs(mod(angle * 3.0 - vec3(0, 1, 2) - 0.5, 3.0) - 1.0), 0., 1.);\r
}\r
\r
vec3 displayColor(vec2 H) {\r
    if (uDisplayFunc == 0) {\r
        float L = length(H);\r
        vec3 col = vec3(1);\r
        float f = clamp(L, 0., 1.);\r
        col = mix(col, vec3(0, 0, 1), 1. - f*f);\r
        f = clamp(1./L, 0., 1.);\r
        col = mix(col, vec3(1, 0, 0), 1. - f*f);\r
        return col;\r
    } else if (uDisplayFunc == 1 || uDisplayFunc == 2) {\r
        float angle = atan(H.y, H.x) / 6.28318530718;\r
        return hue(angle);\r
    }\r
    return vec3(0);\r
}\r
\r
float unitCircle(vec2 uv) {\r
    float s = 1.5 * dFdx(uv.x);\r
    return smoothstep(0.0, s, abs(1. - length(uv)));\r
}\r
\r
void main() {\r
    vec2 z = uv;\r
    vec2 H;\r
    if (uDisplayFunc == 2) {\r
        vec2 c = uv;\r
        z = vec2(0);\r
        for (int i = 0; i < 100; i++) {\r
            z = cmul(z, z) + c;\r
        }\r
        H = z;\r
    } else {\r
        H = vec2(uFactor, 0.0);\r
        for (int i = 0; i < uNumZeros; i++) {\r
            H = cmul(H, z - uZeros[i]);\r
        }\r
        vec2 denominator = vec2(1, 0);\r
        for (int i = 0; i < uNumPoles; i++) {\r
            denominator = cmul(denominator, z - uPoles[i]);\r
        }\r
        H = cdiv(H, denominator);\r
    }\r
    vec3 col = displayColor(H);\r
    col *= unitCircle(uv);\r
    fragColor = vec4(col, 1.0);\r
}`,W=`#version 300 es\r
precision mediump float;\r
\r
uniform sampler2D uSampler;\r
\r
out vec4 fragColor;\r
\r
void main() {\r
    fragColor = texture(uSampler, gl_PointCoord);\r
    //if (fragColor.a < 0.01) discard;\r
}`,G=`#version 300 es\r
precision mediump float;\r
\r
uniform vec2 uViewCorner0;\r
uniform vec2 uViewCorner1;\r
uniform float uRadius;\r
\r
in vec2 vPos;\r
\r
void main() {\r
    vec2 uv = (vPos - uViewCorner0) / (uViewCorner1 - uViewCorner0);\r
    gl_Position = vec4(uv * 2. - 1., 0, 1);\r
    gl_PointSize = uRadius;\r
}`,M="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAPJ2AQDoAwAA8nYBAOgDAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAABc7WH6CeiquwAAAcJJREFUOE9l0/1OW0cQBfDfuQYrfNnFlEIRTft6zgOFvF4aCiofRhRjaqu5kz/uUpF2pdXurGbOzhydE/9Z9cm2sodddO15XazDMnP92/y8DeqjQzHFBO+wjR4bvGCFh8w9/g+gLvxUHIVDZSL2ilFLWFeslGW4Ve7zwcO/APXRrOI0nGCmzLCrM1Y6rJXHikW4wy2uMrfs6sK4YhqOlB9xKk7FufIev+C84ixxguN67RKdsh+mYiJmmOGs+BW/tfNUHOsdYZo4EJO6cNA1ssZ6u435Q/zQxjlPnBU/p8zEBPt6O9jBuBPb2BKjGsB2in1M8V7vJEO814reiTG2lFGHqkgNdPeiQolSetFhhNLe61UfGQA2yteUPgPbKzwrj+Iz/lDumw5eqqwz3Df4p8Mmg0CWbT/iTrnGF1zq3FQs8BSeK17wN567VvSEv/DQfruruBS/47Nymd5VxT0WKUuxzNyqy9wGC9xU3OpcF5cZWv/SuriquE75E/fFQj/I+a2Uj5VDcVyx1/Sxjb5YZ+DmyTDKzasfvjfThWnTwUEz0lZz5KbNvFTu8sHqteY7AOg/GacGPSgjUfiK52LVzdXb/G/PqcUD4K7OawAAAABJRU5ErkJggg==",x="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAGAAAAABAAAAYAAAAAEAAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAAAGNdRzso9yOwAAAKBJREFUOE+tk8kVhCAQRH+bAjlwJQiCMFkNwqs5EEPPAZjBsUWfWieW+vW6WQDAa8DrhFfHmby64g0AUgYz4IAFiKyS/jkocPYGIAFR8DoBsbHZIVu4ah6AsUBVuaK2HRtegFFODLUye2+VlAPohmCsfVv8BXAY0mp3PtsAuiE7GGBoJ3f0Ygs2fPEQj+EL19iDa6kdz+On/Pgz1Y3b3/kDyIdp/wyb82kAAAAASUVORK5CYII=",Y="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAPJ2AQDoAwAA8nYBAOgDAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAABc7WH6CeiquwAAALtJREFUOE+lk0EKgzAURJ9CF3oaW+/U3qi04l0UPEXrovQaFjJdmEoMCVH6YDbD/G8mKngIKsFV8BBMVg/rVX5+QVAIbgIjUERGcBcUoeE+MBBTv1pin+yHUmp+w1Xi2DEZwSkHzkDmNNpKBlywN+xv36pnJpiAg79+I5/cd/aSAy/f3ME7Bzrf3UGH4PjHa6xh/haaQCCldjmHoBQMgVBMg6B0qixL2kQdYzPrYRdBbSuNzu88Wm/u7PAFNJURMyUkb5IAAAAASUVORK5CYII=";function S(t,r){return Object.fromEntries(t.map(e=>[e,r(e)]))}function Q(t,r){return(t%r+r)%r}function _(t){const r=[0,1],e=[1,0],n=[1,0],i=l();t.forEach(s=>{const a=s.type=="zero"?e:n;u(i,r,s.pos),N(a,a,i)});const o=l();return k(o,e,n),1/b(o)}function N(t,[r,e],[n,i]){p(t,[r*n-e*i,e*n+r*i])}function k(t,r,e){N(t,r,[e[0],-e[1]]),h(t,t,1/R(e,e))}function y(t,r,e,n,i){const o=B(t,t.VERTEX_SHADER,r),s=B(t,t.FRAGMENT_SHADER,e);if(o===null||s===null)return null;const a=t.createProgram();return t.attachShader(a,o),t.attachShader(a,s),t.linkProgram(a),t.getProgramParameter(a,t.LINK_STATUS)?{program:a,attribLocations:S(n,A=>t.getAttribLocation(a,A)),uniformLocations:S(i,A=>t.getUniformLocation(a,A))}:(alert(`Unable to initialize the shader program: ${t.getProgramInfoLog(a)}`),null)}function B(t,r,e){const n=t.createShader(r);return t.shaderSource(n,e),t.compileShader(n),t.getShaderParameter(n,t.COMPILE_STATUS)?n:(alert(`An error occurred compiling the shaders: ${t.getShaderInfoLog(n)}`),t.deleteShader(n),null)}const T={allPass:{flipType:!0,toVirtual:t=>{const r=[0,0];return p(r,t),h(r,r,1/R(r,r)),r}},complement:{flipType:!1,toVirtual:([t,r])=>[t,-r]}};function j(t,r,e){var{flipType:n,toVirtual:i,fromVirtual:o}=T[e];const s=n?r.type=="zero"?"pole":"zero":r.type;o===void 0&&(o=i);var a=[];if("fromVirtual"in r){const c=o;o=d=>r.fromVirtual(c(d)),t=r.index,a=r.history}const A={...r.relations};return A[e]=!1,{pos:i(r.pos),type:s,index:t,fromVirtual:o,relations:A,history:[...a,e]}}function D(t){const r=t.press.ind;if(r==-1){t.selectionWindow.hidden=!0;return}const e=t.virtualPoints[r],n={real:e.pos[0],imag:e.pos[1],radius:b(e.pos),angle:180/Math.PI*Math.atan2(e.pos[1],e.pos[0])};t.selectionWindow.querySelectorAll("[data-selection]").forEach(i=>{const[o,s]=i.getAttribute("data-selection").split(":").reverse();if(o=="number")document.activeElement!==i&&(i.value=n[s].toString());else if(o=="relation"){const a="fromVirtual"in e?t.points[e.index]:e;s in a.relations?(i.indeterminate=!1,i.checked=a.relations[s]):i.indeterminate=!0}}),t.selectionWindow.hidden=!1}function K(t){const r={};function e(s){t.movePoint(t.press.ind,s),t.drawScene()}const n=()=>{const s=Number.parseFloat(r.real.value),a=Number.parseFloat(r.imag.value);Number.isNaN(s)||Number.isNaN(a)||e([s,a])},i=()=>{const s=Number.parseFloat(r.radius.value);var a=Number.parseFloat(r.angle.value);if(Number.isNaN(s)||Number.isNaN(a))return;a=Math.PI*a/180;const A=[Math.cos(a),Math.sin(a)];h(A,A,s),e(A)},o=s=>a=>{const A=a.target,c=t.virtualPoints[t.press.ind],d=t.points["fromVirtual"in c?c.index:t.press.ind];var m;s in d.relations?m=d.relations[s]?1:0:m=2,m=(m+1)%3,m==2?(A.indeterminate=!0,delete d.relations[s]):m==1?A.checked=d.relations[s]=!0:A.checked=d.relations[s]=!1,"fromVirtual"in c&&(!t.getRelation(d,s)&&c.history.indexOf(s)!==-1?(t.press.ind=-1,t.selectionWindow.hidden=!0):t.recoverIndex()),t.drawScene()};t.selectionWindow=document.getElementById("selected_point_window"),t.selectionWindow.querySelectorAll("[data-selection]").forEach(s=>{const[a,A]=s.getAttribute("data-selection").split(":").reverse();if(r[A]=s,a=="number")A=="real"||A=="imag"?s.oninput=n:(A=="radius"||A=="angle")&&(s.oninput=i);else if(a=="relation")s.onclick=o(A);else if(a=="button"){const c=s;A=="delete"?c.onclick=()=>t.deleteSelectedPoint():A=="jump"&&(c.onclick=()=>t.jumpToSelectedPoint())}})}class H{constructor(r){this.defaultRelations={},this.ctx=r,this.lastFactor=r.factor,this.factorSlider=document.getElementById("scale_slider"),this.factorText=document.getElementById("scale_input"),this.factorNorm=document.getElementById("scale_norm"),this.factorSlider.addEventListener("input",()=>{this.factorNorm.checked=!1,r.factor=Math.pow(2,this.factorSlider.valueAsNumber)}),this.factorText.onbeforeinput=e=>{const n=/\./.test(e.target.value);var i=e.data===null||!n&&e.data=="."||/\d/.test(e.data);i||e.preventDefault()},this.factorText.oninput=e=>{const n=Number.parseFloat(this.factorText.value);Number.isNaN(n)||(e!==null&&(this.factorNorm.checked=!1),r.factor=n)},this.factorNorm.onclick=()=>{r.drawScene()},this.factorText.oninput(null),document.querySelectorAll("#settings_window [data-selection]").forEach(e=>{const[n,i]=e.getAttribute("data-selection").split(":").reverse();n=="relation"&&(e.onclick=()=>{this.defaultRelations[i]=e.checked,r.recoverIndex(),r.drawScene()},this.defaultRelations[i]=e.checked)})}update(){this.lastFactor!=this.ctx.factor&&(document.activeElement!==this.factorSlider&&(this.factorSlider.value=this.ctx.factor===0?this.factorSlider.min:Math.log2(this.ctx.factor).toString()),document.activeElement!==this.factorText&&(this.factorText.value=this.ctx.factor.toString()),this.lastFactor=this.ctx.factor)}}const E={};function Z(t,r){if(r in E)return E[r];const e=t.gl,n=e.createTexture();e.bindTexture(e.TEXTURE_2D,n);const i=1,o=1,s=new Uint8Array([0,0,255,255]);e.texImage2D(e.TEXTURE_2D,0,e.RGBA,i,o,0,e.RGBA,e.UNSIGNED_BYTE,s);const a=new Image;return a.onload=()=>{e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),t.dirty=!0},e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),a.src=r,E[r]=n,n}function F(t,r,e,n){const i=t.gl,o=Z(t,e),s=t.virtualPoints.filter(r).map(A=>A.pos);if(s.length==0)return;n===void 0&&(n=10);const a=t.shaderPrograms.scatter;i.useProgram(a.program),i.bindBuffer(i.ARRAY_BUFFER,t.buffers.points),i.bufferData(i.ARRAY_BUFFER,new Float32Array(s.flat()),i.STATIC_DRAW),i.enableVertexAttribArray(a.attribLocations.vPos),i.vertexAttribPointer(a.attribLocations.vPos,2,i.FLOAT,!1,0,0),i.uniform2fv(a.uniformLocations.uViewCorner0,t.viewFrame.corner0),i.uniform2fv(a.uniformLocations.uViewCorner1,t.viewFrame.corner1),i.uniform1f(a.uniformLocations.uRadius,n),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,o),i.uniform1i(a.uniformLocations.uSampler,0),i.drawArrays(i.POINTS,0,s.length)}function J(t){const r=t.gl,e=t.shaderPrograms.zTransform;r.useProgram(e.program);const n=t.virtualPoints.filter(o=>o.type=="zero").map(o=>o.pos),i=t.virtualPoints.filter(o=>o.type=="pole").map(o=>o.pos);n.length>0&&r.uniform2fv(e.uniformLocations.uZeros,n.flat()),i.length>0&&r.uniform2fv(e.uniformLocations.uPoles,i.flat()),r.uniform1i(e.uniformLocations.uNumZeros,n.length),r.uniform1i(e.uniformLocations.uNumPoles,i.length),r.uniform1f(e.uniformLocations.uFactor,t.factor),r.uniform2fv(e.uniformLocations.uViewCorner0,t.viewFrame.corner0),r.uniform2fv(e.uniformLocations.uViewCorner1,t.viewFrame.corner1),r.uniform1i(e.uniformLocations.uDisplayFunc,t.displayFunction),r.drawArrays(r.TRIANGLE_STRIP,0,4)}const X=[],q=["uZeros","uPoles","uNumZeros","uNumPoles","uFactor","uViewCorner0","uViewCorner1","uDisplayFunc"],$=["vPos"],ee=["uSampler","uViewCorner0","uViewCorner1","uRadius"],re=["points"];class te{constructor(r){this.gl=null,this.points=[],this.virtualPoints=[],this.displayFunction=0,this.settingsWindow=null,this.#e=!1,this.#r=1,this.canvas=r,r.ctx=this,r.width=window.innerWidth,r.height=window.innerHeight,this.press=new ne(r),K(this),this.settingsWindow=new H(this);const e=r.getContext("webgl2",{alpha:!1,premultipliedAlpha:!1});if(e===null){alert("Unable to initialize WebGL. Your browser or machine may not support it.");return}this.gl=e,this.viewFrame=new ie(r),this.shaderPrograms={zTransform:y(e,z,O,X,q),scatter:y(e,G,W,$,ee)},this.buffers=S(re,()=>e.createBuffer())}#e;#r;get factor(){return this.#r}set factor(r){this.#r=r,this.settingsWindow!==null&&this.settingsWindow.update(),this.drawScene()}updateVirtualPoints(){this.virtualPoints=this.points.map((e,n)=>({...e})),this.virtualPoints.length*4;for(const e of Object.keys(T))for(var r=0;r<this.virtualPoints.length;r++)this.getRelation(this.virtualPoints[r],e)&&this.virtualPoints.push(j(r,this.virtualPoints[r],e))}movePoint(r,e){const n=this.virtualPoints[r];"fromVirtual"in n?(e=n.fromVirtual(e),p(this.points[n.index].pos,e)):p(this.points[r].pos,e)}deleteSelectedPoint(){if(this.press.ind===-1)return;const r=this.virtualPoints[this.press.ind],e="fromVirtual"in r?r.index:this.press.ind;this.points.splice(e,1),this.press.ind=-1,this.selectionWindow.hidden=!0,this.drawScene()}jumpToSelectedPoint(){if(this.press.ind===-1)return;const r=this.virtualPoints[this.press.ind],e=l();f(e,this.viewFrame.corner0,this.viewFrame.corner1),h(e,e,.5),u(e,r.pos,e),f(this.viewFrame.corner0,this.viewFrame.corner0,e),f(this.viewFrame.corner1,this.viewFrame.corner1,e),this.drawScene()}drawScene(){if(this.#e||this.gl===null)return;this.#e=!0,this.updateVirtualPoints(),this.settingsWindow.factorNorm.checked&&(this.factor=_(this.virtualPoints)),D(this);const r=this.gl;r.enable(r.BLEND),r.blendFunc(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA),r.clearColor(0,0,0,1),r.clear(r.COLOR_BUFFER_BIT),J(this),F(this,(e,n)=>n===this.press.ind,M,20),F(this,e=>e.type=="pole",x),F(this,e=>e.type=="zero",Y),this.#e=!1,r.flush()}getRelation(r,e){return(e in r.relations?r.relations:this.settingsWindow.defaultRelations)[e]}recoverIndex(){const r=this.press.ind,e=this.virtualPoints[r];this.updateVirtualPoints(),"fromVirtual"in e&&(this.press.ind=this.virtualPoints.findIndex(n=>"fromVirtual"in n&&n.index===e.index&&JSON.stringify(n.history)==JSON.stringify(e.history)),this.press.ind===-1&&(this.selectionWindow.hidden=!0))}}class ne{constructor(r){this.isDown=!1,this.ind=-1,this.element=-1,this.mouse=l(),this.canvas=r}update(r,e){this.isDown=!0,this.element=r,this.mouse=e}}class ie{constructor(r,e,n){if(this.canvas=r,!e||!n){var i=r.width,o=r.height,s=Math.min(i,o)/2/1.2;i/=s,o/=s,this.corner0=[-i/2,-o/2],this.corner1=[i/2,o/2]}else this.corner0=e,this.corner1=n}fromCanvasCoords(r){const e=[r[0],this.canvas.height-r[1]];w(e,e,[this.canvas.width,this.canvas.height]);const n=[0,0];return u(n,this.corner1,this.corner0),g(e,e,n),f(e,e,this.corner0),e}fromCanvasDelta(r){const e=[r[0],-r[1]];w(e,e,[this.canvas.width,this.canvas.height]);const n=l();return u(n,this.corner1,this.corner0),g(e,e,n),e}toCanvasCoords(r){const e=l();u(e,r,this.corner0);const n=l();return u(n,this.corner1,this.corner0),w(e,e,n),g(e,[e[0],1-e[1]],[this.canvas.width,this.canvas.height]),e}}function C(t,r){return L(t,r)<15}function oe(){const t=document.getElementById("gl_canvas"),r=document.getElementsByClassName("sidebar-container").item(0),e=document.getElementById("info-button");document.getElementById("info-text"),e.onclick=()=>{e.toggleAttribute("data-toggle")};const n=new te(t);var i=!1;t.onmousedown=o=>{if(i=!1,o.shiftKey||o.ctrlKey||o.button!==0)return;const s=[o.x,o.y],a=n.virtualPoints.findIndex(A=>C(n.viewFrame.toCanvasCoords(A.pos),s));if(a!==-1){n.press.update(0,s),v(n,a);return}n.press.update(-1,s)},t.onmousemove=o=>{if(i=!0,!n.press.isDown)return;const s=[o.x,o.y],a=l();u(a,s,n.press.mouse);const A=n.viewFrame.fromCanvasDelta(a);switch(n.press.element){case-1:u(n.viewFrame.corner0,n.viewFrame.corner0,A),u(n.viewFrame.corner1,n.viewFrame.corner1,A);break;case 0:const c=[0,0];f(c,n.virtualPoints[n.press.ind].pos,A),n.movePoint(n.press.ind,c);break}n.press.mouse=s,n.drawScene()},t.onmouseleave=t.onmouseup=()=>{n.press.isDown=!1},t.onclick=o=>{const s=n.viewFrame.fromCanvasCoords([o.x,o.y]);o.shiftKey?(n.points.push({pos:s,type:"pole",relations:{}}),v(n,n.points.length-1)):o.ctrlKey?(n.points.push({pos:s,type:"zero",relations:{}}),v(n,n.points.length-1)):i||n.virtualPoints.findIndex(A=>C(n.viewFrame.toCanvasCoords(A.pos),[o.x,o.y]))===-1&&(n.selectionWindow.hidden=!0,n.press.ind=-1),n.drawScene()},t.onwheel=o=>{const s=n.viewFrame.fromCanvasCoords([o.x,o.y]),a=Math.pow(2,10*o.deltaY/t.height);u(n.viewFrame.corner0,n.viewFrame.corner0,s),u(n.viewFrame.corner1,n.viewFrame.corner1,s),h(n.viewFrame.corner0,n.viewFrame.corner0,a),h(n.viewFrame.corner1,n.viewFrame.corner1,a),f(n.viewFrame.corner0,n.viewFrame.corner0,s),f(n.viewFrame.corner1,n.viewFrame.corner1,s),n.drawScene(),o.preventDefault()},window.addEventListener("keydown",o=>{switch(o.key=="Escape"&&document.activeElement.blur(),o.key){case"d":n.displayFunction=(n.displayFunction+1)%2;break;case"Delete":if(r.contains(document.activeElement))return;n.deleteSelectedPoint();break;case"j":n.jumpToSelectedPoint();break;case"Enter":if(r.contains(document.activeElement)||n.virtualPoints.length==0)return;const s=o.shiftKey?-1:1;v(n,Q(n.press.ind+s,n.virtualPoints.length)),n.jumpToSelectedPoint();break;case"i":e.toggleAttribute("data-toggle");return;default:return}o.preventDefault(),n.drawScene()}),window.onresize=()=>{const o=t.height/t.width;t.width=window.innerWidth,t.height=window.innerHeight;const s=t.height/t.width;n.viewFrame.corner0[1]-=n.viewFrame.corner1[1],n.viewFrame.corner0[1]*=s/o,n.viewFrame.corner0[1]+=n.viewFrame.corner1[1],n.gl.viewport(0,0,t.width,t.height),n.drawScene()},n.drawScene()}function v(t,r){t.press.ind=r,t.updateVirtualPoints(),D(t)}oe();
