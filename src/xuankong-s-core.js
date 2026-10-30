/*
 * 심씨현공 S급 핵심 택 판단 엔진 v2
 *
 * XuanKongEngine 이 이미 만든 운반·산성반·향성반만 읽으며, 비성을 다시 배열하지 않고
 * DOM 을 읽지 않으며 LLM 에 의존하지 않는다. 전통 규칙과 제품 결정 층을 분리해 단위 테스트·검토가 쉽다.
 * 주의: EARTH_LUCK_ORACLE 키·SHEN_SEVEN_STAR_IMPRISONMENT_TABLE 의 산 이름(子/午/戌 등)과
 * calculationMethod 비교 토큰(替卦／起星), airItems 의 항목 토큰은 계산/매칭에 쓰이므로 번역하지 않고 보존한다.
 */
(function(root,factory){
  const engine=typeof module==='object'&&module.exports?require('./xuankong-engine.js'):root.XuanKongEngine;
  const api=factory(engine);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.XuanKongSCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(engine){
  'use strict';
  if(!engine)throw new Error('심씨 S급 엔진에는 XuanKongEngine 이 필요합니다');

  const VERSION='shen-s1-v2';
  const SOURCE_LEVEL=Object.freeze({SHEN_ORIGINAL:'SHEN_ORIGINAL',SHEN_ANNOTATION:'SHEN_ANNOTATION',SHEN_CHART:'SHEN_CHART',LATER_INTERPRETATION:'LATER_INTERPRETATION'});
  const FORMAL_SOURCE_LEVELS=Object.freeze([SOURCE_LEVEL.SHEN_ORIGINAL,SOURCE_LEVEL.SHEN_ANNOTATION,SOURCE_LEVEL.SHEN_CHART]);
  const SOURCE_REGISTRY=Object.freeze({
    CORE_PATTERN:Object.freeze({level:SOURCE_LEVEL.SHEN_CHART,title:'《심씨현공학(沈氏玄空學)》 중편본 권4 〈구운애성입성도(九運挨星立成圖)〉·〈하괘애성(下卦挨星)〉'}),
    FAN_FU_YIN:Object.freeze({level:SOURCE_LEVEL.SHEN_ORIGINAL,title:'《심씨현공학(沈氏玄空學)》 권2 〈반음복음 논함(論反吟伏吟)〉'}),
    EARTH_LUCK:Object.freeze({level:SOURCE_LEVEL.SHEN_ORIGINAL,title:'《심씨현공학(沈氏玄空學)》 권2 〈영성 입수 논함(論令星入囚)〉'}),
    EARTH_LUCK_ORACLE:Object.freeze({level:SOURCE_LEVEL.SHEN_CHART,title:'《심씨현공학(沈氏玄空學)》 24산 소삼원 지운 입성 교정'}),
    QI_XING_IMPRISONMENT:Object.freeze({level:SOURCE_LEVEL.SHEN_ORIGINAL,title:'《심씨현공학(沈氏玄空學)》 〈기성 논함(論起星)〉: 겸향 당운 산／향성 입중'}),
    SEVEN_STAR_IMPRISONMENT:Object.freeze({level:SOURCE_LEVEL.SHEN_CHART,title:'《심씨현공학(沈氏玄空學)》 〈칠성타겁 입수표(七星打劫入囚表)〉'}),
    PRODUCT_DECISION:Object.freeze({level:SOURCE_LEVEL.LATER_INTERPRETATION,title:'은호당 사이트 주택 결정 모델 v1(심씨 원문 아님)'})
  });

  const PATTERN=Object.freeze({
    DAO_SHAN_DAO_XIANG:'DAO_SHAN_DAO_XIANG',SHANG_SHAN_XIA_SHUI:'SHANG_SHAN_XIA_SHUI',DOUBLE_AT_MOUNTAIN:'DOUBLE_AT_MOUNTAIN',DOUBLE_AT_FACING:'DOUBLE_AT_FACING',
    WANG_SHAN_ONLY:'WANG_SHAN_ONLY',WANG_XIANG_ONLY:'WANG_XIANG_ONLY',SHANG_SHAN_ONLY:'SHANG_SHAN_ONLY',XIA_SHUI_ONLY:'XIA_SHUI_ONLY',MIXED:'MIXED'
  });
  const PATTERN_COPY=Object.freeze({
    DAO_SHAN_DAO_XIANG:Object.freeze({label:'왕산왕향(旺山旺向)',professional:'도산도향(到山到向)',summary:'산성이 좌산에, 향성이 향수에 이르러 원국 골격이 좋습니다.'}),
    SHANG_SHAN_XIA_SHUI:Object.freeze({label:'상산하수(上山下水)',professional:'상산하수(上山下水)',summary:'산·향 왕성 별의 위치가 뒤집혀 실제 외부 형국을 특히 점검해야 합니다.'}),
    DOUBLE_AT_MOUNTAIN:Object.freeze({label:'쌍성도산(雙星到山)',professional:'쌍성회좌(雙星會坐)',summary:'당운 왕기가 좌산에 모여, 거주 안정과 재물 동은 따로 검토해야 합니다.'}),
    DOUBLE_AT_FACING:Object.freeze({label:'쌍성도향(雙星到向)',professional:'쌍성회향(雙星會向)',summary:'당운 왕기가 향수에 모여 납기·재물 동이 비교적 강하며, 거주 면은 외부 형국과 맞춰야 합니다.'}),
    WANG_SHAN_ONLY:Object.freeze({label:'왕산, 향은 조건 못 맞음',professional:'산성도산(山星到山)',summary:'좌산 쪽은 조건이 맞으나 향수의 재물 동 쪽은 받아들일 곳을 더 찾아야 합니다.'}),
    WANG_XIANG_ONLY:Object.freeze({label:'왕향, 산은 조건 못 맞음',professional:'향성도향(向星到向)',summary:'향수 쪽은 조건이 맞으나 좌후의 휴양·안정성은 더 검토해야 합니다.'}),
    SHANG_SHAN_ONLY:Object.freeze({label:'상산(上山)',professional:'향상 영성이 좌산에',summary:'재물 동의 영성이 좌산에 이르렀으나 완전한 상산하수를 이루지는 않았습니다.'}),
    XIA_SHUI_ONLY:Object.freeze({label:'하수(下水)',professional:'산상 영성이 향수에',summary:'고요를 주관하는 영성이 향수에 이르렀으나 완전한 상산하수를 이루지는 않았습니다.'}),
    MIXED:Object.freeze({label:'혼합 반세(混合盤勢)',professional:'단일 사격국 아님',summary:'이 반은 넷 중 하나로 억지로 끼워 넣지 말고 왕산·왕향·상산·하수를 따로 보세요.'})
  });
  const EARTH_LUCK_ORACLE=Object.freeze({戌:20,乾:20,亥:20,庚:40,酉:40,辛:40,丑:60,艮:60,寅:60,丙:80,午:80,丁:80,壬:100,子:100,癸:100,未:120,坤:120,申:120,甲:140,卯:140,乙:140,辰:160,巽:160,巳:160});
  const IMPRISONMENT_TYPE=Object.freeze({NONE:'NONE',STANDARD_FUTURE:'STANDARD_FUTURE',QI_XING_MOUNTAIN_CURRENT:'QI_XING_MOUNTAIN_CURRENT',QI_XING_FACING_CURRENT:'QI_XING_FACING_CURRENT',QI_XING_BOTH_CURRENT:'QI_XING_BOTH_CURRENT',SPECIAL_JIE_YUN:'SPECIAL_JIE_YUN'});
  const SPECIAL_IMPRISONMENT_TYPE=Object.freeze({NONE:'NONE',KAN_LI_JIE_YUN:'KAN_LI_JIE_YUN',OTHER_SHEN_SPECIAL:'OTHER_SHEN_SPECIAL'});
  const JIE_KIND=Object.freeze({TRUE:'TRUE',FALSE:'FALSE'});
  const jieEntry=(housePeriod,sittingMountain,facingMountain,imprisonmentPeriod,kind,exclusion=null)=>Object.freeze({housePeriod,sittingMountain,facingMountain,imprisonmentPeriod,kind,exclusion,source:'SHEN_SEVEN_STAR_IMPRISONMENT_TABLE'});
  const SHEN_SEVEN_STAR_IMPRISONMENT_TABLE=Object.freeze([
    // 원표의 「진타겁(真打劫)」: 같은 글자 항목을 하나씩 펼쳐, 실행 시점에 같은 원의 산향을 다시 추측하지 않도록 한다.
    jieEntry(1,'子','午',9,JIE_KIND.TRUE),jieEntry(1,'癸','丁',9,JIE_KIND.TRUE),jieEntry(1,'辰','戌',3,JIE_KIND.TRUE),jieEntry(1,'庚','甲',6,JIE_KIND.TRUE),
    jieEntry(2,'壬','丙',1,JIE_KIND.TRUE),jieEntry(2,'酉','卯',7,JIE_KIND.TRUE),jieEntry(2,'辛','乙',7,JIE_KIND.TRUE),
    jieEntry(3,'子','午',2,JIE_KIND.TRUE),jieEntry(3,'癸','丁',2,JIE_KIND.TRUE),
    jieEntry(4,'壬','丙',3,JIE_KIND.TRUE),jieEntry(4,'辰','戌',6,JIE_KIND.TRUE),
    jieEntry(6,'子','午',5,JIE_KIND.TRUE),jieEntry(6,'癸','丁',5,JIE_KIND.TRUE),jieEntry(6,'巽','乾',null,JIE_KIND.TRUE,'FAN_FU_YIN'),jieEntry(6,'巳','亥',null,JIE_KIND.TRUE,'FAN_FU_YIN'),
    jieEntry(7,'壬','丙',6,JIE_KIND.TRUE),
    jieEntry(8,'子','午',7,JIE_KIND.TRUE),jieEntry(8,'癸','丁',7,JIE_KIND.TRUE),jieEntry(8,'庚','甲',4,JIE_KIND.TRUE),
    jieEntry(9,'壬','丙',null,JIE_KIND.TRUE,'FAN_FU_YIN'),jieEntry(9,'巽','乾',2,JIE_KIND.TRUE),jieEntry(9,'巳','亥',2,JIE_KIND.TRUE),jieEntry(9,'酉','卯',5,JIE_KIND.TRUE),jieEntry(9,'辛','乙',5,JIE_KIND.TRUE),
    // 원표의 「가타겁(假打劫)」. 이 단계에서는 입수(入囚)만 보정하며, 진가 타겁은 길흉 평가에 넣지 않는다.
    jieEntry(1,'卯','酉',5,JIE_KIND.FALSE),jieEntry(1,'乙','辛',5,JIE_KIND.FALSE),jieEntry(1,'乾','巽',8,JIE_KIND.FALSE),jieEntry(1,'亥','巳',8,JIE_KIND.FALSE),jieEntry(1,'丙','壬',null,JIE_KIND.FALSE,'FAN_FU_YIN'),
    jieEntry(2,'午','子',3,JIE_KIND.FALSE),jieEntry(2,'丁','癸',3,JIE_KIND.FALSE),jieEntry(2,'甲','庚',6,JIE_KIND.FALSE),
    jieEntry(3,'丙','壬',4,JIE_KIND.FALSE),
    jieEntry(4,'午','子',5,JIE_KIND.FALSE),jieEntry(4,'丁','癸',5,JIE_KIND.FALSE),jieEntry(4,'乾','巽',null,JIE_KIND.FALSE,'FAN_FU_YIN'),jieEntry(4,'亥','巳',null,JIE_KIND.FALSE,'FAN_FU_YIN'),
    jieEntry(6,'戌','辰',4,JIE_KIND.FALSE),jieEntry(6,'丙','壬',7,JIE_KIND.FALSE),
    jieEntry(7,'午','子',8,JIE_KIND.FALSE),jieEntry(7,'丁','癸',8,JIE_KIND.FALSE),
    jieEntry(8,'卯','酉',3,JIE_KIND.FALSE),jieEntry(8,'乙','辛',3,JIE_KIND.FALSE),jieEntry(8,'丙','壬',9,JIE_KIND.FALSE),
    jieEntry(9,'午','子',1,JIE_KIND.FALSE),jieEntry(9,'丁','癸',1,JIE_KIND.FALSE),jieEntry(9,'戌','辰',7,JIE_KIND.FALSE),jieEntry(9,'甲','庚',4,JIE_KIND.FALSE)
  ]);
  const PRODUCT_SCORING_V1=Object.freeze({version:'PRODUCT_SCORING_V1',source:'PRODUCT_INTERPRETATION',decisionOrder:Object.freeze(['CONSIDER','CAUTION','NOT_PRIORITY']),fullFanFuCap:'CAUTION',shangShanXiaShuiCap:'CAUTION',purchaseImminentCap:'NOT_PRIORITY'});

  const assertStar=value=>Number.isInteger(value)&&value>=1&&value<=9;
  function normalizeChart(chart){
    if(!chart||chart.valid===false)throw new Error('S급 분석에는 완성된 단일 택명반이 필요합니다');
    const normalized={housePeriod:chart.housePeriod??chart.period??chart.p,periodPlate:chart.periodPlate??chart.periodChart??chart.yun,mountainStarGrid:chart.mountainStarGrid??chart.mountainChart??chart.shan,facingStarGrid:chart.facingStarGrid??chart.facingChart??chart.xiang,
      facingMountain:chart.facingMountain??chart.facing,sittingMountain:chart.sittingMountain??chart.sitting,facingPalace:chart.facingPalace??chart.fPalace,sittingPalace:chart.sittingPalace??chart.sPalace,
      facingAngle:chart.facingAngle??chart.facingDegrees,sittingAngle:chart.sittingAngle??chart.sittingDegrees,calculationMethod:chart.calculationMethod??chart.mode,modeLabel:chart.modeLabel,trace:chart.trace};
    if(!Number.isInteger(normalized.housePeriod)||normalized.housePeriod<1||normalized.housePeriod>9)throw new Error('유효한 housePeriod 가 없습니다');
    for(const [name,grid] of [['periodPlate',normalized.periodPlate],['mountainStarGrid',normalized.mountainStarGrid],['facingStarGrid',normalized.facingStarGrid]])if(!Array.isArray(grid)||grid.length!==9||!grid.every(assertStar))throw new Error(`${name} 은(는) 완전한 구성반(九星盤)이어야 합니다`);
    if(!engine.GRID_PALACES.includes(normalized.sittingPalace)||!engine.GRID_PALACES.includes(normalized.facingPalace))throw new Error('좌향 궁위가 완전하지 않습니다');
    return normalized;
  }
  const valueAt=(grid,palace)=>grid[engine.GRID_PALACES.indexOf(palace)];
  function choosePrimary(flags){
    if(flags.isDoubleAtMountain)return PATTERN.DOUBLE_AT_MOUNTAIN;
    if(flags.isDoubleAtFacing)return PATTERN.DOUBLE_AT_FACING;
    if(flags.isWangShan&&flags.isWangXiang)return PATTERN.DAO_SHAN_DAO_XIANG;
    if(flags.isShangShan&&flags.isXiaShui)return PATTERN.SHANG_SHAN_XIA_SHUI;
    if(flags.isWangShan&&!flags.isWangXiang)return PATTERN.WANG_SHAN_ONLY;
    if(flags.isWangXiang&&!flags.isWangShan)return PATTERN.WANG_XIANG_ONLY;
    if(flags.isShangShan&&!flags.isXiaShui)return PATTERN.SHANG_SHAN_ONLY;
    if(flags.isXiaShui&&!flags.isShangShan)return PATTERN.XIA_SHUI_ONLY;
    return PATTERN.MIXED;
  }
  function analyzeCorePattern(input){
    const chart=normalizeChart(input),P=chart.housePeriod,mountainAtSitting=valueAt(chart.mountainStarGrid,chart.sittingPalace),facingAtSitting=valueAt(chart.facingStarGrid,chart.sittingPalace),mountainAtFacing=valueAt(chart.mountainStarGrid,chart.facingPalace),facingAtFacing=valueAt(chart.facingStarGrid,chart.facingPalace);
    const flags={isWangShan:mountainAtSitting===P,isWangXiang:facingAtFacing===P,isShangShan:facingAtSitting===P,isXiaShui:mountainAtFacing===P};
    flags.isDoubleAtMountain=flags.isWangShan&&flags.isShangShan;flags.isDoubleAtFacing=flags.isXiaShui&&flags.isWangXiang;
    const primaryPattern=choosePrimary(flags),secondaryFlags=Object.freeze(Object.entries(flags).filter(([,active])=>active).map(([name])=>name));
    return Object.freeze({rulingStar:P,mountainAtSitting,facingAtSitting,mountainAtFacing,facingAtFacing,...flags,primaryPattern,secondaryFlags,copy:PATTERN_COPY[primaryPattern],source:SOURCE_REGISTRY.CORE_PATTERN,
      trace:Object.freeze([`rulingStar = ${P}`,`mountainStar[${chart.sittingPalace}] = ${mountainAtSitting} → wangShan ${flags.isWangShan}`,`facingStar[${chart.facingPalace}] = ${facingAtFacing} → wangXiang ${flags.isWangXiang}`,`facingStar[${chart.sittingPalace}] = ${facingAtSitting} → shangShan ${flags.isShangShan}`,`mountainStar[${chart.facingPalace}] = ${mountainAtFacing} → xiaShui ${flags.isXiaShui}`,`primaryPattern = ${primaryPattern}`])});
  }
  function compareLayer(grid,target){return grid.every((value,index)=>value===target[index])}
  function localRelation(palace,type,leftValue,rightValue,chart){return Object.freeze({palace,type,relationType:type.includes('OPPOSITE')?'SUM_TO_TEN':'EQUALITY',leftValue,rightValue,starA:leftValue,starB:rightValue,scope:'LOCAL',severity:palace===chart.sittingPalace||palace===chart.facingPalace?'CORE':'PROFESSIONAL'})}
  const uniquePalaces=details=>Object.freeze([...new Set(details.map(item=>item.palace))]);
  function analyzeFanFuYin(input){
    const chart=normalizeChart(input),base=engine.GRID_PALACES.map(p=>engine.LUO_SHU_BASE[p]),opposite=engine.GRID_PALACES.map(p=>engine.LUO_SHU_OPPOSITE[p]);
    const mountainFullFuYin=compareLayer(chart.mountainStarGrid,base),facingFullFuYin=compareLayer(chart.facingStarGrid,base),mountainFullFanYin=compareLayer(chart.mountainStarGrid,opposite),facingFullFanYin=compareLayer(chart.facingStarGrid,opposite);
    const localFuYinDetails=[],localFanYinDetails=[];
    engine.GRID_PALACES.forEach((palace,index)=>{
      const mountain=chart.mountainStarGrid[index],facing=chart.facingStarGrid[index],period=chart.periodPlate[index],loshu=base[index];
      if(mountain===loshu)localFuYinDetails.push(localRelation(palace,'MOUNTAIN_VS_LOSHU',mountain,loshu,chart));
      if(facing===loshu)localFuYinDetails.push(localRelation(palace,'FACING_VS_LOSHU',facing,loshu,chart));
      if(mountain===period)localFuYinDetails.push(localRelation(palace,'MOUNTAIN_VS_PERIOD',mountain,period,chart));
      if(facing===period)localFuYinDetails.push(localRelation(palace,'FACING_VS_PERIOD',facing,period,chart));
      if(mountain===facing)localFuYinDetails.push(localRelation(palace,'MOUNTAIN_VS_FACING',mountain,facing,chart));
      // 「합십(合十)」은 국부적인 대대 관계로만 보존한다; 전체 반의 반음이나 이후의 합십 길격으로 간주하지 않는다.
      if(mountain!==loshu&&mountain+loshu===10)localFanYinDetails.push(localRelation(palace,'MOUNTAIN_VS_LOSHU_OPPOSITE',mountain,loshu,chart));
      if(facing!==loshu&&facing+loshu===10)localFanYinDetails.push(localRelation(palace,'FACING_VS_LOSHU_OPPOSITE',facing,loshu,chart));
      if(mountain!==period&&mountain+period===10)localFanYinDetails.push(localRelation(palace,'MOUNTAIN_VS_PERIOD_OPPOSITE',mountain,period,chart));
      if(facing!==period&&facing+period===10)localFanYinDetails.push(localRelation(palace,'FACING_VS_PERIOD_OPPOSITE',facing,period,chart));
      if(mountain!==facing&&mountain+facing===10)localFanYinDetails.push(localRelation(palace,'MOUNTAIN_VS_FACING_OPPOSITE',mountain,facing,chart));
    });
    const frozenFu=Object.freeze(localFuYinDetails),frozenFan=Object.freeze(localFanYinDetails),fullFuYin=mountainFullFuYin||facingFullFuYin,fullFanYin=mountainFullFanYin||facingFullFanYin,coreLocal=[...frozenFu,...frozenFan].some(item=>item.severity==='CORE');
    const riskLevel=fullFuYin||fullFanYin?'SEVERE':coreLocal?'HIGH':frozenFu.length||frozenFan.length?'WATCH':'NONE';
    const localFuYinPalaces=Object.freeze({mountain:uniquePalaces(frozenFu.filter(item=>item.type.startsWith('MOUNTAIN_'))),facing:uniquePalaces(frozenFu.filter(item=>item.type.startsWith('FACING_'))),all:uniquePalaces(frozenFu)}),localFanYinPalaces=Object.freeze({mountain:uniquePalaces(frozenFan.filter(item=>item.type.startsWith('MOUNTAIN_'))),facing:uniquePalaces(frozenFan.filter(item=>item.type.startsWith('FACING_'))),all:uniquePalaces(frozenFan)});
    return Object.freeze({mountainFullFanYin,mountainFullFuYin,facingFullFanYin,facingFullFuYin,fullFanYin,fullFuYin,full:Object.freeze({mountainFullFanYin,mountainFullFuYin,facingFullFanYin,facingFullFuYin,fullFanYin,fullFuYin}),localFanYinDetails:frozenFan,localFuYinDetails:frozenFu,localFanYinPalaces,localFuYinPalaces,scope:fullFanYin||fullFuYin?'FULL':riskLevel==='NONE'?'NONE':'LOCAL',riskLevel,needsFormValidation:riskLevel!=='NONE',source:SOURCE_REGISTRY.FAN_FU_YIN,
      trace:Object.freeze({luoShuBase:base,luoShuOpposite:opposite,periodLayer:[...chart.periodPlate],mountainLayer:[...chart.mountainStarGrid],facingLayer:[...chart.facingStarGrid],comparison:'FULL：山／向星層逐宮比對洛書元旦盤與五入中逆飛盤；LOCAL：逐宮保留洛書、運盤、山盤、向盤的相同與合十對待關係'})});
  }
  function earthLuckStatus(remaining){if(remaining<=0)return 'IMPRISONED';if(remaining<=5)return 'IMMINENT';if(remaining<=10)return 'NEAR';if(remaining<=20)return 'WATCH';if(remaining<40)return 'MEDIUM_LONG';return 'LONG'}
  const periodSteps=(fromPeriod,toPeriod)=>((toPeriod-fromPeriod+9)%9)||9;
  function calculateEarthLuck(input,options={}){
    const chart=normalizeChart(input),establishedYear=Number(options.establishedYear??input.year),currentYear=Number(options.currentYear??new Date().getFullYear());
    if(!Number.isFinite(establishedYear)||!Number.isFinite(currentYear))throw new Error('지운 계산에는 유효한 성립 연도와 현재 연도가 필요합니다');
    const housePeriod=chart.housePeriod,range=engine.periodRange(establishedYear,housePeriod),housePeriodStartYear=range[0],housePeriodEndYear=range[1],facingParentStar=valueAt(chart.periodPlate,chart.facingPalace),periodSteps=((facingParentStar-housePeriod+9)%9)||9,theoreticalEarthLuckYears=periodSteps*20,oracleYears=EARTH_LUCK_ORACLE[chart.facingMountain];
    if(!oracleYears)throw new Error(`지운 교정표에 향수 ${chart.facingMountain} 이(가) 없습니다`);
    if(theoreticalEarthLuckYears!==oracleYears)throw new Error(`지운 연산이 심씨 교정표와 맞지 않습니다: ${chart.facingMountain}향 연산 ${theoreticalEarthLuckYears}년, 교정 ${oracleYears}년`);
    const imprisonmentPeriod=facingParentStar,imprisonmentCycle=Math.floor((housePeriodStartYear-1864)/180)+(facingParentStar<=housePeriod?1:0),imprisonmentStartYear=housePeriodStartYear+theoreticalEarthLuckYears,yearsFromEstablishmentToImprisonment=imprisonmentStartYear-establisedSafe(establishedYear),earthLuckRemainingYears=imprisonmentStartYear-currentYear,status=earthLuckStatus(earthLuckRemainingYears);
    return Object.freeze({imprisonmentType:IMPRISONMENT_TYPE.STANDARD_FUTURE,theoreticalEarthLuckYears,oracleYears,oracleMatches:true,facingParentStar,imprisonmentPeriod,imprisonmentCycle,housePeriodStartYear,housePeriodEndYear,imprisonmentStartYear,yearsFromEstablishmentToImprisonment,earthLuckRemainingYears,status,mitigationStatus:options.mitigationStatus||'UNKNOWN',specialCasePending:false,source:SOURCE_REGISTRY.EARTH_LUCK,oracleSource:SOURCE_REGISTRY.EARTH_LUCK_ORACLE,
      trace:Object.freeze([`housePeriod = ${housePeriod} (${housePeriodStartYear}–${housePeriodEndYear})`,`periodPlate[${chart.facingPalace}] = ${facingParentStar}`,`향상 부모 운성 ${facingParentStar} 이(가) 다음 ${facingParentStar} 운에 입중`,`periodSteps = ${periodSteps} → ${theoreticalEarthLuckYears} 년`,`imprisonmentStartYear = ${imprisonmentStartYear}`,`remainingYears(${currentYear}) = ${earthLuckRemainingYears}`])});
  }
  function establisedSafe(year){return Math.trunc(year)}
  function calculateQiXingCurrentImprisonment(input,options={}){
    const chart=normalizeChart(input),establishedYear=Number(options.establishedYear??input.year),isQiXing=['replacement','qiXing','替卦','起星'].includes(chart.calculationMethod),mountainCenterStar=valueAt(chart.mountainStarGrid,'C'),facingCenterStar=valueAt(chart.facingStarGrid,'C'),mountainStarImprisonedNow=isQiXing&&mountainCenterStar===chart.housePeriod,facingStarImprisonedNow=isQiXing&&facingCenterStar===chart.housePeriod;
    const imprisonmentType=mountainStarImprisonedNow&&facingStarImprisonedNow?IMPRISONMENT_TYPE.QI_XING_BOTH_CURRENT:mountainStarImprisonedNow?IMPRISONMENT_TYPE.QI_XING_MOUNTAIN_CURRENT:facingStarImprisonedNow?IMPRISONMENT_TYPE.QI_XING_FACING_CURRENT:IMPRISONMENT_TYPE.NONE;
    return Object.freeze({applicable:isQiXing,imprisonmentType,mountainCenterStar,facingCenterStar,mountainStarImprisonedNow,facingStarImprisonedNow,imprisonmentPeriod:imprisonmentType===IMPRISONMENT_TYPE.NONE?null:chart.housePeriod,imprisonmentStartYear:imprisonmentType===IMPRISONMENT_TYPE.NONE?null:establisedSafe(establishedYear),status:imprisonmentType===IMPRISONMENT_TYPE.NONE?'NONE':'IMPRISONED',source:SOURCE_REGISTRY.QI_XING_IMPRISONMENT,
      trace:Object.freeze([`calculationMethod = ${chart.calculationMethod}`,`mountainStar[C] = ${mountainCenterStar}; rulingStar = ${chart.housePeriod} → mountain current imprisonment ${mountainStarImprisonedNow}`,`facingStar[C] = ${facingCenterStar}; rulingStar = ${chart.housePeriod} → facing current imprisonment ${facingStarImprisonedNow}`])});
  }
  function calculateSpecialImprisonment(input,options={}){
    const chart=normalizeChart(input),currentYear=Number(options.currentYear??new Date().getFullYear()),establishedYear=Number(options.establishedYear??input.year),pattern=options.pattern||analyzeCorePattern(chart),entry=SHEN_SEVEN_STAR_IMPRISONMENT_TABLE.find(row=>row.housePeriod===chart.housePeriod&&row.sittingMountain===chart.sittingMountain&&row.facingMountain===chart.facingMountain),isDoubleAtFacing=pattern.isDoubleAtFacing??pattern.doubleAtFacing,tableMatched=Boolean(entry),applicable=Boolean(entry&&!entry.exclusion&&isDoubleAtFacing);
    if(!applicable)return Object.freeze({applicable:false,type:SPECIAL_IMPRISONMENT_TYPE.NONE,tableMatched,isDoubleAtFacing,excludedBy:entry?.exclusion||null,imprisonmentPeriod:null,imprisonmentStartYear:null,status:'NONE',remainingYears:null,source:SOURCE_REGISTRY.SEVEN_STAR_IMPRISONMENT,tableEntry:entry||null,trace:Object.freeze([`tableKey = ${chart.housePeriod}:${chart.sittingMountain}:${chart.facingMountain}`,`tableMatched = ${tableMatched}`,`doubleAtFacing = ${isDoubleAtFacing}`,`excludedBy = ${entry?.exclusion||'NONE'}`])});
    const range=engine.periodRange(establishedYear,chart.housePeriod),imprisonmentStartYear=range[0]+periodSteps(chart.housePeriod,entry.imprisonmentPeriod)*20,remainingYears=imprisonmentStartYear-currentYear,status=earthLuckStatus(remainingYears);
    return Object.freeze({applicable:true,type:SPECIAL_IMPRISONMENT_TYPE.KAN_LI_JIE_YUN,tableMatched:true,isDoubleAtFacing:true,jieKind:entry.kind,imprisonmentPeriod:entry.imprisonmentPeriod,imprisonmentStartYear,status,remainingYears,source:SOURCE_REGISTRY.SEVEN_STAR_IMPRISONMENT,tableEntry:entry,
      trace:Object.freeze([`tableKey = ${chart.housePeriod}:${chart.sittingMountain}:${chart.facingMountain}`,`doubleAtFacing = true`,`심씨 ${entry.kind===JIE_KIND.TRUE?'진(真)':'가(假)'}타겁표 → ${entry.imprisonmentPeriod}운 입수`,`imprisonmentStartYear = ${imprisonmentStartYear}`])});
  }
  function resolveEffectiveImprisonment(standard,qiXing,special){
    if(qiXing.imprisonmentType!==IMPRISONMENT_TYPE.NONE)return Object.freeze({sourceLayer:'qiXing',imprisonmentType:qiXing.imprisonmentType,imprisonmentPeriod:qiXing.imprisonmentPeriod,imprisonmentStartYear:qiXing.imprisonmentStartYear,status:'IMPRISONED',remainingYears:0,mountainStarImprisonedNow:qiXing.mountainStarImprisonedNow,facingStarImprisonedNow:qiXing.facingStarImprisonedNow,source:qiXing.source});
    if(special.applicable)return Object.freeze({sourceLayer:'special',imprisonmentType:IMPRISONMENT_TYPE.SPECIAL_JIE_YUN,specialType:special.type,imprisonmentPeriod:special.imprisonmentPeriod,imprisonmentStartYear:special.imprisonmentStartYear,status:special.status,remainingYears:special.remainingYears,mountainStarImprisonedNow:false,facingStarImprisonedNow:false,source:special.source});
    return Object.freeze({sourceLayer:'standard',imprisonmentType:IMPRISONMENT_TYPE.STANDARD_FUTURE,imprisonmentPeriod:standard.imprisonmentPeriod,imprisonmentStartYear:standard.imprisonmentStartYear,status:standard.status,remainingYears:standard.earthLuckRemainingYears,mountainStarImprisonedNow:false,facingStarImprisonedNow:false,source:standard.source});
  }
  function assessPrisonMitigation(input,placements={},options={}){
    const chart=normalizeChart(input),fiveIndex=chart.facingStarGrid.indexOf(5),fivePalace=engine.GRID_PALACES[fiveIndex],airItems=new Set(['大門','次要門','道路','走道／通道','陽台','窗戶','天井／採光井']),evidence=(placements[fivePalace]||[]).filter(item=>airItems.has(item));
    return Object.freeze({status:evidence.length?'EVIDENCE_PRESENT':options.confirmedAbsent?'EVIDENCE_ABSENT_CONFIRMED':'UNKNOWN',fiveYellowPalace:fivePalace,evidence:Object.freeze(evidence),note:evidence.length?'「가두지 못함(囚不住)」을 이룰 수 있는 문길이나 납기 자료가 보입니다. 그래도 입수가 완전히 해제됐다는 뜻은 아닙니다.':'자료가 부족하면 UNKNOWN 을 유지하며, 표시되지 않은 것을 없는 것으로 여겨서는 안 됩니다.'});
  }
  function patternQuality(pattern,risk){if(risk.riskLevel==='SEVERE')return 'CAUTION';if(pattern.isShangShan&&pattern.isXiaShui)return 'CAUTION';if(pattern.isWangShan&&pattern.isWangXiang)return 'FAVORABLE';return 'MIXED'}
  function buildDecision(pattern,risk,earth,originalPeriodActive,type){
    let code='CAUTION',reasons=[];
    if(pattern.isWangShan&&pattern.isWangXiang){code='CONSIDER';reasons.push(originalPeriodActive?'원국이 왕산왕향이며 아직 원래 운 안':'성립 시 왕산왕향이었으나 지금은 원래 운을 벗어남')}
    if(pattern.isShangShan&&pattern.isXiaShui){code='CAUTION';reasons.push('상산하수는 실제 외부 형국을 우선 검토해야 함')}
    if(risk.riskLevel==='SEVERE'){code=type==='purchase'?'NOT_PRIORITY':'CAUTION';reasons.push('완전한 반음／복음의 중대 반국 경고가 있음')}
    else if(risk.riskLevel==='HIGH'){if(code==='CONSIDER')code='CAUTION';reasons.push('좌산이나 향수 핵심궁에 국부 반음／복음 관계가 있음')}
    if(type==='rental'){
      if(['IMMINENT','IMPRISONED'].includes(earth.status)){if(code==='CONSIDER')code='CAUTION';reasons.push('입수가 가깝거나 이미 입수기에 들어섬')}
      else reasons.push('단기 임대는 먼 지운에 대한 비중이 비교적 낮음');
    }else{
      if(['IMMINENT','IMPRISONED'].includes(earth.status)){code='NOT_PRIORITY';reasons.push('장기 보유는 가까운／이미 진행된 입수 위험을 높게 반영해야 함')}
      else if(earth.status==='NEAR'){if(code==='CONSIDER')code='CAUTION';reasons.push('이론상 입수까지 6~10년만 남음')}
      else reasons.push('지운 잔여 햇수를 장기 보유 판단에 반영함');
    }
    const labels={CONSIDER:'고려 가능',CAUTION:'신중 필요',NOT_PRIORITY:'우선순위 아님'};
    return Object.freeze({code,label:`현공 풍수 관점: ${labels[code]}`,reasons:Object.freeze(reasons),scope:type,source:SOURCE_REGISTRY.PRODUCT_DECISION});
  }
  function analyzeSLevel(input,options={}){
    const chart=normalizeChart(input),establishedYear=Number(options.establishedYear??input.year),currentYear=Number(options.currentYear??new Date().getFullYear()),currentPeriod=engine.periodForYear(currentYear),houseRange=engine.periodRange(establishedYear,chart.housePeriod),originalPeriodActive=currentYear>=houseRange[0]&&currentYear<=houseRange[1],pattern=analyzeCorePattern(chart),fanFuYin=analyzeFanFuYin(chart),mitigation=assessPrisonMitigation(chart,options.placements||{},options.mitigation||{}),earthLuck=calculateEarthLuck(chart,{establishedYear,currentYear,mitigationStatus:mitigation.status}),qiXing=calculateQiXingCurrentImprisonment(chart,{establishedYear,currentYear}),special=calculateSpecialImprisonment(chart,{establishedYear,currentYear,pattern}),effective=resolveEffectiveImprisonment(earthLuck,qiXing,special),imprisonment=Object.freeze({standard:earthLuck,qiXing,special,effective}),rentalAssessment=buildDecision(pattern,fanFuYin,effective,originalPeriodActive,'rental'),purchaseAssessment=buildDecision(pattern,fanFuYin,effective,originalPeriodActive,'purchase');
    return Object.freeze({version:VERSION,housePeriod:chart.housePeriod,currentPeriod,establishedYear,currentYear,originalPeriodActive,rulingStar:chart.housePeriod,sitting:Object.freeze({mountain:chart.sittingMountain,palace:chart.sittingPalace,mountainStar:pattern.mountainAtSitting,facingStar:pattern.facingAtSitting,angle:chart.sittingAngle}),facing:Object.freeze({mountain:chart.facingMountain,palace:chart.facingPalace,mountainStar:pattern.mountainAtFacing,facingStar:pattern.facingAtFacing,angle:chart.facingAngle}),calculationMethod:chart.calculationMethod,periodPlate:Object.freeze([...chart.periodPlate]),mountainStarGrid:Object.freeze([...chart.mountainStarGrid]),facingStarGrid:Object.freeze([...chart.facingStarGrid]),pattern:Object.freeze({primary:pattern.primaryPattern,copy:pattern.copy,wangShan:pattern.isWangShan,wangXiang:pattern.isWangXiang,shangShan:pattern.isShangShan,xiaShui:pattern.isXiaShui,doubleAtMountain:pattern.isDoubleAtMountain,doubleAtFacing:pattern.isDoubleAtFacing,secondaryFlags:pattern.secondaryFlags}),natalPattern:pattern.primaryPattern,patternQuality:patternQuality(pattern,fanFuYin),fanFuYin,specialRiskLevel:fanFuYin.riskLevel,earthLuck,imprisonment,prisonMitigation:mitigation,rentalAssessment,purchaseAssessment,productConfig:PRODUCT_SCORING_V1,sources:SOURCE_REGISTRY,
      trace:Object.freeze({chart:chart.trace,corePattern:pattern.trace,fanFuYin:Object.freeze({full:fanFuYin.full,local:Object.freeze([...fanFuYin.localFuYinDetails,...fanFuYin.localFanYinDetails]),raw:fanFuYin.trace}),earthLuck:earthLuck.trace,imprisonment:Object.freeze({standard:earthLuck.trace,qiXing:qiXing.trace,special:special.trace,effective})})});
  }
  return Object.freeze({VERSION,SOURCE_LEVEL,FORMAL_SOURCE_LEVELS,SOURCE_REGISTRY,PATTERN,PATTERN_COPY,EARTH_LUCK_ORACLE,IMPRISONMENT_TYPE,SPECIAL_IMPRISONMENT_TYPE,JIE_KIND,SHEN_SEVEN_STAR_IMPRISONMENT_TABLE,PRODUCT_SCORING_V1,normalizeChart,analyzeCorePattern,analyzeFanFuYin,earthLuckStatus,calculateEarthLuck,calculateQiXingCurrentImprisonment,calculateSpecialImprisonment,resolveEffectiveImprisonment,assessPrisonMitigation,analyzeSLevel});
});
