/* 은호당 현공: 주택 좌향·대문 문향(門向)·대문 위치의 표시 의미. 택반 계산에는 참여하지 않는다. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.XuanKongDirectionSemantics=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const DIRECTION_NAMES=Object.freeze(['북쪽','북동쪽','동쪽','남동쪽','남쪽','남서쪽','서쪽','북서쪽']);
  const PALACE_NAMES=Object.freeze({N:'북쪽 구역',NE:'북동쪽 구역',E:'동쪽 구역',SE:'남동쪽 구역',S:'남쪽 구역',SW:'남서쪽 구역',W:'서쪽 구역',NW:'북서쪽 구역',C:'중앙 구역'});

  function normalizeAngle(value){
    if(value===null||value===undefined||value==='')return null;
    const number=Number(value);
    if(!Number.isFinite(number))return null;
    return ((number%360)+360)%360;
  }

  function directionName(value){
    const angle=normalizeAngle(value);
    return angle===null?'미기록':DIRECTION_NAMES[Math.floor((angle+22.5)/45)%8];
  }

  function buildDirectionState(input={}){
    const buildingFacingAngle=normalizeAngle(input.buildingFacingAngle);
    const doorFacingAngle=normalizeAngle(input.doorFacingAngle);
    const openingFacingAngle=normalizeAngle(input.openingFacingAngle);
    const measurementTarget=['building','door','opening'].includes(input.measurementTarget)?input.measurementTarget:'building';
    const doorPositionPalace=PALACE_NAMES[input.doorPositionPalace]?input.doorPositionPalace:null;
    const buildingDirection=directionName(buildingFacingAngle);
    const doorDirection=directionName(doorFacingAngle);
    const openingDirection=directionName(openingFacingAngle);
    const display=measurementTarget==='door'
      ?{label:'이번에 측정한 대문 문향(門向)',direction:doorDirection,note:'대문 문향은 독립 기록으로만 쓰이며, 주택 좌향을 바꾸지 않습니다.'}
      :measurementTarget==='opening'
        ?{label:'이번에 측정한 주요 기구(氣口) 방향',direction:openingDirection,note:'주요 기구는 독립 기록으로만 쓰이며, 주택 좌향을 바꾸지 않습니다.'}
        :{label:'우리 집 주택 좌향',direction:buildingDirection,note:''};

    return Object.freeze({
      measurementTarget,
      building:Object.freeze({facingAngle:buildingFacingAngle,direction:buildingDirection}),
      door:Object.freeze({facingAngle:doorFacingAngle,direction:doorDirection,positionPalace:doorPositionPalace,position:doorPositionPalace?PALACE_NAMES[doorPositionPalace]:'미표시'}),
      opening:Object.freeze({facingAngle:openingFacingAngle,direction:openingDirection}),
      display:Object.freeze(display)
    });
  }

  return Object.freeze({DIRECTION_NAMES,PALACE_NAMES,normalizeAngle,directionName,buildDirectionState});
});
