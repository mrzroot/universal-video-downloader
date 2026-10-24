(function(){var hero=FX.$('.hero');if(!hero)return;
/* grain tile */
var g=document.createElement('canvas');g.width=g.height=160;var gc=g.getContext('2d'),id=gc.createImageData(160,160);for(var i=0;i<id.data.length;i+=4){var v=Math.random()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}gc.putImageData(id,0,0);
var gr=document.createElement('div');gr.className='grain';gr.setAttribute('aria-hidden','true');gr.style.backgroundImage='url('+g.toDataURL()+')';hero.appendChild(gr);
var cv=document.createElement('canvas');cv.className='strip-fx';cv.setAttribute('aria-hidden','true');hero.insertBefore(cv,hero.firstChild);
var off=0,vel=-40,drag=false,lx=0,tags=['MP4','HLS','WebM','DASH','M3U8','MP4','HLS'],hot=-1,hotT=0;
function pal(i){var P=[['#ff9a5a','#7a1d3b'],['#ffd27a','#b3303f'],['#ff6a8a','#3a1033'],['#ffb36b','#5a1a2a'],['#f7e0a0','#c4472f']];return P[i%P.length]}
var lp=FX.loop(cv,function(c,w,h,t,dt,m){c.clearRect(0,0,w,h);if(!drag){off+=vel*dt;vel+=(-40-vel)*Math.min(1,dt*1.2)}
 var dk=FX.theme()==='dark',fw=w<600?118:164,gap=10,step=fw+gap,hh=h-34,y0=17,first=Math.floor(-off/step)-1;
 c.fillStyle=dk?'#050203':'#c9b79d';c.fillRect(0,0,w,h);
 for(var n=first;n<first+w/step+3;n++){var x=n*step+off,k=((n%7)+7)%7,p=pal(k);var gd=c.createLinearGradient(0,y0,0,y0+hh);gd.addColorStop(0,p[0]);gd.addColorStop(1,p[1]);c.fillStyle=gd;c.fillRect(x,y0,fw,hh);
  c.fillStyle='rgba(255,240,200,.9)';c.beginPath();c.arc(x+fw*(.3+.4*((k*37)%10)/10),y0+hh*(.4+.1*(k%3)),hh*.17,0,6.3);c.fill();
  c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.moveTo(x,y0+hh);c.quadraticCurveTo(x+fw*.35,y0+hh*(.62+.05*(k%3)),x+fw*.7,y0+hh*.85);c.lineTo(x+fw,y0+hh*.7);c.lineTo(x+fw,y0+hh);c.fill();
  c.fillStyle='#fff';c.font='700 11px ui-monospace,monospace';c.fillText(tags[k],x+8,y0+14);c.globalAlpha=.7;c.fillText(String(n).replace('-','')+'',x+fw-22,y0+hh-8);c.globalAlpha=1;
  var cx=x+fw/2,over=m.in&&m.x>x&&m.x<x+fw;if(over){hot=n;hotT=t}
  if(hot===n&&t-hotT<.6){c.strokeStyle='#ff2d55';c.lineWidth=3;c.strokeRect(x+1.5,y0+1.5,fw-3,hh-3);c.fillStyle='#ff2d55';c.fillRect(x+fw-54,y0+6,48,16);c.fillStyle='#fff';c.font='700 10px ui-monospace,monospace';c.fillText('● SNIFFED',x+fw-51,y0+17)}}
 /* sprockets */
 c.fillStyle=dk?'#0a0507':'#f1e9df';for(var sx=((off%22)+22)%22-22;sx<w;sx+=22){c.fillRect(sx,4,11,8);c.fillRect(sx,h-12,11,8)}
 },{still:2,dpr:1.5});
var st=0;cv.addEventListener('pointerdown',function(e){drag=true;lx=e.clientX;vel=0;cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-lx;lx=e.clientX;off+=dx;vel=dx*60});
['pointerup','pointercancel'].forEach(function(n){cv.addEventListener(n,function(){drag=false})});
})();
