(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const A of o.addedNodes)A.tagName==="LINK"&&A.rel==="modulepreload"&&r(A)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();var B=typeof Float32Array<"u"?Float32Array:Array;function l(){var n=new B(2);return B!=Float32Array&&(n[0]=0,n[1]=0),n}function m(n,e){return n[0]=e[0],n[1]=e[1],n}function p(n,e,t){return n[0]=e[0]+t[0],n[1]=e[1]+t[1],n}function U(n,e,t){return n[0]=e[0]-t[0],n[1]=e[1]-t[1],n}function I(n,e,t){return n[0]=e[0]*t[0],n[1]=e[1]*t[1],n}function L(n,e,t){return n[0]=e[0]/t[0],n[1]=e[1]/t[1],n}function h(n,e,t){return n[0]=e[0]*t,n[1]=e[1]*t,n}function z(n,e){var t=e[0]-n[0],r=e[1]-n[1];return Math.sqrt(t*t+r*r)}function b(n){var e=n[0],t=n[1];return Math.sqrt(e*e+t*t)}function N(n,e){return n[0]*e[0]+n[1]*e[1]}var u=U,g=I,w=L;(function(){var n=l();return function(e,t,r,i,o,A){var s,a;for(t||(t=2),r||(r=0),i?a=Math.min(i*t+r,e.length):a=e.length,s=r;s<a;s+=t)n[0]=e[s],n[1]=e[s+1],o(n,n,A),e[s]=n[0],e[s+1]=n[1];return e}})();const O=`#version 300 es
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
}`,W=`#version 300 es
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
}`,G=`#version 300 es
precision mediump float;

uniform sampler2D uSampler;

out vec4 fragColor;

void main() {
    fragColor = texture(uSampler, gl_PointCoord);
    //if (fragColor.a < 0.01) discard;
}`,M=`#version 300 es
precision mediump float;

uniform vec2 uViewCorner0;
uniform vec2 uViewCorner1;
uniform float uRadius;

in vec2 vPos;

void main() {
    vec2 uv = (vPos - uViewCorner0) / (uViewCorner1 - uViewCorner0);
    gl_Position = vec4(uv * 2. - 1., 0, 1);
    gl_PointSize = uRadius;
}`,x="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAPJ2AQDoAwAA8nYBAOgDAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAABc7WH6CeiquwAAAcJJREFUOE9l0/1OW0cQBfDfuQYrfNnFlEIRTft6zgOFvF4aCiofRhRjaqu5kz/uUpF2pdXurGbOzhydE/9Z9cm2sodddO15XazDMnP92/y8DeqjQzHFBO+wjR4bvGCFh8w9/g+gLvxUHIVDZSL2ilFLWFeslGW4Ve7zwcO/APXRrOI0nGCmzLCrM1Y6rJXHikW4wy2uMrfs6sK4YhqOlB9xKk7FufIev+C84ixxguN67RKdsh+mYiJmmOGs+BW/tfNUHOsdYZo4EJO6cNA1ssZ6u435Q/zQxjlPnBU/p8zEBPt6O9jBuBPb2BKjGsB2in1M8V7vJEO814reiTG2lFGHqkgNdPeiQolSetFhhNLe61UfGQA2yteUPgPbKzwrj+Iz/lDumw5eqqwz3Df4p8Mmg0CWbT/iTrnGF1zq3FQs8BSeK17wN567VvSEv/DQfruruBS/47Nymd5VxT0WKUuxzNyqy9wGC9xU3OpcF5cZWv/SuriquE75E/fFQj/I+a2Uj5VDcVyx1/Sxjb5YZ+DmyTDKzasfvjfThWnTwUEz0lZz5KbNvFTu8sHqteY7AOg/GacGPSgjUfiK52LVzdXb/G/PqcUD4K7OawAAAABJRU5ErkJggg==",Y="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAGAAAAABAAAAYAAAAAEAAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAAAGNdRzso9yOwAAAKBJREFUOE+tk8kVhCAQRH+bAjlwJQiCMFkNwqs5EEPPAZjBsUWfWieW+vW6WQDAa8DrhFfHmby64g0AUgYz4IAFiKyS/jkocPYGIAFR8DoBsbHZIVu4ah6AsUBVuaK2HRtegFFODLUye2+VlAPohmCsfVv8BXAY0mp3PtsAuiE7GGBoJ3f0Ygs2fPEQj+EL19iDa6kdz+On/Pgz1Y3b3/kDyIdp/wyb82kAAAAASUVORK5CYII=",Q="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAPJ2AQDoAwAA8nYBAOgDAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAABc7WH6CeiquwAAALtJREFUOE+lk0EKgzAURJ9CF3oaW+/U3qi04l0UPEXrovQaFjJdmEoMCVH6YDbD/G8mKngIKsFV8BBMVg/rVX5+QVAIbgIjUERGcBcUoeE+MBBTv1pin+yHUmp+w1Xi2DEZwSkHzkDmNNpKBlywN+xv36pnJpiAg79+I5/cd/aSAy/f3ME7Bzrf3UGH4PjHa6xh/haaQCCldjmHoBQMgVBMg6B0qixL2kQdYzPrYRdBbSuNzu88Wm/u7PAFNJURMyUkb5IAAAAASUVORK5CYII=";function S(n,e){return Object.fromEntries(n.map(t=>[t,e(t)]))}function _(n,e){return(n%e+e)%e}function k(n){const e=[0,1],t=[1,0],r=[1,0],i=l();n.forEach(A=>{const s=A.type=="zero"?t:r;u(i,e,A.pos),T(s,s,i)});const o=l();return j(o,t,r),1/b(o)}function T(n,[e,t],[r,i]){m(n,[e*r-t*i,t*r+e*i])}function j(n,e,t){T(n,e,[t[0],-t[1]]),h(n,n,1/N(t,t))}function y(n,e,t,r,i){const o=C(n,n.VERTEX_SHADER,e),A=C(n,n.FRAGMENT_SHADER,t);if(o===null||A===null)return null;const s=n.createProgram();return n.attachShader(s,o),n.attachShader(s,A),n.linkProgram(s),n.getProgramParameter(s,n.LINK_STATUS)?{program:s,attribLocations:S(r,a=>n.getAttribLocation(s,a)),uniformLocations:S(i,a=>n.getUniformLocation(s,a))}:(alert(`Unable to initialize the shader program: ${n.getProgramInfoLog(s)}`),null)}function C(n,e,t){const r=n.createShader(e);return n.shaderSource(r,t),n.compileShader(r),n.getShaderParameter(r,n.COMPILE_STATUS)?r:(alert(`An error occurred compiling the shaders: ${n.getShaderInfoLog(r)}`),n.deleteShader(r),null)}const D={allPass:{flipType:!0,toVirtual:n=>{const e=[0,0];return m(e,n),h(e,e,1/N(e,e)),e}},complement:{flipType:!1,toVirtual:([n,e])=>[n,-e]}};function K(n,e,t){var{flipType:r,toVirtual:i,fromVirtual:o}=D[t];const A=r?e.type=="zero"?"pole":"zero":e.type;o===void 0&&(o=i);var s=[];if("fromVirtual"in e){const c=o;o=f=>e.fromVirtual(c(f)),n=e.index,s=e.history}const a={...e.relations};return a[t]=!1,{pos:i(e.pos),type:A,index:n,fromVirtual:o,relations:a,history:[...s,t]}}function F(n,e){n.querySelectorAll("[data-selection]").forEach(t=>e(t,t.getAttribute("data-selection").split(":").reverse()))}function V(n){const e=n.press.ind;if(e==-1){n.selectionWindow.hidden=!0;return}const t=n.virtualPoints[e],r={real:t.pos[0],imag:t.pos[1],radius:b(t.pos),angle:180/Math.PI*Math.atan2(t.pos[1],t.pos[0])};F(n.selectionWindow,(i,[o,A])=>{if(o=="number")document.activeElement!==i&&(i.value=r[A].toString());else if(o=="relation"){const s="fromVirtual"in t?n.points[t.index]:t;A in s.relations?(i.indeterminate=!1,i.checked=s.relations[A]):i.indeterminate=!0}}),n.selectionWindow.hidden=!1}function H(n){const e={};function t(A){n.movePoint(n.press.ind,A),n.drawScene()}const r=()=>{const A=Number.parseFloat(e.real.value),s=Number.parseFloat(e.imag.value);Number.isNaN(A)||Number.isNaN(s)||t([A,s])},i=()=>{const A=Number.parseFloat(e.radius.value);var s=Number.parseFloat(e.angle.value);if(Number.isNaN(A)||Number.isNaN(s))return;s=Math.PI*s/180;const a=[Math.cos(s),Math.sin(s)];h(a,a,A),t(a)},o=A=>s=>{const a=s.target,c=n.virtualPoints[n.press.ind],f=n.points["fromVirtual"in c?c.index:n.press.ind];var d;A in f.relations?d=f.relations[A]?1:0:d=2,d=(d+1)%3,d==2?(a.indeterminate=!0,delete f.relations[A]):d==1?a.checked=f.relations[A]=!0:a.checked=f.relations[A]=!1,"fromVirtual"in c&&(!n.getRelation(f,A)&&c.history.indexOf(A)!==-1?(n.press.ind=-1,n.selectionWindow.hidden=!0):n.recoverIndex()),n.drawScene()};n.selectionWindow=document.getElementById("selected_point_window"),F(n.selectionWindow,(A,[s,a])=>{if(e[a]=A,s=="number")a=="real"||a=="imag"?A.oninput=r:(a=="radius"||a=="angle")&&(A.oninput=i);else if(s=="relation")A.onclick=o(a);else if(s=="button"){const c=A;a=="delete"?c.onclick=()=>n.deleteSelectedPoint():a=="jump"&&(c.onclick=()=>n.jumpToSelectedPoint())}})}class Z{constructor(e){this.defaultRelations={},this.ctx=e,this.lastFactor=e.factor,this.factorSlider=document.getElementById("scale_slider"),this.factorText=document.getElementById("scale_input"),this.factorNorm=document.getElementById("scale_norm"),this.factorSlider.addEventListener("input",()=>{this.factorNorm.checked=!1,e.factor=Math.pow(2,this.factorSlider.valueAsNumber)}),this.factorText.onbeforeinput=t=>{const r=/\./.test(t.target.value);var i=t.data===null||!r&&t.data=="."||/\d/.test(t.data);i||t.preventDefault()},this.factorText.oninput=t=>{const r=Number.parseFloat(this.factorText.value);Number.isNaN(r)||(t!==null&&(this.factorNorm.checked=!1),e.factor=r)},this.factorNorm.onclick=()=>{e.drawScene()},this.factorText.oninput(null),F(document.getElementById("settings_window"),(t,[r,i])=>{r=="relation"&&(t.onclick=()=>{this.defaultRelations[i]=t.checked,e.recoverIndex(),e.drawScene()},this.defaultRelations[i]=t.checked)})}update(){this.lastFactor!=this.ctx.factor&&(document.activeElement!==this.factorSlider&&(this.factorSlider.value=this.ctx.factor===0?this.factorSlider.min:Math.log2(this.ctx.factor).toString()),document.activeElement!==this.factorText&&(this.factorText.value=this.ctx.factor.toString()),this.lastFactor=this.ctx.factor)}}const E={};function J(n,e){if(e in E)return E[e];const t=n.gl,r=t.createTexture();t.bindTexture(t.TEXTURE_2D,r);const i=1,o=1,A=new Uint8Array([255,0,255,255]);t.texImage2D(t.TEXTURE_2D,0,t.RGBA,i,o,0,t.RGBA,t.UNSIGNED_BYTE,A);const s=new Image;return s.onload=()=>{t.bindTexture(t.TEXTURE_2D,r),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,s)},t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),s.src=e,E[e]=r,r}function P(n,e,t,r){const i=n.gl,o=J(n,t),A=n.virtualPoints.filter(e).map(a=>a.pos);if(A.length==0)return;r===void 0&&(r=10);const s=n.shaderPrograms.scatter;i.useProgram(s.program),i.bindBuffer(i.ARRAY_BUFFER,n.buffers.points),i.bufferData(i.ARRAY_BUFFER,new Float32Array(A.flat()),i.STATIC_DRAW),i.enableVertexAttribArray(s.attribLocations.vPos),i.vertexAttribPointer(s.attribLocations.vPos,2,i.FLOAT,!1,0,0),i.uniform2fv(s.uniformLocations.uViewCorner0,n.viewFrame.corner0),i.uniform2fv(s.uniformLocations.uViewCorner1,n.viewFrame.corner1),i.uniform1f(s.uniformLocations.uRadius,r),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,o),i.uniform1i(s.uniformLocations.uSampler,0),i.drawArrays(i.POINTS,0,A.length)}function X(n){const e=n.gl,t=n.shaderPrograms.zTransform;e.useProgram(t.program);const r=n.virtualPoints.filter(o=>o.type=="zero").map(o=>o.pos),i=n.virtualPoints.filter(o=>o.type=="pole").map(o=>o.pos);r.length>0&&e.uniform2fv(t.uniformLocations.uZeros,r.flat()),i.length>0&&e.uniform2fv(t.uniformLocations.uPoles,i.flat()),e.uniform1i(t.uniformLocations.uNumZeros,r.length),e.uniform1i(t.uniformLocations.uNumPoles,i.length),e.uniform1f(t.uniformLocations.uFactor,n.factor),e.uniform2fv(t.uniformLocations.uViewCorner0,n.viewFrame.corner0),e.uniform2fv(t.uniformLocations.uViewCorner1,n.viewFrame.corner1),e.uniform1i(t.uniformLocations.uDisplayFunc,n.displayFunction),e.drawArrays(e.TRIANGLE_STRIP,0,4)}const q=[],$=["uZeros","uPoles","uNumZeros","uNumPoles","uFactor","uViewCorner0","uViewCorner1","uDisplayFunc"],ee=["vPos"],te=["uSampler","uViewCorner0","uViewCorner1","uRadius"],ne=["points"];class re{constructor(e){this.gl=null,this.points=[],this.virtualPoints=[],this.displayFunction=0,this.settingsWindow=null,this.#e=!1,this.#t=1,this.canvas=e,e.ctx=this,e.width=window.innerWidth,e.height=window.innerHeight,this.press=new ie(e),H(this),this.settingsWindow=new Z(this);const t=e.getContext("webgl2",{alpha:!1,premultipliedAlpha:!1});if(t===null){alert("Unable to initialize WebGL. Your browser or machine may not support it.");return}this.gl=t,this.viewFrame=new oe(e),this.shaderPrograms={zTransform:y(t,O,W,q,$),scatter:y(t,M,G,ee,te)},this.buffers=S(ne,()=>t.createBuffer())}#e;#t;get factor(){return this.#t}set factor(e){this.#t=e,this.settingsWindow!==null&&this.settingsWindow.update(),this.drawScene()}updateVirtualPoints(){this.virtualPoints=this.points.map((t,r)=>({...t})),this.virtualPoints.length*4;for(const t of Object.keys(D))for(var e=0;e<this.virtualPoints.length;e++)this.getRelation(this.virtualPoints[e],t)&&this.virtualPoints.push(K(e,this.virtualPoints[e],t))}movePoint(e,t){const r=this.virtualPoints[e];"fromVirtual"in r?(t=r.fromVirtual(t),m(this.points[r.index].pos,t)):m(this.points[e].pos,t)}deleteSelectedPoint(){if(this.press.ind===-1)return;const e=this.virtualPoints[this.press.ind],t="fromVirtual"in e?e.index:this.press.ind;this.points.splice(t,1),this.press.ind=-1,this.selectionWindow.hidden=!0,this.drawScene()}jumpToSelectedPoint(){if(this.press.ind===-1)return;const e=this.virtualPoints[this.press.ind];m(this.viewFrame.center,e.pos),this.drawScene()}drawScene(){if(this.#e||this.gl===null)return;this.#e=!0,this.updateVirtualPoints(),this.settingsWindow.factorNorm.checked&&(this.factor=k(this.virtualPoints)),V(this);const e=this.gl;e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),X(this),P(this,(t,r)=>r===this.press.ind,x,20),P(this,t=>t.type=="pole",Y),P(this,t=>t.type=="zero",Q),this.#e=!1,e.flush()}getRelation(e,t){return(t in e.relations?e.relations:this.settingsWindow.defaultRelations)[t]}recoverIndex(){if(this.press.ind==-1)return;const e=this.press.ind,t=this.virtualPoints[e];this.updateVirtualPoints(),"fromVirtual"in t&&(this.press.ind=this.virtualPoints.findIndex(r=>"fromVirtual"in r&&r.index===t.index&&JSON.stringify(r.history)==JSON.stringify(t.history)),this.press.ind===-1&&(this.selectionWindow.hidden=!0))}}class ie{constructor(e){this.isDown=!1,this.ind=-1,this.element=-1,this.mouse=l(),this.canvas=e}update(e,t){this.isDown=!0,this.element=e,this.mouse=t}}class oe{constructor(e,t,r,i){this.canvas=e,r?this.aspect=r:this.calculateAspect(),this.center=t||[0,0],this.size=i||1}calculateAspect(){var e=this.canvas.width,t=this.canvas.height,r=Math.min(e,t)/2/1.2;e/=r,t/=r,this.aspect=[e/2,t/2]}get corner0(){const e=[0,0];return h(e,this.aspect,this.size),u(e,this.center,e),e}get corner1(){const e=l();return h(e,this.aspect,this.size),p(e,this.center,e),e}fromCanvasCoords(e){const t=[e[0],this.canvas.height-e[1]];w(t,t,[this.canvas.width,this.canvas.height]);const r=[0,0];return u(r,this.corner1,this.corner0),g(t,t,r),p(t,t,this.corner0),t}fromCanvasDelta(e){const t=[e[0],-e[1]];w(t,t,[this.canvas.width,this.canvas.height]);const r=l();return u(r,this.corner1,this.corner0),g(t,t,r),t}toCanvasCoords(e){const t=l();u(t,e,this.corner0);const r=l();return u(r,this.corner1,this.corner0),w(t,t,r),g(t,[t[0],1-t[1]],[this.canvas.width,this.canvas.height]),t}}function R(n,e){return z(n,e)<15}function se(){const n=document.getElementById("gl_canvas"),e=document.getElementsByClassName("sidebar-container").item(0),t=document.getElementById("info-button");t.onclick=()=>{t.toggleAttribute("data-toggle")};const r=new re(n);var i=!1;n.onmousedown=o=>{if(i=!1,o.shiftKey||o.ctrlKey||o.button!==0)return;const A=[o.x,o.y],s=r.virtualPoints.findIndex(a=>R(r.viewFrame.toCanvasCoords(a.pos),A));if(s!==-1){r.press.update(0,A),v(r,s);return}r.press.update(-1,A)},n.onmousemove=o=>{if(i=!0,!r.press.isDown)return;const A=[o.x,o.y],s=l();u(s,A,r.press.mouse);const a=r.viewFrame.fromCanvasDelta(s);switch(r.press.element){case-1:u(r.viewFrame.center,r.viewFrame.center,a);break;case 0:const c=[0,0];p(c,r.virtualPoints[r.press.ind].pos,a),r.movePoint(r.press.ind,c);break}r.press.mouse=A,r.drawScene()},n.onmouseleave=n.onmouseup=()=>{r.press.isDown=!1},n.onclick=o=>{const A=r.viewFrame.fromCanvasCoords([o.x,o.y]);o.shiftKey?(r.points.push({pos:A,type:"pole",relations:{}}),v(r,r.points.length-1)):o.ctrlKey?(r.points.push({pos:A,type:"zero",relations:{}}),v(r,r.points.length-1)):i||r.virtualPoints.findIndex(a=>R(r.viewFrame.toCanvasCoords(a.pos),[o.x,o.y]))===-1&&(r.selectionWindow.hidden=!0,r.press.ind=-1),r.drawScene()},n.onwheel=o=>{const A=Math.pow(2,10*o.deltaY/n.height),s=r.viewFrame.fromCanvasCoords([o.x,o.y]);u(r.viewFrame.center,r.viewFrame.center,s),h(r.viewFrame.center,r.viewFrame.center,A),p(r.viewFrame.center,r.viewFrame.center,s),r.viewFrame.size*=A,r.drawScene(),o.preventDefault()},window.addEventListener("keydown",o=>{switch(o.key=="Escape"&&document.activeElement.blur(),o.key.toLowerCase()){case"d":r.displayFunction=(r.displayFunction+1)%2;break;case"delete":if(e.contains(document.activeElement))return;r.deleteSelectedPoint();break;case"n":if(r.virtualPoints.length==0)return;const A=o.shiftKey?-1:1;v(r,_(r.press.ind+A,r.virtualPoints.length)),r.jumpToSelectedPoint();break;case"i":t.toggleAttribute("data-toggle");return;default:return}o.preventDefault(),r.drawScene()}),window.onresize=()=>{n.width=window.innerWidth,n.height=window.innerHeight,r.viewFrame.calculateAspect(),r.gl.viewport(0,0,n.width,n.height),r.drawScene()},r.drawScene()}function v(n,e){n.press.ind=e,n.updateVirtualPoints(),V(n)}se();
