(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function t(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(o){if(o.ep)return;o.ep=!0;const r=t(o);fetch(o.href,r)}})();var F=typeof Float32Array<"u"?Float32Array:Array;function f(){var n=new F(2);return F!=Float32Array&&(n[0]=0,n[1]=0),n}function p(n,e){return n[0]=e[0],n[1]=e[1],n}function v(n,e,t){return n[0]=e[0]+t[0],n[1]=e[1]+t[1],n}function L(n,e,t){return n[0]=e[0]-t[0],n[1]=e[1]-t[1],n}function x(n,e,t){return n[0]=e[0]*t[0],n[1]=e[1]*t[1],n}function z(n,e,t){return n[0]=e[0]/t[0],n[1]=e[1]/t[1],n}function h(n,e,t){return n[0]=e[0]*t,n[1]=e[1]*t,n}function M(n,e){var t=e[0]-n[0],i=e[1]-n[1];return Math.sqrt(t*t+i*i)}function N(n){var e=n[0],t=n[1];return Math.sqrt(e*e+t*t)}function D(n,e){return n[0]*e[0]+n[1]*e[1]}var d=L,E=x,S=z;(function(){var n=f();return function(e,t,i,o,r,s){var a,A;for(t||(t=2),i||(i=0),o?A=Math.min(o*t+i,e.length):A=e.length,a=i;a<A;a+=t)n[0]=e[a],n[1]=e[a+1],r(n,n,s),e[a]=n[0],e[a+1]=n[1];return e}})();const W=`#version 300 es
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
}`,k=`#version 300 es
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
}`,O=`#version 300 es
precision mediump float;

uniform vec2 uViewCorner0;
uniform vec2 uViewCorner1;
uniform float uRadius;

in vec2 vPos;

void main() {
    vec2 uv = (vPos - uViewCorner0) / (uViewCorner1 - uViewCorner0);
    gl_Position = vec4(uv * 2. - 1., 0, 1);
    gl_PointSize = uRadius;
}`,Y="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAPJ2AQDoAwAA8nYBAOgDAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAABc7WH6CeiquwAAAcJJREFUOE9l0/1OW0cQBfDfuQYrfNnFlEIRTft6zgOFvF4aCiofRhRjaqu5kz/uUpF2pdXurGbOzhydE/9Z9cm2sodddO15XazDMnP92/y8DeqjQzHFBO+wjR4bvGCFh8w9/g+gLvxUHIVDZSL2ilFLWFeslGW4Ve7zwcO/APXRrOI0nGCmzLCrM1Y6rJXHikW4wy2uMrfs6sK4YhqOlB9xKk7FufIev+C84ixxguN67RKdsh+mYiJmmOGs+BW/tfNUHOsdYZo4EJO6cNA1ssZ6u435Q/zQxjlPnBU/p8zEBPt6O9jBuBPb2BKjGsB2in1M8V7vJEO814reiTG2lFGHqkgNdPeiQolSetFhhNLe61UfGQA2yteUPgPbKzwrj+Iz/lDumw5eqqwz3Df4p8Mmg0CWbT/iTrnGF1zq3FQs8BSeK17wN567VvSEv/DQfruruBS/47Nymd5VxT0WKUuxzNyqy9wGC9xU3OpcF5cZWv/SuriquE75E/fFQj/I+a2Uj5VDcVyx1/Sxjb5YZ+DmyTDKzasfvjfThWnTwUEz0lZz5KbNvFTu8sHqteY7AOg/GacGPSgjUfiK52LVzdXb/G/PqcUD4K7OawAAAABJRU5ErkJggg==",Q="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAGAAAAABAAAAYAAAAAEAAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAAAGNdRzso9yOwAAAKBJREFUOE+tk8kVhCAQRH+bAjlwJQiCMFkNwqs5EEPPAZjBsUWfWieW+vW6WQDAa8DrhFfHmby64g0AUgYz4IAFiKyS/jkocPYGIAFR8DoBsbHZIVu4ah6AsUBVuaK2HRtegFFODLUye2+VlAPohmCsfVv8BXAY0mp3PtsAuiE7GGBoJ3f0Ygs2fPEQj+EL19iDa6kdz+On/Pgz1Y3b3/kDyIdp/wyb82kAAAAASUVORK5CYII=",_="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMTGKCBbOAAAAuGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABEAAABaAAAAaYcEAAEAAABsAAAAAAAAAPJ2AQDoAwAA8nYBAOgDAABQYWludC5ORVQgNS4xLjExAAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlgAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAABc7WH6CeiquwAAALtJREFUOE+lk0EKgzAURJ9CF3oaW+/U3qi04l0UPEXrovQaFjJdmEoMCVH6YDbD/G8mKngIKsFV8BBMVg/rVX5+QVAIbgIjUERGcBcUoeE+MBBTv1pin+yHUmp+w1Xi2DEZwSkHzkDmNNpKBlywN+xv36pnJpiAg79+I5/cd/aSAy/f3ME7Bzrf3UGH4PjHa6xh/haaQCCldjmHoBQMgVBMg6B0qixL2kQdYzPrYRdBbSuNzu88Wm/u7PAFNJURMyUkb5IAAAAASUVORK5CYII=";function y(n,e){return Object.fromEntries(n.map(t=>[t,e(t)]))}function j(n,e){return(n%e+e)%e}function K(n){const e=[0,1],t=[1,0],i=[1,0],o=f();n.forEach(s=>{const a=s.type=="zero"?t:i;d(o,e,s.pos),V(a,a,o)});const r=f();return H(r,t,i),1/N(r)}function V(n,[e,t],[i,o]){p(n,[e*i-t*o,t*i+e*o])}function H(n,e,t){V(n,e,[t[0],-t[1]]),h(n,n,1/D(t,t))}function R(n,e,t,i,o){const r=b(n,n.VERTEX_SHADER,e),s=b(n,n.FRAGMENT_SHADER,t);if(r===null||s===null)return null;const a=n.createProgram();return n.attachShader(a,r),n.attachShader(a,s),n.linkProgram(a),n.getProgramParameter(a,n.LINK_STATUS)?{program:a,attribLocations:y(i,A=>n.getAttribLocation(a,A)),uniformLocations:y(o,A=>n.getUniformLocation(a,A))}:(alert(`Unable to initialize the shader program: ${n.getProgramInfoLog(a)}`),null)}function b(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),n.getShaderParameter(i,n.COMPILE_STATUS)?i:(alert(`An error occurred compiling the shaders: ${n.getShaderInfoLog(i)}`),n.deleteShader(i),null)}const U={allPass:{flipType:!0,toVirtual:n=>{const e=[0,0];return p(e,n),h(e,e,1/D(e,e)),e}},complement:{flipType:!1,toVirtual:([n,e])=>[n,-e]}};function Z(n,e,t){var{flipType:i,toVirtual:o,fromVirtual:r}=U[t];const s=i?e.type=="zero"?"pole":"zero":e.type;r===void 0&&(r=o);var a=[];if("fromVirtual"in e){const l=r;r=u=>e.fromVirtual(l(u)),n=e.index,a=e.history}const A={...e.relations};return A[t]=!1,{pos:o(e.pos),type:s,index:n,fromVirtual:r,relations:A,history:[...a,t]}}function B(n,e){n.querySelectorAll("[data-selection]").forEach(t=>e(t,t.getAttribute("data-selection").split(":").reverse()))}function I(n){const e=n.press.ind;if(e==-1){n.selectionWindow.hidden=!0;return}const t=n.virtualPoints[e],i={real:t.pos[0],imag:t.pos[1],radius:N(t.pos),angle:180/Math.PI*Math.atan2(t.pos[1],t.pos[0])};B(n.selectionWindow,(o,[r,s])=>{if(r=="number")document.activeElement!==o&&(o.value=i[s].toString());else if(r=="relation"){const a="fromVirtual"in t?n.points[t.index]:t;s in a.relations?(o.indeterminate=!1,o.checked=a.relations[s]):o.indeterminate=!0}}),n.selectionWindow.hidden=!1}function J(n){const e={};function t(s){n.movePoint(n.press.ind,s),n.drawScene()}const i=()=>{const s=Number.parseFloat(e.real.value),a=Number.parseFloat(e.imag.value);Number.isNaN(s)||Number.isNaN(a)||t([s,a])},o=()=>{const s=Number.parseFloat(e.radius.value);var a=Number.parseFloat(e.angle.value);if(Number.isNaN(s)||Number.isNaN(a))return;a=Math.PI*a/180;const A=[Math.cos(a),Math.sin(a)];h(A,A,s),t(A)},r=s=>a=>{const A=a.target,l=n.virtualPoints[n.press.ind],u=n.points["fromVirtual"in l?l.index:n.press.ind];var c;s in u.relations?c=u.relations[s]?1:0:c=2,c=(c+1)%3,c==2?(A.indeterminate=!0,delete u.relations[s]):c==1?A.checked=u.relations[s]=!0:A.checked=u.relations[s]=!1,"fromVirtual"in l&&(!n.getRelation(u,s)&&l.history.indexOf(s)!==-1?(n.press.ind=-1,n.selectionWindow.hidden=!0):n.recoverIndex()),n.drawScene()};n.selectionWindow=document.getElementById("selected_point_window"),B(n.selectionWindow,(s,[a,A])=>{if(e[A]=s,a=="number")A=="real"||A=="imag"?s.oninput=i:(A=="radius"||A=="angle")&&(s.oninput=o);else if(a=="relation")s.onclick=r(A);else if(a=="button"){const l=s;A=="delete"?l.onclick=()=>n.deleteSelectedPoint():A=="jump"&&(l.onclick=()=>n.jumpToSelectedPoint())}})}class X{constructor(e){this.defaultRelations={},this.ctx=e,this.lastFactor=e.factor,this.factorSlider=document.getElementById("scale_slider"),this.factorText=document.getElementById("scale_input"),this.factorNorm=document.getElementById("scale_norm"),this.factorSlider.addEventListener("input",()=>{this.factorNorm.checked=!1,e.factor=Math.pow(2,this.factorSlider.valueAsNumber)}),this.factorText.onbeforeinput=t=>{const i=/\./.test(t.target.value);var o=t.data===null||!i&&t.data=="."||/\d/.test(t.data);o||t.preventDefault()},this.factorText.oninput=t=>{const i=Number.parseFloat(this.factorText.value);Number.isNaN(i)||(t!==null&&(this.factorNorm.checked=!1),e.factor=i)},this.factorNorm.onclick=()=>{e.drawScene()},this.factorText.oninput(null),B(document.getElementById("settings_window"),(t,[i,o])=>{i=="relation"&&(t.onclick=()=>{this.defaultRelations[o]=t.checked,e.recoverIndex(),e.drawScene()},this.defaultRelations[o]=t.checked)})}update(){this.lastFactor!=this.ctx.factor&&(document.activeElement!==this.factorSlider&&(this.factorSlider.value=this.ctx.factor===0?this.factorSlider.min:Math.log2(this.ctx.factor).toString()),document.activeElement!==this.factorText&&(this.factorText.value=this.ctx.factor.toString()),this.lastFactor=this.ctx.factor)}}class q{constructor(){this.state="none",this.infoButton=document.getElementById("info-button"),this.infoText=document.getElementById("info-text"),this.legendButton=document.getElementById("color-legend-button"),this.legendBox=document.getElementById("color-legend-box"),this.legendCanvas=document.getElementById("color-legend-canvas"),this.infoButton.onclick=()=>this.toggleState("info"),this.legendButton.onclick=()=>this.toggleState("colorLegend"),this.legendCanvasCtx=this.legendCanvas.getContext("2d")}toggleState(e){if(this.infoText.hidden=!0,this.legendBox.hidden=!0,this.state==e){this.state="none";return}switch(this.state=e,e){case"info":this.infoText.hidden=!1;break;case"colorLegend":this.legendBox.hidden=!1;break}}updateDisplayFunction(e){const o=this.legendCanvas.width,r=this.legendCanvas.height,s=this.legendCanvasCtx;s.clearRect(0,0,o,r);const a=s.createLinearGradient(0,r-10,0,10);e===0?(a.addColorStop(0,"#0000ff"),a.addColorStop(.5,"#ffffff"),a.addColorStop(1,"#ff0000")):(e===1||e>1)&&(a.addColorStop(0,"#ff0000"),a.addColorStop(1/6,"#ffff00"),a.addColorStop(2/6,"#00ff00"),a.addColorStop(3/6,"#00ffff"),a.addColorStop(4/6,"#0000ff"),a.addColorStop(5/6,"#ff00ff"),a.addColorStop(1,"#ff0000")),s.fillStyle=a,s.fillRect(0,10,25,r-20);const A=[];if(e===0){for(let c=0;c<=10;c++){const m=c/10,w=Math.sqrt(m);A.push([m*.5,w.toFixed(2)])}for(let c=1;c<=10;c++){const m=c/10,w=1/Math.sqrt(1-m);A.push([.5+.5*m,w.toFixed(2)])}}else(e===1||e>1)&&(A.push([0,"-π"]),A.push([1/12,"-5/6 π"]),A.push([1/6,"-2/3 π"]),A.push([.25,"-1/2 π"]),A.push([1/3,"-1/3 π"]),A.push([5/12,"-1/6 π"]),A.push([.5,"0"]),A.push([7/12,"+1/6 π"]),A.push([2/3,"+1/3 π"]),A.push([.75,"+1/2 π"]),A.push([5/6,"+2/3 π"]),A.push([11/12,"+5/6 π"]),A.push([1,"+π"]));s.lineWidth=1,s.strokeStyle="#000000",s.fillStyle="black",s.textBaseline="middle";for(var[l,u]of A){const c=Math.floor(r-10-.5+(20-r+1)*l)+.5;s.beginPath(),s.moveTo(25,c),s.lineTo(30,c),s.stroke(),s.fillText(u,33,c)}}}const P={};function $(n,e){if(e in P)return P[e];const t=n.gl,i=t.createTexture();t.bindTexture(t.TEXTURE_2D,i);const o=1,r=1,s=new Uint8Array([255,0,255,255]);t.texImage2D(t.TEXTURE_2D,0,t.RGBA,o,r,0,t.RGBA,t.UNSIGNED_BYTE,s);const a=new Image;return a.onload=()=>{t.bindTexture(t.TEXTURE_2D,i),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,a)},t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),a.src=e,P[e]=i,i}function C(n,e,t,i){const o=n.gl,r=$(n,t),s=n.virtualPoints.filter(e).map(A=>A.pos);if(s.length==0)return;i===void 0&&(i=10);const a=n.shaderPrograms.scatter;o.useProgram(a.program),o.bindBuffer(o.ARRAY_BUFFER,n.buffers.points),o.bufferData(o.ARRAY_BUFFER,new Float32Array(s.flat()),o.STATIC_DRAW),o.enableVertexAttribArray(a.attribLocations.vPos),o.vertexAttribPointer(a.attribLocations.vPos,2,o.FLOAT,!1,0,0),o.uniform2fv(a.uniformLocations.uViewCorner0,n.viewFrame.corner0),o.uniform2fv(a.uniformLocations.uViewCorner1,n.viewFrame.corner1),o.uniform1f(a.uniformLocations.uRadius,i),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,r),o.uniform1i(a.uniformLocations.uSampler,0),o.drawArrays(o.POINTS,0,s.length)}function ee(n){const e=n.gl,t=n.shaderPrograms.zTransform;e.useProgram(t.program);const i=n.virtualPoints.filter(r=>r.type=="zero").map(r=>r.pos),o=n.virtualPoints.filter(r=>r.type=="pole").map(r=>r.pos);i.length>0&&e.uniform2fv(t.uniformLocations.uZeros,i.flat()),o.length>0&&e.uniform2fv(t.uniformLocations.uPoles,o.flat()),e.uniform1i(t.uniformLocations.uNumZeros,i.length),e.uniform1i(t.uniformLocations.uNumPoles,o.length),e.uniform1f(t.uniformLocations.uFactor,n.factor),e.uniform2fv(t.uniformLocations.uViewCorner0,n.viewFrame.corner0),e.uniform2fv(t.uniformLocations.uViewCorner1,n.viewFrame.corner1),e.uniform1i(t.uniformLocations.uDisplayFunc,n.displayFunction),e.drawArrays(e.TRIANGLE_STRIP,0,4)}const te=[],ne=["uZeros","uPoles","uNumZeros","uNumPoles","uFactor","uViewCorner0","uViewCorner1","uDisplayFunc"],ie=["vPos"],oe=["uSampler","uViewCorner0","uViewCorner1","uRadius"],re=["points"];class se{constructor(e,t){this.gl=null,this.points=[],this.virtualPoints=[],this.settingsWindow=null,this.#e=!1,this.#t=1,this.canvas=e,this.infoMenu=t,this.displayFunction=0,e.ctx=this,e.width=window.innerWidth,e.height=window.innerHeight,this.press=new ae(e),J(this),this.settingsWindow=new X(this);const i=e.getContext("webgl2",{alpha:!1,premultipliedAlpha:!1});if(i===null){alert("Unable to initialize WebGL. Your browser or machine may not support it.");return}this.gl=i,this.viewFrame=new Ae(e),this.shaderPrograms={zTransform:R(i,W,k,te,ne),scatter:R(i,O,G,ie,oe)},this.buffers=y(re,()=>i.createBuffer())}#n;#e;#t;get displayFunction(){return this.#n}set displayFunction(e){this.#n=e,this.infoMenu.updateDisplayFunction(e)}get factor(){return this.#t}set factor(e){this.#t=e,this.settingsWindow!==null&&this.settingsWindow.update(),this.drawScene()}updateVirtualPoints(){this.virtualPoints=this.points.map((t,i)=>({...t})),this.virtualPoints.length*4;for(const t of Object.keys(U))for(var e=0;e<this.virtualPoints.length;e++)this.getRelation(this.virtualPoints[e],t)&&this.virtualPoints.push(Z(e,this.virtualPoints[e],t))}movePoint(e,t){const i=this.virtualPoints[e];"fromVirtual"in i?(t=i.fromVirtual(t),p(this.points[i.index].pos,t)):p(this.points[e].pos,t)}getSelectedRootPoint(){if(this.press.ind===-1)return-1;const e=this.virtualPoints[this.press.ind];return"fromVirtual"in e?e.index:this.press.ind}deleteSelectedPoint(){const e=this.getSelectedRootPoint();e!==-1&&(this.points.splice(e,1),this.press.ind=-1,this.selectionWindow.hidden=!0,this.drawScene())}toggleSelectedPoint(){const e=this.getSelectedRootPoint();if(e===-1)return;const t=this.points[e];t.type=t.type=="pole"?"zero":t.type=="zero"?"pole":t.type}jumpToSelectedPoint(){if(this.press.ind===-1)return;const e=this.virtualPoints[this.press.ind];p(this.viewFrame.center,e.pos),this.drawScene()}drawScene(){if(this.#e||this.gl===null)return;this.#e=!0,this.updateVirtualPoints(),this.settingsWindow.factorNorm.checked&&(this.factor=K(this.virtualPoints)),I(this);const e=this.gl;e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),ee(this),C(this,(t,i)=>i===this.press.ind,Y,20),C(this,t=>t.type=="pole",Q),C(this,t=>t.type=="zero",_),this.#e=!1,e.flush()}getRelation(e,t){return(t in e.relations?e.relations:this.settingsWindow.defaultRelations)[t]}recoverIndex(){if(this.press.ind==-1)return;const e=this.press.ind,t=this.virtualPoints[e];this.updateVirtualPoints(),"fromVirtual"in t&&(this.press.ind=this.virtualPoints.findIndex(i=>"fromVirtual"in i&&i.index===t.index&&JSON.stringify(i.history)==JSON.stringify(t.history)),this.press.ind===-1&&(this.selectionWindow.hidden=!0))}}class ae{constructor(e){this.isDown=!1,this.ind=-1,this.element=-1,this.mouse=f(),this.canvas=e}update(e,t){this.isDown=!0,this.element=e,this.mouse=t}}class Ae{constructor(e,t,i,o){this.canvas=e,i?this.aspect=i:this.calculateAspect(),this.center=t||[0,0],this.size=o||1}calculateAspect(){var e=this.canvas.width,t=this.canvas.height,i=Math.min(e,t)/2/1.2;e/=i,t/=i,this.aspect=[e/2,t/2]}get corner0(){const e=[0,0];return h(e,this.aspect,this.size),d(e,this.center,e),e}get corner1(){const e=f();return h(e,this.aspect,this.size),v(e,this.center,e),e}fromCanvasCoords(e){const t=[e[0],this.canvas.height-e[1]];S(t,t,[this.canvas.width,this.canvas.height]);const i=[0,0];return d(i,this.corner1,this.corner0),E(t,t,i),v(t,t,this.corner0),t}fromCanvasDelta(e){const t=[e[0],-e[1]];S(t,t,[this.canvas.width,this.canvas.height]);const i=f();return d(i,this.corner1,this.corner0),E(t,t,i),t}toCanvasCoords(e){const t=f();d(t,e,this.corner0);const i=f();return d(i,this.corner1,this.corner0),S(t,t,i),E(t,[t[0],1-t[1]],[this.canvas.width,this.canvas.height]),t}}function T(n,e){return M(n,e)<15}function ce(){const n=document.getElementById("gl_canvas"),e=document.getElementsByClassName("sidebar-container").item(0),t=new q,i=new se(n,t);var o=!1;n.onmousedown=r=>{if(o=!1,r.shiftKey||r.ctrlKey||r.button!==0)return;const s=[r.x,r.y],a=i.virtualPoints.findIndex(A=>T(i.viewFrame.toCanvasCoords(A.pos),s));if(a!==-1){i.press.update(0,s),g(i,a);return}i.press.update(-1,s)},n.onmousemove=r=>{if(o=!0,!i.press.isDown)return;const s=[r.x,r.y],a=f();d(a,s,i.press.mouse);const A=i.viewFrame.fromCanvasDelta(a);switch(i.press.element){case-1:d(i.viewFrame.center,i.viewFrame.center,A);break;case 0:const l=[0,0];v(l,i.virtualPoints[i.press.ind].pos,A),i.movePoint(i.press.ind,l);break}i.press.mouse=s,i.drawScene()},n.onmouseleave=n.onmouseup=()=>{i.press.isDown=!1},n.onclick=r=>{const s=i.viewFrame.fromCanvasCoords([r.x,r.y]);r.shiftKey?(i.points.push({pos:s,type:"pole",relations:{}}),g(i,i.points.length-1)):r.ctrlKey?(i.points.push({pos:s,type:"zero",relations:{}}),g(i,i.points.length-1)):o||i.virtualPoints.findIndex(A=>T(i.viewFrame.toCanvasCoords(A.pos),[r.x,r.y]))===-1&&(i.selectionWindow.hidden=!0,i.press.ind=-1),i.drawScene()},n.onwheel=r=>{const s=Math.pow(2,10*r.deltaY/n.height),a=i.viewFrame.fromCanvasCoords([r.x,r.y]);d(i.viewFrame.center,i.viewFrame.center,a),h(i.viewFrame.center,i.viewFrame.center,s),v(i.viewFrame.center,i.viewFrame.center,a),i.viewFrame.size*=s,i.drawScene(),r.preventDefault()},window.addEventListener("keydown",r=>{switch(r.key=="Escape"&&document.activeElement.blur(),r.key.toLowerCase()){case"d":i.displayFunction=(i.displayFunction+1)%2;break;case"delete":if(e.contains(document.activeElement))return;i.deleteSelectedPoint();break;case"t":if(e.contains(document.activeElement))return;i.toggleSelectedPoint();break;case"n":if(i.virtualPoints.length==0)return;const s=r.shiftKey?-1:1;g(i,j(i.press.ind+s,i.virtualPoints.length)),i.jumpToSelectedPoint();break;case"i":t.toggleState("info");return;case"l":t.toggleState("colorLegend");return;default:return}r.preventDefault(),i.drawScene()}),window.onresize=()=>{n.width=window.innerWidth,n.height=window.innerHeight,i.viewFrame.calculateAspect(),i.gl.viewport(0,0,n.width,n.height),i.drawScene()},i.drawScene()}function g(n,e){n.press.ind=e,n.updateVirtualPoints(),I(n)}ce();
