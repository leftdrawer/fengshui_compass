/*
 * 심씨현공: 연／월 자백(紫白)과 당기 주택 행동 층
 *
 * 객성만 겹칠 뿐 주택 본명반을 다시 배열하지 않는다. DOM·네트워크·LLM 의존이 없다.
 * 주의: STEMS／BRANCHES／MONTH_BRANCHES(천간·지지)와 SOLAR_MONTH_TERMS 의 key(절기명)는
 * 간지·절기 계산에 쓰이는 상수이므로 번역하지 않고 보존한다.
 */
(function(root,factory){
  const engine=typeof module==='object'&&module.exports?require('./xuankong-engine.js'):root.XuanKongEngine;
  const api=factory(engine);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.XuanKongTemporal=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(engine){
  'use strict';

  if(!engine)throw new Error('XuanKongEngine is required');

  const DAY_MS=86400000;
  const STEMS=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const BRANCHES=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const MONTH_BRANCHES=['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
  const PALACE_DIRECTIONS=Object.freeze({SE:'남동쪽',S:'남쪽',SW:'남서쪽',E:'동쪽',C:'집 중앙',W:'서쪽',NE:'북동쪽',N:'북쪽',NW:'북서쪽'});
  const ACTION_LEVEL=Object.freeze({USE_MORE:'USE_MORE',NORMAL:'NORMAL',KEEP_QUIET:'KEEP_QUIET',AVOID_DISTURBANCE:'AVOID_DISTURBANCE',TEMPORARY_CAUTION:'TEMPORARY_CAUTION'});
  const SOURCE_ANNUAL=Object.freeze({level:'SHEN_CHART',corpus:'《심씨현공학(沈氏玄空學)》',book:'《현공집요(玄空輯要)》／《현공고의(玄空古義)》',section:'연 자백 구성 입중표／연월일시 자백도'});
  const SOURCE_MONTHLY=Object.freeze({level:'SHEN_CHART',corpus:'《심씨현공학(沈氏玄空學)》',book:'《현공집요(玄空輯要)》／《현공고의(玄空古義)》',section:'월 자백 구성 입중표／연월일시 자백도'});
  const SOURCE_ACTION=Object.freeze({level:'PRODUCT_INTERPRETATION',name:'은호당 당기 주택 개선 모델 v1',basis:'본명반 우선, 원운 다음, 유년과 유월은 객성 보정으로만'});

  // 십이 절월의 경계. 황경은 춘분 0°의 시황경(視黃經)을 쓴다.
  const SOLAR_MONTH_TERMS=Object.freeze([
    {key:'小寒',target:285,month:0,day:5,monthIndex:12},
    {key:'立春',target:315,month:1,day:4,monthIndex:1},
    {key:'驚蟄',target:345,month:2,day:5,monthIndex:2},
    {key:'清明',target:15,month:3,day:4,monthIndex:3},
    {key:'立夏',target:45,month:4,day:5,monthIndex:4},
    {key:'芒種',target:75,month:5,day:5,monthIndex:5},
    {key:'小暑',target:105,month:6,day:6,monthIndex:6},
    {key:'立秋',target:135,month:7,day:7,monthIndex:7},
    {key:'白露',target:165,month:8,day:7,monthIndex:8},
    {key:'寒露',target:195,month:9,day:8,monthIndex:9},
    {key:'立冬',target:225,month:10,day:7,monthIndex:10},
    {key:'大雪',target:255,month:11,day:7,monthIndex:11}
  ]);
  const TERM_BY_KEY=Object.freeze(Object.fromEntries(SOLAR_MONTH_TERMS.map(row=>[row.key,row])));
  const termCache=new Map();

  const mod=(value,base)=>((value%base)+base)%base;
  const toInstant=value=>{
    const instant=value instanceof Date?value.getTime():typeof value==='number'?value:new Date(value).getTime();
    if(!Number.isFinite(instant))throw new TypeError('날짜/시간이 유효해야 합니다');
    return instant;
  };
  const angleDifference=(value,target)=>mod(value-target+180,360)-180;
  const sinDegrees=degrees=>Math.sin(degrees*Math.PI/180);

  function decimalYear(instant){
    const date=new Date(instant),year=date.getUTCFullYear(),start=Date.UTC(year,0,1),end=Date.UTC(year+1,0,1);
    return year+(instant-start)/(end-start);
  }

  // NASA/Meeus 방식의 ΔT 구간별 근사. 시황경을 TT 기준으로 계산하고 UTC instant 로 출력한다.
  function deltaTSeconds(instant){
    const year=decimalYear(instant),t=year-2000,u=(year-2000)/100;
    if(year>=2005&&year<2050)return 62.92+.32217*t+.005589*t*t;
    if(year>=1986&&year<2005)return 63.86+.3345*t-.060374*t*t+.0017275*t**3+.000651814*t**4+.00002373599*t**5;
    if(year>=2050&&year<2150)return -20+32*((year-1820)/100)**2-.5628*(2150-year);
    if(year>=1900&&year<1920){const q=year-1900;return -2.79+1.494119*q-.0598939*q**2+.0061966*q**3-.000197*q**4}
    if(year>=1920&&year<1941){const q=year-1920;return 21.20+.84493*q-.076100*q**2+.0020936*q**3}
    if(year>=1941&&year<1961){const q=year-1950;return 29.07+.407*q-q**2/233+q**3/2547}
    if(year>=1961&&year<1986){const q=year-1975;return 45.45+1.067*q-q**2/260-q**3/718}
    if(year>=1800&&year<1860){const q=year-1800;return 13.72-.332447*q+.0068612*q**2+.0041116*q**3-.00037436*q**4+.0000121272*q**5-.0000001699*q**6+.000000000875*q**7}
    if(year>=1860&&year<1900){const q=year-1860;return 7.62+.5737*q-.251754*q**2+.01680668*q**3-.0004473624*q**4+q**5/233174}
    return -20+32*u*u;
  }

  function apparentSolarLongitude(instant){
    const jd=instant/DAY_MS+2440587.5+deltaTSeconds(instant)/86400,T=(jd-2451545)/36525;
    const meanLongitude=mod(280.46646+36000.76983*T+.0003032*T*T,360);
    const meanAnomaly=mod(357.52911+35999.05029*T-.0001537*T*T+T*T*T/24490000,360);
    const equation=(1.914602-.004817*T-.000014*T*T)*sinDegrees(meanAnomaly)+(.019993-.000101*T)*sinDegrees(2*meanAnomaly)+.000289*sinDegrees(3*meanAnomaly);
    const trueLongitude=meanLongitude+equation,omega=125.04-1934.136*T;
    return mod(trueLongitude-.00569-.00478*sinDegrees(omega),360);
  }

  function solarTermInstant(year,termKey){
    if(!Number.isInteger(year))throw new TypeError('절기 연도는 정수여야 합니다');
    const term=TERM_BY_KEY[termKey];if(!term)throw new Error(`알 수 없는 절기: ${termKey}`);
    const cacheKey=`${year}-${termKey}`;if(termCache.has(cacheKey))return termCache.get(cacheKey);
    const approximate=Date.UTC(year,term.month,term.day,12),start=approximate-5*DAY_MS,end=approximate+5*DAY_MS;
    let left=start,leftValue=angleDifference(apparentSolarLongitude(left),term.target),right=null;
    for(let cursor=start+6*3600000;cursor<=end;cursor+=6*3600000){
      const value=angleDifference(apparentSolarLongitude(cursor),term.target);
      if(leftValue<=0&&value>=0){right=cursor;break}
      left=cursor;leftValue=value;
    }
    if(right===null)throw new Error(`${year} ${termKey} 절기 교차 계산 실패`);
    for(let i=0;i<52&&right-left>1;i++){
      const middle=(left+right)/2,value=angleDifference(apparentSolarLongitude(middle),term.target);
      if(value>=0)right=middle;else left=middle;
    }
    const result=Math.round(right);termCache.set(cacheKey,result);return result;
  }

  function validTimeZone(timezone){
    const candidate=timezone||'UTC';
    try{new Intl.DateTimeFormat('ko-KR',{timeZone:candidate}).format(0);return candidate}catch{return 'UTC'}
  }
  function localInstant(instant,timezone){
    const zone=validTimeZone(timezone);
    return {timeZone:zone,text:new Intl.DateTimeFormat('ko-KR',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(instant))};
  }
  function termRowsForYear(year){return SOLAR_MONTH_TERMS.map(term=>({...term,year,instant:solarTermInstant(year,term.key)}))}

  function getSolarTermPeriod(datetime,timezone='UTC'){
    const instant=toInstant(datetime),year=new Date(instant).getUTCFullYear(),rows=[...termRowsForYear(year-1),...termRowsForYear(year),...termRowsForYear(year+1)].sort((a,b)=>a.instant-b.instant);
    const index=Math.max(0,rows.findIndex(row=>row.instant>instant)-1),current=rows[index],next=rows[index+1];
    if(!current||!next)throw new Error('절기월 범위를 가져올 수 없습니다');
    return Object.freeze({term:current.key,solarMonthIndex:current.monthIndex,startInstant:new Date(current.instant).toISOString(),endInstant:new Date(next.instant).toISOString(),startEpochMs:current.instant,endEpochMs:next.instant,startLocal:localInstant(current.instant,timezone),endLocal:localInstant(next.instant,timezone)});
  }

  function ganzhiYear(year){
    const index=mod(year-1984,60);
    return Object.freeze({index,stem:STEMS[index%10],branch:BRANCHES[index%12],label:`${STEMS[index%10]}${BRANCHES[index%12]}`});
  }
  const starGrid=center=>Object.freeze(Object.fromEntries(engine.GRID_PALACES.map((palace,index)=>[palace,engine.fly(center,true)[index]])));

  function calculateAnnualPurpleWhite(datetime=new Date(),timezone='UTC'){
    const instant=toInstant(datetime),calendarYear=new Date(instant).getUTCFullYear(),lichun=solarTermInstant(calendarYear,'立春'),effectiveYear=instant>=lichun?calendarYear:calendarYear-1,start=solarTermInstant(effectiveYear,'立春'),end=solarTermInstant(effectiveYear+1,'立春'),centerStar=engine.wrapStar(1-(effectiveYear-1864)),ganzhi=ganzhiYear(effectiveYear);
    return Object.freeze({effectiveYear,ganzhiYear:ganzhi.label,yearStem:ganzhi.stem,yearBranch:ganzhi.branch,startInstant:new Date(start).toISOString(),endInstant:new Date(end).toISOString(),startEpochMs:start,endEpochMs:end,startLocal:localInstant(start,timezone),endLocal:localInstant(end,timezone),centerStar,starGrid:starGrid(centerStar),source:SOURCE_ANNUAL});
  }

  function calculateMonthlyPurpleWhite(datetime=new Date(),timezone='UTC'){
    const instant=toInstant(datetime),annual=calculateAnnualPurpleWhite(instant,timezone),period=getSolarTermPeriod(instant,timezone),solarMonthIndex=period.solarMonthIndex,groupStart=['子','午','卯','酉'].includes(annual.yearBranch)?8:['辰','戌','丑','未'].includes(annual.yearBranch)?5:2,centerStar=engine.wrapStar(groupStart-(solarMonthIndex-1));
    return Object.freeze({effectiveYear:annual.effectiveYear,ganzhiYear:annual.ganzhiYear,solarMonthIndex,monthBranch:MONTH_BRANCHES[solarMonthIndex-1],startSolarTerm:period.term,startInstant:period.startInstant,endInstant:period.endInstant,startEpochMs:period.startEpochMs,endEpochMs:period.endEpochMs,startLocal:period.startLocal,endLocal:period.endLocal,centerStar,starGrid:starGrid(centerStar),source:SOURCE_MONTHLY});
  }

  function chartLayers(chart){
    const periodPlate=chart.periodChart||chart.yun,mountainStarGrid=chart.mountainChart||chart.shan,facingStarGrid=chart.facingChart||chart.xiang,housePeriod=chart.period||chart.p;
    if(![periodPlate,mountainStarGrid,facingStarGrid].every(layer=>Array.isArray(layer)&&layer.length===9))throw new Error('택명반에 완전한 구궁 자료가 없습니다');
    return {periodPlate,mountainStarGrid,facingStarGrid,housePeriod};
  }

  function overlayTemporalStars(chart,annual,monthly){
    const layers=chartLayers(chart);
    return Object.freeze(engine.GRID_PALACES.map((palace,index)=>Object.freeze({palace,index,natal:Object.freeze({periodStar:layers.periodPlate[index],mountainStar:layers.mountainStarGrid[index],facingStar:layers.facingStarGrid[index]}),annualStar:annual.starGrid[palace],monthlyStar:monthly.starGrid[palace]})));
  }

  const POSITIVE_STARS=new Set([1,4,6,8,9]);
  const CAUTION_STARS=new Set([2,3,5,7]);
  const priority={AVOID_DISTURBANCE:5,KEEP_QUIET:4,TEMPORARY_CAUTION:3,USE_MORE:2,NORMAL:1};
  const unique=list=>[...new Set((list||[]).filter(Boolean))];
  function itemsForPalace(placements,palace){return unique(Array.isArray(placements?.[palace])?placements[palace]:[])}
  function targetLabel(palace,items){
    if(!items.length)return PALACE_DIRECTIONS[palace];
    const primaryOrder=['大門','主臥室','次臥室','兒童房','長輩房','客廳','書房','工作室','廚房','浴室','廁所','玄關','餐廳','儲藏室','更衣室','床位','書桌／工作位','辦公桌','窗戶','陽台'],ordered=[...items].sort((a,b)=>{const ai=primaryOrder.indexOf(a),bi=primaryOrder.indexOf(b);return (ai<0?999:ai)-(bi<0?999:bi)});
    return ordered.length<=3?`우리 집의 ${ordered.join('·')}`:`우리 집의 ${ordered.slice(0,3).join('·')} 등의 위치`;
  }
  function useMoreCopy(target,items){
    if(items.some(item=>/書房|工作室|書桌|辦公桌/.test(item)))return `${target}은(는) 올해 독서·업무 등 일상 사용을 유지하거나 늘리기에 알맞습니다.`;
    if(items.some(item=>/臥室|床/.test(item)))return `${target}은(는) 올해 안정된 생활 리듬을 유지하기에 알맞으며, 유년 때문에 크게 옮길 필요가 없습니다.`;
    if(items.some(item=>/大門|玄關|客廳|餐廳/.test(item)))return `${target}은(는) 올해 정상적으로 활동과 사용을 늘리기에 알맞습니다.`;
    return `${target}은(는) 올해 비교적 쓸 가치가 있는 위치이니 일상 활동을 우선 배치할 수 있습니다.`;
  }

  function analyzeTemporalPalace(input){
    const {palace,natal,annualStar,monthlyStar}=input.overlay,assessment=input.sAssessment||{},items=itemsForPalace(input.placements,palace),target=targetLabel(palace,items),housePeriod=Number(input.housePeriod),localRows=[...(assessment.fanFuYin?.localFanYinDetails||[]),...(assessment.fanFuYin?.localFuYinDetails||[])].filter(row=>row.palace===palace),fullRisk=Boolean(assessment.fanFuYin?.fullFanYin||assessment.fanFuYin?.fullFuYin),natalStrength=(natal.mountainStar===housePeriod?2:0)+(natal.facingStar===housePeriod?2:0)+(natal.periodStar===housePeriod?1:0)-Math.min(2,localRows.length)-(fullRisk?2:0),annualModifier=annualStar===5?-4:annualStar===2?-2:[3,7].includes(annualStar)?-1:POSITIVE_STARS.has(annualStar)?1:0,monthlyModifier=monthlyStar===5?-2:monthlyStar===2?-1:[3,7].includes(monthlyStar)?-.5:POSITIVE_STARS.has(monthlyStar)?.5:0;
    let actionLevel=ACTION_LEVEL.NORMAL;
    if(annualStar===5||natalStrength+annualModifier<=-4)actionLevel=ACTION_LEVEL.AVOID_DISTURBANCE;
    else if(annualStar===2||natalStrength+annualModifier<=-2)actionLevel=ACTION_LEVEL.KEEP_QUIET;
    else if(CAUTION_STARS.has(monthlyStar))actionLevel=ACTION_LEVEL.TEMPORARY_CAUTION;
    else if(POSITIVE_STARS.has(annualStar)&&natalStrength+annualModifier+monthlyModifier>=2&&!fullRisk)actionLevel=ACTION_LEVEL.USE_MORE;
    let annualAction,monthlyAction;
    if(actionLevel===ACTION_LEVEL.AVOID_DISTURBANCE)annualAction=`${target}은(는) 올해 벽 두드리기·뚫기·큰 공사를 되도록 피하세요. 일상 사용은 평소대로입니다.`;
    else if(actionLevel===ACTION_LEVEL.KEEP_QUIET)annualAction=annualStar===2?`${target}은(는) 올해 청결·건조·통풍과 안정된 사용을 위주로 하세요.`:`${target}은(는) 올해 조용함과 안정된 사용을 위주로 하세요.`;
    else if(actionLevel===ACTION_LEVEL.USE_MORE)annualAction=useMoreCopy(target,items);
    else annualAction=`${target}은(는) 올해 정상적으로 사용하면 됩니다.`;
    if(CAUTION_STARS.has(monthlyStar))monthlyAction=monthlyStar===5?`${target}은(는) 이번 달 두드림과 공사를 잠시 줄이세요.`:monthlyStar===2?`${target}은(는) 이번 달 청결·건조·통풍에 더 유의하세요.`:`${target}은(는) 이번 달 소음·부딪힘·공사를 잠시 줄이세요.`;
    else if(POSITIVE_STARS.has(monthlyStar)&&actionLevel===ACTION_LEVEL.USE_MORE)monthlyAction=`${target}은(는) 이번 달 지금의 사용 배치를 유지할 수 있습니다.`;
    else monthlyAction=`${target}은(는) 이번 달 추가로 조정할 사항이 없습니다.`;
    return Object.freeze({palace,location:PALACE_DIRECTIONS[palace],items:Object.freeze(items),target,actionLevel,annualAction,monthlyAction,natalStrength,annualModifier,monthlyModifier,trace:Object.freeze({housePeriod,natal,annualStar,monthlyStar,localRelationCount:localRows.length,fullRisk,rule:'NATAL > PERIOD > ANNUAL > MONTHLY'})});
  }

  function analyzeCurrentHomeActions({chart,sAssessment,annual,monthly,placements={}}){
    const overlays=overlayTemporalStars(chart,annual,monthly),housePeriod=chart.period||chart.p,byPalace=Object.freeze(overlays.map(overlay=>analyzeTemporalPalace({overlay,housePeriod,sAssessment,placements}))),hasPlacement=Object.values(placements||{}).some(items=>Array.isArray(items)&&items.length),sorted=[...byPalace].sort((a,b)=>priority[b.actionLevel]-priority[a.actionLevel]||b.items.length-a.items.length||a.palace.localeCompare(b.palace)),annualAttention=sorted.filter(row=>[ACTION_LEVEL.AVOID_DISTURBANCE,ACTION_LEVEL.KEEP_QUIET].includes(row.actionLevel)).slice(0,3),annualUse=sorted.filter(row=>row.actionLevel===ACTION_LEVEL.USE_MORE).slice(0,3),monthlyAttention=sorted.filter(row=>CAUTION_STARS.has(row.trace.monthlyStar)).slice(0,3);
    return Object.freeze({hasPlacement,byPalace,annualAttention:Object.freeze(annualAttention),annualUse:Object.freeze(annualUse),monthlyAttention:Object.freeze(monthlyAttention),emptyStateAction:hasPlacement?'':'3단계에서 방을 표시하면 사이트가 방위를 실제 방으로 바로 옮겨 줍니다.',source:SOURCE_ACTION});
  }

  function buildTemporalAssessment({chart,sAssessment,placements={},analysisDate=new Date(),timezone='UTC'}){
    const annual=calculateAnnualPurpleWhite(analysisDate,timezone),monthly=calculateMonthlyPurpleWhite(analysisDate,timezone),overlays=overlayTemporalStars(chart,annual,monthly),currentActions=analyzeCurrentHomeActions({chart,sAssessment,annual,monthly,placements});
    return Object.freeze({analysisDate:new Date(toInstant(analysisDate)).toISOString(),timezone:validTimeZone(timezone),layers:Object.freeze({NATAL:'주택 성립／개운 연도',PERIOD:'주택 원운',ANNUAL:'유년 객성',MONTHLY:'절기 유월 객성'}),annual,monthly,overlays,currentActions,currentCondition:Object.freeze({type:'TEMPORAL_ONLY',changesNatalPR:false,summary:'유년과 유월은 현재의 사용 건의만 조정하며 본명 택반과 PR을 수정하지 않습니다.'})});
  }

  return Object.freeze({ACTION_LEVEL,SOLAR_MONTH_TERMS,PALACE_DIRECTIONS,SOURCE_ANNUAL,SOURCE_MONTHLY,SOURCE_ACTION,apparentSolarLongitude,solarTermInstant,getSolarTermPeriod,ganzhiYear,calculateAnnualPurpleWhite,calculateMonthlyPurpleWhite,overlayTemporalStars,analyzeTemporalPalace,analyzeCurrentHomeActions,buildTemporalAssessment});
});
