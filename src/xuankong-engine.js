/*
 * 현공(玄空) 택반(宅盤) 계산 핵심
 *
 * 기본값 school=shen. 심씨(沈氏) 방식의 각도 분구, 삼원룡(三元龍), 음양(陰陽)과
 * 체성표(替星表)는 본 프로젝트에서 확정한 규격에 따라 이 파일에 집약되어 있다.
 * 과거의 중주(中州) 교재 규칙은 심씨 각도 분구 판정에 더 이상 참여하지 않는다.
 * 이 파일은 DOM·센서 의존이 없어 브라우저와 자동 테스트가 동일한 알고리즘을 쓴다.
 *
 * 주의: 아래의 계산 상수·배열·매핑과 반환 객체의 토큰 문자열
 * (順飛/逆飛·陽/陰·下卦/替卦·modeLabel·warning·source 등)은 compass-app.js 의
 * 계산/표시에 그대로 쓰이므로 번역하지 않고 보존한다. 주석만 한국어로 옮겼다.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.XuanKongEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SCHOOL = Object.freeze({SHEN:'shen'});
  const ANGLE_POLICY = Object.freeze({lowerHalfWidth:4.5,mountainHalfWidth:7.5,equalityEpsilon:1e-9,warningTolerance:0.2});
  const MOUNTAIN_NAMES = ['子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙','午','丁','未','坤','申','庚','酉','辛','戌','乾','亥','壬'];
  const GRID_PALACES = ['SE','S','SW','E','C','W','NE','N','NW'];
  const PALACE_DEFINITIONS = Object.freeze({
    N:{name:'坎',number:1,mountains:['壬','子','癸']},NE:{name:'艮',number:8,mountains:['丑','艮','寅']},
    E:{name:'震',number:3,mountains:['甲','卯','乙']},SE:{name:'巽',number:4,mountains:['辰','巽','巳']},
    S:{name:'離',number:9,mountains:['丙','午','丁']},SW:{name:'坤',number:2,mountains:['未','坤','申']},
    W:{name:'兌',number:7,mountains:['庚','酉','辛']},NW:{name:'乾',number:6,mountains:['戌','乾','亥']}
  });
  const PALACE_MOUNTAINS = Object.freeze(Object.fromEntries(Object.entries(PALACE_DEFINITIONS).map(([key,value])=>[key,Object.freeze([...value.mountains])])));
  const STAR_HOME = Object.freeze({1:'N',2:'SW',3:'E',4:'SE',6:'NW',7:'W',8:'NE',9:'S'});
  const YANG_MOUNTAINS = new Set(['乾','坤','艮','巽','寅','申','巳','亥','甲','庚','丙','壬']);
  const SUBSTITUTE_STAR = Object.freeze({
    子:1,癸:1,甲:1,申:1,壬:2,卯:2,乙:2,未:2,坤:2,戌:6,乾:6,亥:6,辰:6,巽:6,巳:6,
    丑:7,艮:7,丙:7,酉:7,辛:7,寅:9,午:9,庚:9,丁:9
  });
  const LO_SHU = Object.freeze([4,9,2,3,5,7,8,1,6]);
  const FLIGHT_PATH = Object.freeze([4,8,5,6,1,7,2,3,0]);
  const YUAN_NAMES = Object.freeze(['地元','天元','人元']);

  const finiteNumber = value => {
    if(value===null||value===''||typeof value==='boolean')return null;
    const numeric=Number(value);return Number.isFinite(numeric)?numeric:null;
  };
  const norm = value => {const numeric=finiteNumber(value);return numeric===null?NaN:((numeric%360)+360)%360};
  const normalizeDegrees = value => {const normalized=norm(value);if(!Number.isFinite(normalized))throw new TypeError('角度必須是有限數字');return normalized};
  const circularDifference = (value,reference) => {const a=normalizeDegrees(value),b=normalizeDegrees(reference);return ((a-b+540)%360)-180};
  const wrapStar = value => ((Number(value)-1)%9+9)%9+1;

  function palaceOf(mountain){const palace=Object.keys(PALACE_MOUNTAINS).find(key=>PALACE_MOUNTAINS[key].includes(mountain));if(!palace)throw new Error(`未知二十四山：${mountain}`);return palace}
  function yuanIndexOf(mountain){return PALACE_MOUNTAINS[palaceOf(mountain)].indexOf(mountain)}

  const MOUNTAIN_TABLE = Object.freeze(MOUNTAIN_NAMES.map((name,index)=>{
    const centerDegree=index*15,palace=palaceOf(name),definition=PALACE_DEFINITIONS[palace],yuanIndex=yuanIndexOf(name);
    return Object.freeze({name,index,centerDegree,startDegree:(centerDegree-7.5+360)%360,endDegree:(centerDegree+7.5)%360,
      gua:definition.name,guaKey:palace,guaNumber:definition.number,yuanDragon:YUAN_NAMES[yuanIndex],yinYang:YANG_MOUNTAINS.has(name)?'陽':'陰',
      oppositeMountain:MOUNTAIN_NAMES[(index+12)%24],leftNeighbor:MOUNTAIN_NAMES[(index+23)%24],rightNeighbor:MOUNTAIN_NAMES[(index+1)%24]});
  }));

  function mountainIndexAt(degrees){const value=normalizeDegrees(degrees);return Math.floor((value+7.5)/15)%24}
  function invalidAngleInfo(input){return Object.freeze({valid:false,status:'invalid',input,degrees:null,mode:null,modeLabel:'角度無效',warning:'請輸入有效角度。'})}

  function angleInfo(degrees,options={}){
    const numeric=finiteNumber(degrees);if(numeric===null)return invalidAngleInfo(degrees);
    const policy={...ANGLE_POLICY,...options},value=norm(numeric),index=mountainIndexAt(value),mountain=MOUNTAIN_TABLE[index],center=mountain.centerDegree;
    const offset=circularDifference(value,center),absoluteOffset=Math.abs(offset),lowerDistance=Math.abs(absoluteOffset-policy.lowerHalfWidth),mountainDistance=Math.abs(policy.mountainHalfWidth-absoluteOffset);
    const atLowerBoundary=lowerDistance<=policy.equalityEpsilon,atMountainBoundary=mountainDistance<=policy.equalityEpsilon;
    const adjacentIndex=(index+(offset>=0?1:23))%24,adjacent=MOUNTAIN_TABLE[adjacentIndex];
    let status,mode,modeLabel,warning='';
    if(atMountainBoundary){status='mountain_boundary';mode=null;modeLabel='山界／空亡敏感線';warning='落在二十四山分界，不建議直接固定單一宅盤。'}
    else if(atLowerBoundary){status='lower_replacement_boundary';mode=null;modeLabel='下卦／替卦臨界';warning='下卦／替卦臨界，建議重新量測。'}
    else if(absoluteOffset<policy.lowerHalfWidth){status='lower';mode='lower';modeLabel='正向下卦'}
    else{status='replacement';mode='replacement';modeLabel='兼向替卦'}
    const nearLowerBoundary=!atLowerBoundary&&lowerDistance<=policy.warningTolerance,nearMountainBoundary=!atMountainBoundary&&mountainDistance<=policy.warningTolerance;
    if(!warning&&nearLowerBoundary)warning='接近下卦／替卦界線，建議複測確認。';
    if(!warning&&nearMountainBoundary)warning='接近二十四山分界，建議複測確認。';
    let candidates=[mountain.name];
    if(atMountainBoundary)candidates=[MOUNTAIN_TABLE[(index+23)%24].name,MOUNTAIN_TABLE[index].name];
    const candidateRecords=candidates.map(name=>MOUNTAIN_TABLE[MOUNTAIN_NAMES.indexOf(name)]),crossGua=atMountainBoundary&&candidateRecords[0].guaKey!==candidateRecords[1].guaKey;
    return Object.freeze({valid:true,status,degrees:value,index,mountain:mountain.name,mountainRecord:mountain,center,offset,absoluteOffset,mode,modeLabel,
      leaningToward:mode==='replacement'||atLowerBoundary?adjacent.name:null,side:offset<0?'counterclockwise':offset>0?'clockwise':'center',adjacentMountain:adjacent.name,
      candidateMountains:Object.freeze(candidates),distanceToLowerBoundary:lowerDistance,distanceToMountainBoundary:mountainDistance,nearLowerBoundary,nearMountainBoundary,
      uncertain:Boolean(warning),warning,crossGua,sameGua:atMountainBoundary?!crossGua:true,candidateDetails:Object.freeze(candidateRecords.map(row=>Object.freeze({name:row.name,gua:row.gua,guaNumber:row.guaNumber,yuanDragon:row.yuanDragon,yinYang:row.yinYang})))});
  }

  function periodForYear(year){const numeric=finiteNumber(year);if(numeric===null)throw new Error('年份必須是數字');return ((Math.floor((numeric-1864)/20)%9)+9)%9+1}
  function periodRange(year,period=periodForYear(year)){const numeric=finiteNumber(year);if(numeric===null)throw new Error('年份必須是數字');const cycle=1864+Math.floor((numeric-1864)/180)*180,start=cycle+(period-1)*20;return [start,start+19]}
  function fly(center,forward=true){const result=Array(9);FLIGHT_PATH.forEach((cell,step)=>{result[cell]=wrapStar(center+(forward?step:-step))});return result}
  const LUO_SHU_BASE=Object.freeze(Object.fromEntries(GRID_PALACES.map((palace,index)=>[palace,LO_SHU[index]])));
  const LUO_SHU_OPPOSITE=Object.freeze(Object.fromEntries(GRID_PALACES.map((palace,index)=>[palace,fly(5,false)[index]])));

  function referenceMountain(seed,actualMountain,period){
    const yuanIndex=yuanIndexOf(actualMountain),referenceStar=seed===5?period:seed,homePalace=STAR_HOME[referenceStar];
    if(!homePalace)throw new Error(`無法判定 ${referenceStar} 星的本宮`);
    return {mountain:PALACE_MOUNTAINS[homePalace][yuanIndex],yuanIndex,yuan:YUAN_NAMES[yuanIndex],referenceStar,fiveYellow:seed===5};
  }

  function route(seed,actualMountain,period,mode,school=SCHOOL.SHEN){
    if(!Number.isInteger(seed)||seed<1||seed>9)throw new Error(`無效入中星：${seed}`);
    if(!['lower','replacement'].includes(mode))throw new Error(`未知排盤模式：${mode}`);
    if(!Object.values(SCHOOL).includes(school))throw new Error(`未知玄空流派：${school}`);
    const reference=referenceMountain(seed,actualMountain,period),forward=YANG_MOUNTAINS.has(reference.mountain);
    let center=seed,substituted=false,replacementSource=null;
    if(mode==='replacement'&&seed!==5){center=SUBSTITUTE_STAR[reference.mountain];if(!center)throw new Error(`替星表缺少：${reference.mountain}`);substituted=center!==seed;replacementSource=reference.mountain}
    return Object.freeze({seed,center,forward,direction:forward?'順飛':'逆飛',polarity:forward?'陽':'陰',referenceMountain:reference.mountain,referenceStar:reference.referenceStar,
      yuan:reference.yuan,fiveYellow:reference.fiveYellow,fiveYellowRule:reference.fiveYellow?'period_home_same_yuan':null,substituted,replacementSource,mode,school});
  }

  function buildChart(options={}){
    const school=options.school||SCHOOL.SHEN;if(!Object.values(SCHOOL).includes(school))throw new Error(`未知玄空流派：${school}`);
    const year=finiteNumber(options.year),period=options.period==null?periodForYear(year):Number(options.period);if(!Number.isInteger(period)||period<1||period>9)throw new Error('運數必須是 1–9');
    const hasSitting=options.sittingDegrees!==undefined,input=hasSitting?options.sittingDegrees:options.facingDegrees,raw=normalizeDegrees(input),inputBasis=hasSitting?'sitting':'facing';
    const baseFacing=hasSitting?norm(raw+180):raw,facingDegrees=norm(baseFacing+(options.flipped?180:0)),sittingDegrees=norm(facingDegrees+180);
    const facingAngle=angleInfo(facingDegrees,options.anglePolicy),sittingAngle=angleInfo(sittingDegrees,options.anglePolicy),periodChart=fly(period,true);
    const boundaryStatus=facingAngle.status==='mountain_boundary'||sittingAngle.status==='mountain_boundary'?'mountain_boundary':facingAngle.status==='lower_replacement_boundary'||sittingAngle.status==='lower_replacement_boundary'?'lower_replacement_boundary':null;
    const base={year,period,school,inputBasis,inputDegrees:raw,facingDegrees,sittingDegrees,facingAngle,sittingAngle,periodChart};
    if(boundaryStatus==='mountain_boundary'&&!options.previewMode)return Object.freeze({...base,valid:false,official:false,status:boundaryStatus,mode:null,modeLabel:facingAngle.modeLabel,
      trace:Object.freeze({school,period,inputBasis,inputDegrees:raw,boundaryStatus,facingCandidates:facingAngle.candidateDetails,sittingCandidates:sittingAngle.candidateDetails,decision:'不建立單一宅盤，需重新量測'})});
    const mode=options.previewMode||options.mode||facingAngle.mode||(boundaryStatus==='lower_replacement_boundary'?'replacement':null);if(!['lower','replacement'].includes(mode))throw new Error('臨界角度不可直接建立單一宅盤');
    const facing=facingAngle.mountain,sitting=sittingAngle.mountain,facingPalace=palaceOf(facing),sittingPalace=palaceOf(sitting),facingSeed=periodChart[GRID_PALACES.indexOf(facingPalace)],sittingSeed=periodChart[GRID_PALACES.indexOf(sittingPalace)];
    const mountainRoute=route(sittingSeed,sitting,period,mode,school),facingRoute=route(facingSeed,facing,period,mode,school),mountainChart=fly(mountainRoute.center,mountainRoute.forward),facingChart=fly(facingRoute.center,facingRoute.forward);
    const trace=Object.freeze({school,period,inputBasis,inputDegrees:raw,sittingDegrees,facingDegrees,sittingMountain:sitting,facingMountain:facing,sittingOffset:sittingAngle.offset,facingOffset:facingAngle.offset,
      zone:facingAngle.status,method:mode==='lower'?'下卦':'替卦',periodChart,mountain:Object.freeze({palace:sittingPalace,seed:sittingSeed,referenceMountain:mountainRoute.referenceMountain,yuan:mountainRoute.yuan,replacementStar:mountainRoute.center,direction:mountainRoute.direction,chart:mountainChart,fiveYellowRule:mountainRoute.fiveYellowRule}),
      facing:Object.freeze({palace:facingPalace,seed:facingSeed,referenceMountain:facingRoute.referenceMountain,yuan:facingRoute.yuan,replacementStar:facingRoute.center,direction:facingRoute.direction,chart:facingChart,fiveYellowRule:facingRoute.fiveYellowRule})});
    return Object.freeze({...base,valid:true,official:!boundaryStatus,status:boundaryStatus||'ready',mode,modeLabel:boundaryStatus==='lower_replacement_boundary'?'下卦／替卦臨界（以兼向試算）':mode==='lower'?'正向下卦':'兼向替卦',facing,sitting,facingPalace,sittingPalace,mountainSeed:sittingSeed,facingSeed,mountainRoute,facingRoute,mountainChart,facingChart,trace});
  }

  return Object.freeze({SCHOOL,ANGLE_POLICY,MOUNTAINS:MOUNTAIN_NAMES,MOUNTAIN_TABLE,GRID_PALACES,PALACE_DEFINITIONS,PALACE_MOUNTAINS,STAR_HOME,SUBSTITUTE_STAR,YANG_MOUNTAINS,LO_SHU,LUO_SHU_BASE,LUO_SHU_OPPOSITE,FLIGHT_PATH,
    norm,normalizeDegrees,circularDifference,wrapStar,palaceOf,yuanIndexOf,mountainIndexAt,angleInfo,periodForYear,periodRange,fly,referenceMountain,route,buildChart});
});
