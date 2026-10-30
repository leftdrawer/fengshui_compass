(function(root){
  'use strict';
  const finite=value=>{const n=Number(value);return value!==null&&value!==''&&Number.isFinite(n)?n:null};
  const norm=value=>{const n=finite(value);return n===null?NaN:((n%360)+360)%360};
  const delta=(value,reference)=>((norm(value)-norm(reference)+540)%360)-180;
  function reading(event,eventName='deviceorientation',screenOrientation=0){
    const reportedAccuracy=finite(event?.webkitCompassAccuracy),accuracyInvalid=reportedAccuracy!==null&&reportedAccuracy<0,accuracy=reportedAccuracy!==null&&reportedAccuracy>=0?reportedAccuracy:null;
    const beta=Number.isFinite(event?.beta)?event.beta:0,gamma=Number.isFinite(event?.gamma)?event.gamma:0,tilt=Math.max(Math.abs(beta),Math.abs(gamma));
    // webkitCompassHeading 는 이미 기기 상단이 가리키는 자북(磁北) 방위를 나타낸다. iPad 가로/세로 전환 시 화면 각도를 더 더하면 안 된다.
    if(Number.isFinite(event?.webkitCompassHeading))return {heading:norm(event.webkitCompassHeading),rawHeading:norm(event.webkitCompassHeading),accuracy,accuracyInvalid,tilt,source:'iPad／iPhone 자북 센서',basis:'magnetic',absolute:true};
    const absolute=event?.absolute===true||eventName==='deviceorientationabsolute';
    if(Number.isFinite(event?.alpha)&&absolute){const heading=norm(360-event.alpha+Number(screenOrientation||0));return {heading,rawHeading:heading,accuracy:null,accuracyInvalid:false,tilt,source:'Android 절대 방위',basis:'unknown-absolute',absolute:true}}
    return null;
  }
  function calibrated(heading,offset=0){return norm(Number(heading)+Number(offset||0))}
  function offset(reference,measured){return Math.round(delta(reference,measured)*10)/10}
  function circularMean(values){
    const valid=(values||[]).map(finite).filter(Number.isFinite);if(!valid.length)return null;
    const sum=valid.reduce((acc,value)=>{const r=norm(value)*Math.PI/180;acc.x+=Math.cos(r);acc.y+=Math.sin(r);return acc},{x:0,y:0});
    if(Math.abs(sum.x)<1e-12&&Math.abs(sum.y)<1e-12)return null;
    return norm(Math.atan2(sum.y,sum.x)*180/Math.PI);
  }
  function circularSpread(values,mean=circularMean(values)){if(mean===null)return null;return Math.max(0,...values.map(value=>Math.abs(delta(value,mean))))}
  function smooth(current,next,gain=.35){const a=finite(current),b=finite(next);if(b===null)return a;if(a===null)return norm(b);return norm(a+delta(b,a)*Math.max(0,Math.min(1,gain)))}
  function responsive(current,next,elapsedMs=16){
    const a=finite(current),b=finite(next);if(b===null)return a;if(a===null)return norm(b);
    const distance=Math.abs(delta(b,a)),ms=Math.max(8,Math.min(250,Number(elapsedMs)||16)),speed=distance/(ms/1000);
    const gain=distance>=10||speed>=180?.98:distance>=2||speed>=45?.94:distance>=.35||speed>=8?.84:.62;
    return norm(a+delta(b,a)*gain);
  }
  function fusedTarget(raw,recentValues,rawStep,motionThreshold=1.1){
    const direct=finite(raw);if(direct===null)return null;
    const mean=circularMean(recentValues);
    return Number(rawStep)>motionThreshold||mean===null?norm(direct):mean;
  }
  function sourceRank(event,result){return Number.isFinite(event?.webkitCompassHeading)?3:result?.absolute?2:1}
  function acceptsSource(currentRank,lastSeenAt,nextRank,now,holdMs=1600){return !(nextRank<currentRank&&now-lastSeenAt<holdMs)}
  root.OrientationHelper={norm,delta,reading,calibrated,offset,circularMean,circularSpread,smooth,responsive,fusedTarget,sourceRank,acceptsSource};
})(typeof window!=='undefined'?window:globalThis);
