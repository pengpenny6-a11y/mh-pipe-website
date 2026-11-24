// Each sheet is typeset once at the display resolution. The fold deforms the
// photograph and the ink together, so the date stays registered to the page.
function cover(ctx, photo, box, position) {
  const [x,y,w,h] = box;
  const [px,py] = (position || '50% 50%').split(' ').map(v => parseFloat(v)/100);
  const scale = Math.max(w/photo.naturalWidth,h/photo.naturalHeight);
  const sw = w/scale, sh = h/scale;
  ctx.drawImage(photo,(photo.naturalWidth-sw)*px,(photo.naturalHeight-sh)*py,sw,sh,x,y,w,h);
}
function lines(ctx, value, width, lang) {
  const words = lang==='zh' ? [...value] : value.split(' ');
  const glue = lang==='zh' ? '' : ' ';
  const result = [];
  let line = '';
  for (const word of words) {
    const next = line ? line+glue+word : word;
    if (line && ctx.measureText(next).width > width) { result.push(line); line=word; }
    else line = next;
  }
  if (line) result.push(line);
  return result;
}
export function typesetMilestone(item, photo, lang, w, h, ratio) {
  const plate=document.createElement('canvas');
  plate.width=Math.round(w*ratio); plate.height=Math.round(h*ratio);
  const c=plate.getContext('2d');
  c.scale(ratio,ratio);
  const index=lang==='zh'?0:1, narrow=w<660, inset=w*(narrow?.055:.037);
  const x=narrow ? 0 : w*.294, photoHeight=narrow ? h*.81 : h;
  c.fillStyle='#f0ede5';c.fillRect(0,0,w,h);
  if (item.art) {
    const field=c.createLinearGradient(x,0,w,h);field.addColorStop(0,'#e4e9e4');field.addColorStop(.52,'#c0d3d7');field.addColorStop(1,'#7f9faa');
    c.fillStyle=field;c.fillRect(x,0,w-x,photoHeight);
    const scale=Math.min((w-x)*.73/photo.naturalWidth,photoHeight*.74/photo.naturalHeight);
    const iw=photo.naturalWidth*scale, ih=photo.naturalHeight*scale;
    c.drawImage(photo,x+(w-x-iw)*.68,(photoHeight-ih)*.49,iw,ih);
    c.fillStyle='#254254';c.font='550 '+Math.max(15,w*.014)+'px Archivo, Arial, sans-serif';
    c.fillText('GB/T 33926–2017',x+(w-x)*.08,photoHeight*.12);
  } else cover(c,photo,[x,0,w-x,photoHeight],item.position);
  if (!narrow) {
    const shadow=c.createLinearGradient(x,0,x+(w-x)*.37,0);
    shadow.addColorStop(0,'rgba(17,29,33,.32)');shadow.addColorStop(1,'rgba(17,29,33,0)');
    c.fillStyle=shadow;c.fillRect(x,0,(w-x)*.37,h);
  }
  const year=item.year || (lang==='zh'?'今天':'Today');
  const size=narrow ? Math.min(w*.26,h*.33) : Math.min(w*.19,h*.55);
  const baseline=narrow ? h*.88 : h*.57;
  c.font=(item.year || lang!=='zh' ? '500 '+size+'px Baskerville, "Times New Roman", serif'
    : '600 '+(size*.71)+'px "PingFang SC", "Microsoft YaHei", sans-serif');
  c.fillStyle='#192e37';c.fillText(year,inset,baseline);
  // Reprint the same numerals in pale ink where they cross the photograph.
  c.save(); c.beginPath(); c.rect(x,0,w-x,photoHeight); c.clip();
  c.fillStyle='#fcf7e9';c.fillText(year,inset,baseline);c.restore();
  if (!narrow) {
    const titleSize=Math.min(34,Math.max(21,w*.022));
    c.font='600 '+titleSize+'px Archivo, "PingFang SC", "Microsoft YaHei", sans-serif';
    c.fillStyle='#20333a';
    lines(c,item.title[index],x-inset*1.35,lang).forEach((s,i)=>c.fillText(s,inset,h*.72+i*titleSize*1.22));
  }
  return plate;
}

const vertex = `
precision mediump float;
attribute vec2 unit;
uniform float progress, sheet, aspect;
varying vec2 uv;
varying float angle, crease;
void main() {
  uv=unit;
  float p=progress;
  float tilt=.14*sin(3.141593*p);
  crease=mix(1.,-.31,p)+(uv.y-.5)*tilt;
  float radius=.075+.047*sin(3.141593*p);
  float travel=max(0.,uv.x-crease);
  angle=sheet*min(3.141593,travel/radius);
  float z=radius*(1.-cos(angle));
  float x=uv.x;
  if(sheet>.5 && travel>0.) x=crease+radius*sin(angle)-max(0.,travel-3.141593*radius);
  float y=uv.y+(uv.y-.48)*z*.33+tilt*z/aspect;
  gl_Position=vec4(2.*x-1.,1.-2.*y,.65-sheet*.08-z*2.7,1.);
}`;
const fragment = `
precision mediump float;
uniform sampler2D imprint;
uniform float sheet, progress;
varying vec2 uv;
varying float angle, crease;
void main() {
  vec3 ink=texture2D(imprint,uv).rgb;
  if (sheet < .5) {
    float shadow=exp(-abs(uv.x-crease-.085)*19.)*.27*sin(3.14159*progress);
    ink*=1.-shadow;
  } else {
    float bend=sin(angle);
    vec3 back=mix(vec3(.924,.892,.829),ink,.085);
    ink=mix(ink,back,smoothstep(1.51,1.63,angle));
    ink*=1.-.19*bend*bend;
    float glint=(angle-.71)/.28;
    ink+=vec3(.11,.10,.084)*exp(-glint*glint);
  }
  gl_FragColor=vec4(ink,1.);
}`;

// A canvas-only device can still turn the same printed sheets with its pointer.
export function paintCanvasFold(ctx, base, turning, progress) {
  const w=base.width, h=base.height;
  const travel=Math.sin(Math.PI*progress), foldWidth=w*.12*travel;
  const edge=w*(1-progress), slant=w*.055*travel;
  ctx.drawImage(base,0,0,w,h);
  if(progress>=1)return;
  ctx.save();
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(edge+slant,0);
  ctx.quadraticCurveTo(edge+foldWidth*.32,h*.48,edge-slant,h);
  ctx.lineTo(0,h);ctx.closePath();ctx.clip();ctx.drawImage(turning,0,0,w,h);
  ctx.restore();
  if(foldWidth<1)return;
  ctx.save();ctx.translate(edge+slant,0);ctx.transform(1,0,-2*slant/h,1,0,0);
  const shadow=ctx.createLinearGradient(0,0,foldWidth*.6,0);
  shadow.addColorStop(0,'rgba(31,28,24,.35)');shadow.addColorStop(1,'rgba(31,28,24,0)');
  ctx.fillStyle=shadow;ctx.fillRect(0,0,foldWidth*.6,h);
  const back=ctx.createLinearGradient(-foldWidth,0,foldWidth*.18,0);
  back.addColorStop(0,'#c6bdb0');back.addColorStop(.26,'#eee9dc');back.addColorStop(.72,'#faf5ea');back.addColorStop(1,'#aba496');
  ctx.beginPath();ctx.moveTo(-foldWidth*.84,0);ctx.lineTo(0,0);
  ctx.quadraticCurveTo(foldWidth*.55,h*.48,0,h);
  ctx.lineTo(-foldWidth,h);ctx.quadraticCurveTo(-foldWidth*.6,h*.48,-foldWidth*.84,0);
  ctx.fillStyle=back;ctx.fill();ctx.restore();
}

export function makeFoldSurface(canvas) {
  const gl=canvas.getContext('webgl',{alpha:false,antialias:true,depth:true,powerPreference:'low-power'});
  if (!gl) return null;
  const program=gl.createProgram(), shaders=[];
  function add(type,source) {
    const shader=gl.createShader(type);shaders.push(shader);
    gl.shaderSource(shader,source);gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw Error('Archive shader: '+gl.getShaderInfoLog(shader));
    gl.attachShader(program,shader);
  }
  add(gl.VERTEX_SHADER,vertex);add(gl.FRAGMENT_SHADER,fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error('Archive program: '+gl.getProgramInfoLog(program));
  const points=[],indices=[],cols=100,rows=12;
  for(let y=0;y<=rows;y++) for(let x=0;x<=cols;x++) points.push(x/cols,y/rows);
  for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
    const i=y*(cols+1)+x;
    indices.push(i,i+1,i+cols+1,i+1,i+cols+2,i+cols+1);
  }
  const vertices=gl.createBuffer(), elements=gl.createBuffer(), textures=new Map();
  gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,vertices);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
  const attr=gl.getAttribLocation(program,'unit');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,elements);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  const sheet=gl.getUniformLocation(program,'sheet'), time=gl.getUniformLocation(program,'progress'), aspect=gl.getUniformLocation(program,'aspect');
  function bind(plate) {
    let tex=textures.get(plate);
    if (!tex) {
      tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,plate);textures.set(plate,tex);
    } else gl.bindTexture(gl.TEXTURE_2D,tex);
  }
  function clear() {textures.forEach(tex=>gl.deleteTexture(tex));textures.clear();}
  return {
    paint(base,turn,p) {
      gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(time,turn?p:0);gl.uniform1f(aspect,canvas.height/canvas.width);
      gl.uniform1f(sheet,0);bind(base);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
      if(turn && p<1){gl.uniform1f(sheet,1);bind(turn);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);}
    },
    clear, dispose(){clear();gl.deleteBuffer(vertices);gl.deleteBuffer(elements);shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);}
  };
}
