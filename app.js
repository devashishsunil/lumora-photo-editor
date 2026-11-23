(() => {
const $=id=>document.getElementById(id), canvas=$("canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true});
let original=null, sourceImage=null, history=[], future=[], rotation=0, flipped=false, textLayers=[];
const ids=["brightness","contrast","saturation","warmth","exposure","hue","vibrance","red","green","blue","blur","vignette","grain","sharpen"];
const defaults={brightness:100,contrast:100,saturation:100,warmth:0,exposure:0,hue:0,vibrance:0,red:0,green:0,blue:0,blur:0,vignette:0,grain:0,sharpen:0};
const values=()=>Object.fromEntries(ids.map(id=>[id,+$(id).value]));
function setValues(v){ids.forEach(id=>{$(id).value=v[id]??defaults[id];updateLabel(id)})}
function updateLabel(id){const out=$(id+"Val");if(out)out.textContent=$(id).value+(id==="hue"?"°":"")}
function snapshot(){if(!original)return;history.push({data:canvas.toDataURL(),values:values(),rotation,flipped,textLayers:JSON.parse(JSON.stringify(textLayers))});if(history.length>30)history.shift();future=[];buttons()}
function buttons(){$("undo").disabled=!history.length;$("redo").disabled=!future.length}
function loadFile(file){if(!file||!file.type.startsWith("image/"))return;const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{sourceImage=img;canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;original=ctx.createImageData(canvas.width,canvas.height);ctx.drawImage(img,0,0);original=ctx.getImageData(0,0,canvas.width,canvas.height);history=[];future=[];rotation=0;flipped=false;textLayers=[];setValues(defaults);$("canvas").style.display="block";$("stage").classList.add("loaded");$("imageInfo").textContent=`${img.naturalWidth} × ${img.naturalHeight} · ${file.name}`;render();buttons();URL.revokeObjectURL(url)};img.src=url}
$("file").addEventListener("change",e=>loadFile(e.target.files[0]));$("file2").addEventListener("change",e=>loadFile(e.target.files[0]));
function render(){if(!original)return;let w=original.width,h=original.height;canvas.width=w;canvas.height=h;let img=new Image();img.onload=()=>{ctx.save();ctx.clearRect(0,0,w,h);if(flipped){ctx.translate(w,0);ctx.scale(-1,1)}ctx.drawImage(img,0,0,w,h);ctx.restore();let d=ctx.getImageData(0,0,w,h),p=d.data,v=values();let exposure=Math.pow(2,v.exposure/100),contrast=v.contrast/100,brightness=v.brightness/100,sat=v.saturation/100;
for(let i=0;i<p.length;i+=4){let r=p[i],g=p[i+1],b=p[i+2];r*=brightness*exposure;g*=brightness*exposure;b*=brightness*exposure;r=(r-128)*contrast+128;g=(g-128)*contrast+128;b=(b-128)*contrast+128;r+=v.warmth*.55+v.red;g+=v.green;b+=-v.warmth*.55+v.blue;
let max=Math.max(r,g,b),min=Math.min(r,g,b),gray=.299*r+.587*g+.114*b;let s=sat*(1+v.vibrance/100*(1-(max-min)/255));r=gray+(r-gray)*s;g=gray+(g-gray)*s;b=gray+(b-gray)*s;p[i]=clamp(r);p[i+1]=clamp(g);p[i+2]=clamp(b)}
ctx.putImageData(d,0,0);
if(v.blur>0){let tmp=document.createElement("canvas");tmp.width=w;tmp.height=h;tmp.getContext("2d").drawImage(canvas,0,0);ctx.clearRect(0,0,w,h);ctx.filter=`blur(${v.blur}px)`;ctx.drawImage(tmp,0,0);ctx.filter="none"}
if(v.vignette>0){let grd=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.18,w/2,h/2,Math.max(w,h)*.72);grd.addColorStop(0,"#0000");grd.addColorStop(1,`rgba(0,0,0,${v.vignette/130})`);ctx.fillStyle=grd;ctx.fillRect(0,0,w,h)}
if(v.grain>0){let noise=ctx.getImageData(0,0,w,h),a=noise.data;for(let i=0;i<a.length;i+=4){let n=(Math.random()-.5)*v.grain;a[i]=clamp(a[i]+n);a[i+1]=clamp(a[i+1]+n);a[i+2]=clamp(a[i+2]+n)}ctx.putImageData(noise,0,0)}
if(v.sharpen>0)applySharpen(v.sharpen);
drawText();};img.src=originalToUrl()}
function originalToUrl(){let c=document.createElement("canvas");c.width=original.width;c.height=original.height;c.getContext("2d").putImageData(original,0,0);return c.toDataURL()}
function clamp(n){return Math.max(0,Math.min(255,n))}
function applySharpen(amount){let src=ctx.getImageData(0,0,canvas.width,canvas.height),out=ctx.createImageData(src.width,src.height),a=src.data,b=out.data,k=amount/100;for(let y=1;y<src.height-1;y++)for(let x=1;x<src.width-1;x++){let i=(y*src.width+x)*4;for(let c=0;c<3;c++){let val=a[i+c]* (1+4*k)-k*(a[i-4+c]+a[i+4+c]+a[i-src.width*4+c]+a[i+src.width*4+c]);b[i+c]=clamp(val)}b[i+3]=a[i+3]}ctx.putImageData(out,0,0)}
function drawText(){textLayers.forEach(t=>{ctx.save();ctx.font=`bold ${t.size}px system-ui`;ctx.textAlign="center";ctx.fillStyle=t.color;ctx.shadowColor="#0009";ctx.shadowBlur=5;ctx.fillText(t.text,canvas.width/2,canvas.height/2);ctx.restore()})}
ids.forEach(id=>{$(id).addEventListener("input",()=>{updateLabel(id);render()});$(id).addEventListener("change",()=>snapshot())});
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab,.panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(""+b.dataset.tab).classList.add("active")});
document.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>{if(!original)return;snapshot();let p={...defaults};if(b.dataset.preset==="vivid")Object.assign(p,{contrast:118,saturation:135,vibrance:25});if(b.dataset.preset==="warm")Object.assign(p,{warmth:28,saturation:112,brightness:104});if(b.dataset.preset==="mono")Object.assign(p,{saturation:0,contrast:112});if(b.dataset.preset==="fade")Object.assign(p,{contrast:82,brightness:108,saturation:78});if(b.dataset.preset==="cinema")Object.assign(p,{contrast:125,saturation:85,warmth:12,vignette:35});setValues(p);render()});
$("rotate").onclick=()=>{if(!original)return;snapshot();let old=canvas.toDataURL(),img=new Image();img.onload=()=>{let c=document.createElement("canvas");c.width=canvas.height;c.height=canvas.width;c.getContext("2d").translate(c.width/2,c.height/2);let x=c.getContext("2d");x.translate(c.width/2,c.height/2);x.rotate(Math.PI/2);x.drawImage(img,-img.width/2,-img.height/2);original=c.getContext("2d").getImageData(0,0,c.width,c.height);rotation=(rotation+90)%360;render()};img.src=old};
$("flip").onclick=()=>{if(!original)return;snapshot();flipped=!flipped;render()};
$("reset").onclick=()=>{if(!original)return;snapshot();setValues(defaults);rotation=0;flipped=false;textLayers=[];render()};
$("addText").onclick=()=>{let t=$("textInput").value.trim();if(!t||!original)return;snapshot();textLayers.push({text:t,size:+$("textSize").value,color:$("textColor").value});render()};
$("textSize").oninput=()=>{$("textSizeVal").textContent=$("textSize").value};
$("quality").oninput=()=>{$("qualityVal").textContent=$("quality").value+"%"};
$("download").onclick=()=>{if(!original)return alert("Upload a photo first.");let mime=$("format").value,q=+$("quality").value/100;canvas.toBlob(blob=>{let a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download="pixelstudio-edit."+(mime==="image/jpeg"?"jpg":mime==="image/png"?"png":"webp");a.click();URL.revokeObjectURL(url)},mime,q)};
$("compare").onpointerdown=()=>{if(original){ctx.putImageData(original,0,0)}};$("compare").onpointerup=()=>render();$("compare").onpointerleave=()=>render();
$("fit").onclick=()=>{canvas.style.maxHeight="72vh";canvas.style.maxWidth="100%"};
$("undo").onclick=()=>{if(!history.length)return;future.push({data:canvas.toDataURL(),values:values(),rotation,flipped,textLayers});let s=history.pop();restore(s)};
$("redo").onclick=()=>{if(!future.length)return;history.push({data:canvas.toDataURL(),values:values(),rotation,flipped,textLayers});let s=future.pop();restore(s)};
function restore(s){let img=new Image();img.onload=()=>{canvas.width=img.width;canvas.height=img.height;ctx.drawImage(img,0,0);setValues(s.values);rotation=s.rotation;flipped=s.flipped;textLayers=s.textLayers;original=ctx.getImageData(0,0,canvas.width,canvas.height);buttons()};img.src=s.data}
$("textSizeVal").textContent=$("textSize").value;buttons();
})();