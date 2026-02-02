(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function e(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=e(i);fetch(i.href,o)}})();var P=typeof Float32Array<"u"?Float32Array:Array;function l(){var n=new P(2);return P!=Float32Array&&(n[0]=0,n[1]=0),n}function p(n,t){return n[0]=t[0],n[1]=t[1],n}function f(n,t,e){return n[0]=t[0]+e[0],n[1]=t[1]+e[1],n}function V(n,t,e){return n[0]=t[0]-e[0],n[1]=t[1]-e[1],n}function U(n,t,e){return n[0]=t[0]*e[0],n[1]=t[1]*e[1],n}function I(n,t,e){return n[0]=t[0]/e[0],n[1]=t[1]/e[1],n}function h(n,t,e){return n[0]=t[0]*e,n[1]=t[1]*e,n}function L(n,t){var e=t[0]-n[0],r=t[1]-n[1];return Math.sqrt(e*e+r*r)}function R(n){var t=n[0],e=n[1];return Math.sqrt(t*t+e*e)}function b(n,t){return n[0]*t[0]+n[1]*t[1]}var u=V,g=U,w=I;(function(){var n=l();return function(t,e,r,i,o,s){var a,A;for(e||(e=2),r||(r=0),i?A=Math.min(i*e+r,t.length):A=t.length,a=r;a<A;a+=e)n[0]=t[a],n[1]=t[a+1],o(n,n,s),t[a]=n[0],t[a+1]=n[1];return t}})();const z=`#version 300 es
precision mediump float;
vec2 corners[4] = vec2[4](
    vec2(-1., 1.),
    vec2(-1.,-1.),
    vec2( 1., 1.),
    vec2( 1.,-1.)
);
out vec2 uv;

uniform vec2 uViewCorner0;
uniform vec2 uViewCorner1;

void main() {
    vec2 corner = corners[gl_VertexID % 4];
    uv = mix(uViewCorner0, uViewCorner1, corner * 0.5 + 0.5);
    gl_Position = vec4(corner, 0., 1.);
}`,O=`#version 300 es
precision mediump float;
in vec2 uv;
out vec4 fragColor;

uniform vec2[64] uZeros;
uniform vec2[64] uPoles;
uniform int uNumZeros;
uniform int uNumPoles;
uniform float uFactor;

uniform int uDisplayFunc;

vec2 cmul(vec2 a, vec2 b) {
    return vec2(a.x*b.x-a.y*b.y, a.x*b.y + a.y*b.x);
}
vec2 cdiv(vec2 a, vec2 b) {
    return cmul(a, vec2(b.x, -b.y)) / dot(b, b);
}

vec3 hue(float angle) {
    return clamp(2. - 2. * abs(mod(angle * 3.0 - vec3(0, 1, 2) - 0.5, 3.0) - 1.0), 0., 1.);
}

vec3 displayColor(vec2 H) {
    if (uDisplayFunc == 0) {
        float L = length(H);
        vec3 col = vec3(1);
        float f = clamp(L, 0., 1.);
        col = mix(col, vec3(0, 0, 1), 1. - f*f);
        f = clamp(1./L, 0., 1.);
        col = mix(col, vec3(1, 0, 0), 1. - f*f);
        return col;
    } else if (uDisplayFunc == 1 || uDisplayFunc == 2) {
        float angle = atan(H.y, H.x) / 6.28318530718;
        return hue(angle);
    }
    return vec3(0);
}

float unitCircle(vec2 uv) {
    float s = 1.5 * dFdx(uv.x);
    return smoothstep(0.0, s, abs(1. - length(uv)));
}

void main() {
    vec2 z = uv;
    vec2 H;
    if (uDisplayFunc == 2) {
        vec2 c = uv;
        z = vec2(0);
        for (int i = 0; i < 100; i++) {
            z = cmul(z, z) + c;
        }
        H = z;
    } else {
        H = vec2(uFactor, 0.0);
        for (int i = 0; i < uNumZeros; i++) {
            H = cmul(H, z - uZeros[i]);
        }
        vec2 denominator = vec2(1, 0);
        for (int i = 0; i < uNumPoles; i++) {
            denominator = cmul(denominator, z - uPoles[i]);
        }
        H = cdiv(H, denominator);
    }
    vec3 col = displayColor(H);
    col *= unitCircle(uv);
    fragColor = vec4(col, 1.0);
}`,W=`#version 300 es
precision mediump float;

uniform sampler2D uSampler;

out vec4 fragColor;

void main() {
    fragColor = texture(uSampler, gl_PointCoord);
    //if (fragColor.a < 0.01) discard;
}`,G=`#version 300 es
precision mediump float;

uniform vec2 uViewCorner0;
uniform vec2 uViewCorner1;
uniform float uRadius;

in vec2 vPos;

void main() {
    vec2 uv = (vPos - uViewCorner0) / (uViewCorner1 - uViewCorner0);
    gl_Position = vec4(uv * 2. - 1., 0, 1);
    gl_PointSize = uRadius;
}`,M="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAPJ2AQDoAwAA8nYBAOgDAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAABc7WH6CeiquwAAAcJJREFUOE9l0/1OW0cQBfDfuQYrfNnFlEIRTft6zgOFvF4aCiofRhRjaqu5kz/uUpF2pdXurGbOzhydE/9Z9cm2sodddO15XazDMnP92/y8DeqjQzHFBO+wjR4bvGCFh8w9/g+gLvxUHIVDZSL2ilFLWFeslGW4Ve7zwcO/APXRrOI0nGCmzLCrM1Y6rJXHikW4wy2uMrfs6sK4YhqOlB9xKk7FufIev+C84ixxguN67RKdsh+mYiJmmOGs+BW/tfNUHOsdYZo4EJO6cNA1ssZ6u435Q/zQxjlPnBU/p8zEBPt6O9jBuBPb2BKjGsB2in1M8V7vJEO814reiTG2lFGHqkgNdPeiQolSetFhhNLe61UfGQA2yteUPgPbKzwrj+Iz/lDumw5eqqwz3Df4p8Mmg0CWbT/iTrnGF1zq3FQs8BSeK17wN567VvSEv/DQfruruBS/47Nymd5VxT0WKUuxzNyqy9wGC9xU3OpcF5cZWv/SuriquE75E/fFQj/I+a2Uj5VDcVyx1/Sxjb5YZ+DmyTDKzasfvjfThWnTwUEz0lZz5KbNvFTu8sHqteY7AOg/GacGPSgjUfiK52LVzdXb/G/PqcUD4K7OawAAAABJRU5ErkJggg==",x="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAGAAAAABAAAAYAAAAAEAAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAAAGNdRzso9yOwAAAKBJREFUOE+tk8kVhCAQRH+bAjlwJQiCMFkNwqs5EEPPAZjBsUWfWieW+vW6WQDAa8DrhFfHmby64g0AUgYz4IAFiKyS/jkocPYGIAFR8DoBsbHZIVu4ah6AsUBVuaK2HRtegFFODLUye2+VlAPohmCsfVv8BXAY0mp3PtsAuiE7GGBoJ3f0Ygs2fPEQj+EL19iDa6kdz+On/Pgz1Y3b3/kDyIdp/wyb82kAAAAASUVORK5CYII=",Y="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAPJ2AQDoAwAA8nYBAOgDAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAABc7WH6CeiquwAAALtJREFUOE+lk0EKgzAURJ9CF3oaW+/U3qi04l0UPEXrovQaFjJdmEoMCVH6YDbD/G8mKngIKsFV8BBMVg/rVX5+QVAIbgIjUERGcBcUoeE+MBBTv1pin+yHUmp+w1Xi2DEZwSkHzkDmNNpKBlywN+xv36pnJpiAg79+I5/cd/aSAy/f3ME7Bzrf3UGH4PjHa6xh/haaQCCldjmHoBQMgVBMg6B0qixL2kQdYzPrYRdBbSuNzu88Wm/u7PAFNJURMyUkb5IAAAAASUVORK5CYII=";function S(n,t){return Object.fromEntries(n.map(e=>[e,t(e)]))}function Q(n,t){return(n%t+t)%t}function _(n){const t=[0,1],e=[1,0],r=[1,0],i=l();n.forEach(s=>{const a=s.type=="zero"?e:r;u(i,t,s.pos),N(a,a,i)});const o=l();return k(o,e,r),1/R(o)}function N(n,[t,e],[r,i]){p(n,[t*r-e*i,e*r+t*i])}function k(n,t,e){N(n,t,[e[0],-e[1]]),h(n,n,1/b(e,e))}function y(n,t,e,r,i){const o=B(n,n.VERTEX_SHADER,t),s=B(n,n.FRAGMENT_SHADER,e);if(o===null||s===null)return null;const a=n.createProgram();return n.attachShader(a,o),n.attachShader(a,s),n.linkProgram(a),n.getProgramParameter(a,n.LINK_STATUS)?{program:a,attribLocations:S(r,A=>n.getAttribLocation(a,A)),uniformLocations:S(i,A=>n.getUniformLocation(a,A))}:(alert(`Unable to initialize the shader program: ${n.getProgramInfoLog(a)}`),null)}function B(n,t,e){const r=n.createShader(t);return n.shaderSource(r,e),n.compileShader(r),n.getShaderParameter(r,n.COMPILE_STATUS)?r:(alert(`An error occurred compiling the shaders: ${n.getShaderInfoLog(r)}`),n.deleteShader(r),null)}const T={allPass:{flipType:!0,toVirtual:n=>{const t=[0,0];return p(t,n),h(t,t,1/b(t,t)),t}},complement:{flipType:!1,toVirtual:([n,t])=>[n,-t]}};function j(n,t,e){var{flipType:r,toVirtual:i,fromVirtual:o}=T[e];const s=r?t.type=="zero"?"pole":"zero":t.type;o===void 0&&(o=i);var a=[];if("fromVirtual"in t){const c=o;o=d=>t.fromVirtual(c(d)),n=t.index,a=t.history}const A={...t.relations};return A[e]=!1,{pos:i(t.pos),type:s,index:n,fromVirtual:o,relations:A,history:[...a,e]}}function D(n){const t=n.press.ind;if(t==-1){n.selectionWindow.hidden=!0;return}const e=n.virtualPoints[t],r={real:e.pos[0],imag:e.pos[1],radius:R(e.pos),angle:180/Math.PI*Math.atan2(e.pos[1],e.pos[0])};n.selectionWindow.querySelectorAll("[data-selection]").forEach(i=>{const[o,s]=i.getAttribute("data-selection").split(":").reverse();if(o=="number")document.activeElement!==i&&(i.value=r[s].toString());else if(o=="relation"){const a="fromVirtual"in e?n.points[e.index]:e;s in a.relations?(i.indeterminate=!1,i.checked=a.relations[s]):i.indeterminate=!0}}),n.selectionWindow.hidden=!1}function K(n){const t={};function e(s){n.movePoint(n.press.ind,s),n.drawScene()}const r=()=>{const s=Number.parseFloat(t.real.value),a=Number.parseFloat(t.imag.value);Number.isNaN(s)||Number.isNaN(a)||e([s,a])},i=()=>{const s=Number.parseFloat(t.radius.value);var a=Number.parseFloat(t.angle.value);if(Number.isNaN(s)||Number.isNaN(a))return;a=Math.PI*a/180;const A=[Math.cos(a),Math.sin(a)];h(A,A,s),e(A)},o=s=>a=>{const A=a.target,c=n.virtualPoints[n.press.ind],d=n.points["fromVirtual"in c?c.index:n.press.ind];var m;s in d.relations?m=d.relations[s]?1:0:m=2,m=(m+1)%3,m==2?(A.indeterminate=!0,delete d.relations[s]):m==1?A.checked=d.relations[s]=!0:A.checked=d.relations[s]=!1,"fromVirtual"in c&&(!n.getRelation(d,s)&&c.history.indexOf(s)!==-1?(n.press.ind=-1,n.selectionWindow.hidden=!0):n.recoverIndex()),n.drawScene()};n.selectionWindow=document.getElementById("selected_point_window"),n.selectionWindow.querySelectorAll("[data-selection]").forEach(s=>{const[a,A]=s.getAttribute("data-selection").split(":").reverse();if(t[A]=s,a=="number")A=="real"||A=="imag"?s.oninput=r:(A=="radius"||A=="angle")&&(s.oninput=i);else if(a=="relation")s.onclick=o(A);else if(a=="button"){const c=s;A=="delete"?c.onclick=()=>n.deleteSelectedPoint():A=="jump"&&(c.onclick=()=>n.jumpToSelectedPoint())}})}class H{constructor(t){this.defaultRelations={},this.ctx=t,this.lastFactor=t.factor,this.factorSlider=document.getElementById("scale_slider"),this.factorText=document.getElementById("scale_input"),this.factorNorm=document.getElementById("scale_norm"),this.factorSlider.addEventListener("input",()=>{this.factorNorm.checked=!1,t.factor=Math.pow(2,this.factorSlider.valueAsNumber)}),this.factorText.onbeforeinput=e=>{const r=/\./.test(e.target.value);var i=e.data===null||!r&&e.data=="."||/\d/.test(e.data);i||e.preventDefault()},this.factorText.oninput=e=>{const r=Number.parseFloat(this.factorText.value);Number.isNaN(r)||(e!==null&&(this.factorNorm.checked=!1),t.factor=r)},this.factorNorm.onclick=()=>{t.drawScene()},this.factorText.oninput(null),document.querySelectorAll("#settings_window [data-selection]").forEach(e=>{const[r,i]=e.getAttribute("data-selection").split(":").reverse();r=="relation"&&(e.onclick=()=>{this.defaultRelations[i]=e.checked,t.recoverIndex(),t.drawScene()},this.defaultRelations[i]=e.checked)})}update(){this.lastFactor!=this.ctx.factor&&(document.activeElement!==this.factorSlider&&(this.factorSlider.value=this.ctx.factor===0?this.factorSlider.min:Math.log2(this.ctx.factor).toString()),document.activeElement!==this.factorText&&(this.factorText.value=this.ctx.factor.toString()),this.lastFactor=this.ctx.factor)}}const E={};function Z(n,t){if(t in E)return E[t];const e=n.gl,r=e.createTexture();e.bindTexture(e.TEXTURE_2D,r);const i=1,o=1,s=new Uint8Array([0,0,255,255]);e.texImage2D(e.TEXTURE_2D,0,e.RGBA,i,o,0,e.RGBA,e.UNSIGNED_BYTE,s);const a=new Image;return a.onload=()=>{e.bindTexture(e.TEXTURE_2D,r),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),n.dirty=!0},e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),a.src=t,E[t]=r,r}function F(n,t,e,r){const i=n.gl,o=Z(n,e),s=n.virtualPoints.filter(t).map(A=>A.pos);if(s.length==0)return;r===void 0&&(r=10);const a=n.shaderPrograms.scatter;i.useProgram(a.program),i.bindBuffer(i.ARRAY_BUFFER,n.buffers.points),i.bufferData(i.ARRAY_BUFFER,new Float32Array(s.flat()),i.STATIC_DRAW),i.enableVertexAttribArray(a.attribLocations.vPos),i.vertexAttribPointer(a.attribLocations.vPos,2,i.FLOAT,!1,0,0),i.uniform2fv(a.uniformLocations.uViewCorner0,n.viewFrame.corner0),i.uniform2fv(a.uniformLocations.uViewCorner1,n.viewFrame.corner1),i.uniform1f(a.uniformLocations.uRadius,r),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,o),i.uniform1i(a.uniformLocations.uSampler,0),i.drawArrays(i.POINTS,0,s.length)}function J(n){const t=n.gl,e=n.shaderPrograms.zTransform;t.useProgram(e.program);const r=n.virtualPoints.filter(o=>o.type=="zero").map(o=>o.pos),i=n.virtualPoints.filter(o=>o.type=="pole").map(o=>o.pos);r.length>0&&t.uniform2fv(e.uniformLocations.uZeros,r.flat()),i.length>0&&t.uniform2fv(e.uniformLocations.uPoles,i.flat()),t.uniform1i(e.uniformLocations.uNumZeros,r.length),t.uniform1i(e.uniformLocations.uNumPoles,i.length),t.uniform1f(e.uniformLocations.uFactor,n.factor),t.uniform2fv(e.uniformLocations.uViewCorner0,n.viewFrame.corner0),t.uniform2fv(e.uniformLocations.uViewCorner1,n.viewFrame.corner1),t.uniform1i(e.uniformLocations.uDisplayFunc,n.displayFunction),t.drawArrays(t.TRIANGLE_STRIP,0,4)}const X=[],q=["uZeros","uPoles","uNumZeros","uNumPoles","uFactor","uViewCorner0","uViewCorner1","uDisplayFunc"],$=["vPos"],ee=["uSampler","uViewCorner0","uViewCorner1","uRadius"],te=["points"];class ne{constructor(t){this.gl=null,this.points=[],this.virtualPoints=[],this.displayFunction=0,this.settingsWindow=null,this.#e=!1,this.#t=1,this.canvas=t,t.ctx=this,t.width=window.innerWidth,t.height=window.innerHeight,this.press=new re(t),K(this),this.settingsWindow=new H(this);const e=t.getContext("webgl2",{alpha:!1,premultipliedAlpha:!1});if(e===null){alert("Unable to initialize WebGL. Your browser or machine may not support it.");return}this.gl=e,this.viewFrame=new ie(t),this.shaderPrograms={zTransform:y(e,z,O,X,q),scatter:y(e,G,W,$,ee)},this.buffers=S(te,()=>e.createBuffer())}#e;#t;get factor(){return this.#t}set factor(t){this.#t=t,this.settingsWindow!==null&&this.settingsWindow.update(),this.drawScene()}updateVirtualPoints(){this.virtualPoints=this.points.map((e,r)=>({...e})),this.virtualPoints.length*4;for(const e of Object.keys(T))for(var t=0;t<this.virtualPoints.length;t++)this.getRelation(this.virtualPoints[t],e)&&this.virtualPoints.push(j(t,this.virtualPoints[t],e))}movePoint(t,e){const r=this.virtualPoints[t];"fromVirtual"in r?(e=r.fromVirtual(e),p(this.points[r.index].pos,e)):p(this.points[t].pos,e)}deleteSelectedPoint(){if(this.press.ind===-1)return;const t=this.virtualPoints[this.press.ind],e="fromVirtual"in t?t.index:this.press.ind;this.points.splice(e,1),this.press.ind=-1,this.selectionWindow.hidden=!0,this.drawScene()}jumpToSelectedPoint(){if(this.press.ind===-1)return;const t=this.virtualPoints[this.press.ind],e=l();f(e,this.viewFrame.corner0,this.viewFrame.corner1),h(e,e,.5),u(e,t.pos,e),f(this.viewFrame.corner0,this.viewFrame.corner0,e),f(this.viewFrame.corner1,this.viewFrame.corner1,e),this.drawScene()}drawScene(){if(this.#e||this.gl===null)return;this.#e=!0,this.updateVirtualPoints(),this.settingsWindow.factorNorm.checked&&(this.factor=_(this.virtualPoints)),D(this);const t=this.gl;t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),J(this),F(this,(e,r)=>r===this.press.ind,M,20),F(this,e=>e.type=="pole",x),F(this,e=>e.type=="zero",Y),this.#e=!1,t.flush()}getRelation(t,e){return(e in t.relations?t.relations:this.settingsWindow.defaultRelations)[e]}recoverIndex(){const t=this.press.ind,e=this.virtualPoints[t];this.updateVirtualPoints(),"fromVirtual"in e&&(this.press.ind=this.virtualPoints.findIndex(r=>"fromVirtual"in r&&r.index===e.index&&JSON.stringify(r.history)==JSON.stringify(e.history)),this.press.ind===-1&&(this.selectionWindow.hidden=!0))}}class re{constructor(t){this.isDown=!1,this.ind=-1,this.element=-1,this.mouse=l(),this.canvas=t}update(t,e){this.isDown=!0,this.element=t,this.mouse=e}}class ie{constructor(t,e,r){if(this.canvas=t,!e||!r){var i=t.width,o=t.height,s=Math.min(i,o)/2/1.2;i/=s,o/=s,this.corner0=[-i/2,-o/2],this.corner1=[i/2,o/2]}else this.corner0=e,this.corner1=r}fromCanvasCoords(t){const e=[t[0],this.canvas.height-t[1]];w(e,e,[this.canvas.width,this.canvas.height]);const r=[0,0];return u(r,this.corner1,this.corner0),g(e,e,r),f(e,e,this.corner0),e}fromCanvasDelta(t){const e=[t[0],-t[1]];w(e,e,[this.canvas.width,this.canvas.height]);const r=l();return u(r,this.corner1,this.corner0),g(e,e,r),e}toCanvasCoords(t){const e=l();u(e,t,this.corner0);const r=l();return u(r,this.corner1,this.corner0),w(e,e,r),g(e,[e[0],1-e[1]],[this.canvas.width,this.canvas.height]),e}}function C(n,t){return L(n,t)<15}function oe(){const n=document.getElementById("gl_canvas"),t=document.getElementsByClassName("sidebar-container").item(0),e=document.getElementById("info-button");document.getElementById("info-text"),e.onclick=()=>{e.toggleAttribute("data-toggle")};const r=new ne(n);var i=!1;n.onmousedown=o=>{if(i=!1,o.shiftKey||o.ctrlKey||o.button!==0)return;const s=[o.x,o.y],a=r.virtualPoints.findIndex(A=>C(r.viewFrame.toCanvasCoords(A.pos),s));if(a!==-1){r.press.update(0,s),v(r,a);return}r.press.update(-1,s)},n.onmousemove=o=>{if(i=!0,!r.press.isDown)return;const s=[o.x,o.y],a=l();u(a,s,r.press.mouse);const A=r.viewFrame.fromCanvasDelta(a);switch(r.press.element){case-1:u(r.viewFrame.corner0,r.viewFrame.corner0,A),u(r.viewFrame.corner1,r.viewFrame.corner1,A);break;case 0:const c=[0,0];f(c,r.virtualPoints[r.press.ind].pos,A),r.movePoint(r.press.ind,c);break}r.press.mouse=s,r.drawScene()},n.onmouseleave=n.onmouseup=()=>{r.press.isDown=!1},n.onclick=o=>{const s=r.viewFrame.fromCanvasCoords([o.x,o.y]);o.shiftKey?(r.points.push({pos:s,type:"pole",relations:{}}),v(r,r.points.length-1)):o.ctrlKey?(r.points.push({pos:s,type:"zero",relations:{}}),v(r,r.points.length-1)):i||r.virtualPoints.findIndex(A=>C(r.viewFrame.toCanvasCoords(A.pos),[o.x,o.y]))===-1&&(r.selectionWindow.hidden=!0,r.press.ind=-1),r.drawScene()},n.onwheel=o=>{const s=r.viewFrame.fromCanvasCoords([o.x,o.y]),a=Math.pow(2,10*o.deltaY/n.height);u(r.viewFrame.corner0,r.viewFrame.corner0,s),u(r.viewFrame.corner1,r.viewFrame.corner1,s),h(r.viewFrame.corner0,r.viewFrame.corner0,a),h(r.viewFrame.corner1,r.viewFrame.corner1,a),f(r.viewFrame.corner0,r.viewFrame.corner0,s),f(r.viewFrame.corner1,r.viewFrame.corner1,s),r.drawScene(),o.preventDefault()},window.addEventListener("keydown",o=>{switch(o.key=="Escape"&&document.activeElement.blur(),o.key.toLowerCase()){case"d":r.displayFunction=(r.displayFunction+1)%2;break;case"delete":if(t.contains(document.activeElement))return;r.deleteSelectedPoint();break;case"n":if(r.virtualPoints.length==0)return;const s=o.shiftKey?-1:1;v(r,Q(r.press.ind+s,r.virtualPoints.length)),r.jumpToSelectedPoint();break;case"i":e.toggleAttribute("data-toggle");return;default:return}o.preventDefault(),r.drawScene()}),window.onresize=()=>{const o=n.height/n.width;n.width=window.innerWidth,n.height=window.innerHeight;const s=n.height/n.width;r.viewFrame.corner0[1]-=r.viewFrame.corner1[1],r.viewFrame.corner0[1]*=s/o,r.viewFrame.corner0[1]+=r.viewFrame.corner1[1],r.gl.viewport(0,0,n.width,n.height),r.drawScene()},r.drawScene()}function v(n,t){n.press.ind=t,n.updateVirtualPoints(),D(n)}oe();
