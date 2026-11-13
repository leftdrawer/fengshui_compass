/* 재운／도화 인연／문창: 순수 함수, DOM 없음, LLM 없음. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.XuanKongGoalDirections=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const PALACES=Object.freeze(['SE','S','SW','E','C','W','NE','N','NW']);
  const PALACE_META=Object.freeze({
    N:Object.freeze({direction:'북쪽',gua:'감궁(坎宮)',degreeRange:'337.5°–22.5°'}),
    NE:Object.freeze({direction:'북동쪽',gua:'간궁(艮宮)',degreeRange:'22.5°–67.5°'}),
    E:Object.freeze({direction:'동쪽',gua:'진궁(震宮)',degreeRange:'67.5°–112.5°'}),
    SE:Object.freeze({direction:'남동쪽',gua:'손궁(巽宮)',degreeRange:'112.5°–157.5°'}),
    S:Object.freeze({direction:'남쪽',gua:'이궁(離宮)',degreeRange:'157.5°–202.5°'}),
    SW:Object.freeze({direction:'남서쪽',gua:'곤궁(坤宮)',degreeRange:'202.5°–247.5°'}),
    W:Object.freeze({direction:'서쪽',gua:'태궁(兌宮)',degreeRange:'247.5°–292.5°'}),
    NW:Object.freeze({direction:'북서쪽',gua:'건궁(乾宮)',degreeRange:'292.5°–337.5°'}),
    C:Object.freeze({direction:'주택 중앙',gua:'중궁(中宮)',degreeRange:null})
  });
  const AUTHORITY=Object.freeze({SHEN_CORE:'SHEN_CORE',SHEN_DERIVED:'SHEN_DERIVED',LATER_PURPLE_WHITE:'LATER_PURPLE_WHITE',FOLK_CUSTOM:'FOLK_CUSTOM'});
  const PLACE_PRIORITY=Object.freeze({
    wealth:Object.freeze(['大門','次要門','客廳','工作室','書房','書桌／工作位','辦公桌','陽台','窗戶','空曠處']),
    relationship:Object.freeze(['客廳','玄關','餐廳','主臥室','書房','陽台']),
    wenchang:Object.freeze(['書房','書桌／工作位','辦公桌','工作室','兒童房'])
  });
  const unique=list=>[...new Set((list||[]).filter(Boolean))];
  function koJosa(word,pair){const text=String(word??'');let jong=-1;for(let i=text.length-1;i>=0;i--){const code=text.charCodeAt(i);if(code>=0xAC00&&code<=0xD7A3){jong=(code-0xAC00)%28;break}if(code>=48&&code<=57){jong=[21,8,0,16,0,0,7,8,8,0][code-48];break}}if(jong<0)jong=0;const has=jong!==0;return pair==='은는'?(has?'은':'는'):pair==='이가'?(has?'이':'가'):pair==='을를'?(has?'을':'를'):pair==='과와'?(has?'과':'와'):pair==='으로'?((has&&jong!==8)?'으로':'로'):''}
  const koWith=(word,pair)=>`${word}${koJosa(word,pair)}`;
  const ITEM_KO={'大門':'대문','次要門':'보조문','客廳':'거실','工作室':'작업실','書房':'서재','書桌／工作位':'책상','辦公桌':'사무 책상','陽台':'발코니','窗戶':'창문','空曠處':'빈터','玄關':'현관','餐廳':'식당','主臥室':'안방','兒童房':'아이방','收銀／辦公位':'계산대'};
  const koPlaces=list=>list.map(item=>ITEM_KO[item]||item);
  const assertGrid=(grid,name)=>{if(!Array.isArray(grid)||grid.length!==9||!grid.every(star=>Number.isInteger(star)&&star>=1&&star<=9))throw new TypeError(`${koWith(name,'은는')} 완전한 구성반이어야 합니다`)};
  const assertStarGrid=(grid,name)=>{if(!grid||!PALACES.every(palace=>Number.isInteger(grid[palace])&&grid[palace]>=1&&grid[palace]<=9))throw new TypeError(`${koWith(name,'은는')} 완전한 구궁 성반이어야 합니다`)};
  const palaceForArrayStar=(grid,star)=>PALACES[grid.indexOf(Number(star))];
  const palaceForObjectStar=(grid,star)=>PALACES.find(palace=>grid[palace]===Number(star));
  const itemsForPalace=(placements,palace)=>unique(Array.isArray(placements?.[palace])?placements[palace]:[]);
  const mappedPlaces=(placements,palace,type)=>PLACE_PRIORITY[type].filter(item=>itemsForPalace(placements,palace).includes(item)).slice(0,2);
  const palaceResult=palace=>Object.freeze({palace,direction:PALACE_META[palace].direction,gua:PALACE_META[palace].gua,degreeRange:PALACE_META[palace].degreeRange});
  const authority=(level,book,section,note)=>Object.freeze({level,book,section,note});
  const ACTION_SCENARIOS=Object.freeze({
    wealth:Object.freeze({RECOVERY:'WEALTH_RECOVERY',OPPORTUNITY:'WEALTH_OPPORTUNITY',PROTECTION:'WEALTH_PROTECTION'}),
    relationship:Object.freeze({MEET:'MEET_NEW_PEOPLE',FILTER:'FILTER_BAD_MATCHES',STABLE:'STABLE_RELATIONSHIP',REDUCE:'REDUCE_ROMANCE'}),
    wenchang:Object.freeze({FOCUS:'FOCUS',EXAM:'EXAM',WORK:'WORK_RESEARCH',DESK_FIXED:'DESK_FIXED'})
  });
  const guide=(scenario,title,steps)=>Object.freeze({scenario,title,steps:Object.freeze(steps.map(step=>Object.freeze(step)))});
  const goalLocation=goal=>goal.mappedPlaces?.length?`${goal.direction} · ${koPlaces(goal.mappedPlaces).join('·')}`:goal.direction;
  const hasAny=(items,names)=>names.some(name=>items.includes(name));

  function analyzeWealthDirection({facingStarGrid,currentPeriod,annualStarGrid,placements={}}){
    assertGrid(facingStarGrid,'facingStarGrid');assertStarGrid(annualStarGrid,'annualStarGrid');
    if(!Number.isInteger(Number(currentPeriod))||Number(currentPeriod)<1||Number(currentPeriod)>9)throw new TypeError('currentPeriod 는 1–9 사이여야 합니다');
    const primaryPalace=palaceForArrayStar(facingStarGrid,currentPeriod),annualProsperityPalace=palaceForObjectStar(annualStarGrid,currentPeriod),places=mappedPlaces(placements,primaryPalace,'wealth'),annualSupport=primaryPalace===annualProsperityPalace;
    return Object.freeze({...palaceResult(primaryPalace),primaryPalace,currentPeriod:Number(currentPeriod),mappedPlaces:Object.freeze(places),practicalAdvice:places.length?`여기에는 이미 ${koWith(koPlaces(places).join('·'),'이가')} 있어서, 트이게 두고 평소처럼 쓰기를 늘리기 좋습니다.`:'트이고 통하게 두며, 평소처럼 쓰기에 알맞습니다.',annualSupport:Object.freeze({...palaceResult(annualProsperityPalace),palace:annualProsperityPalace,matched:annualSupport,authority:authority(AUTHORITY.SHEN_DERIVED,'《심씨현공학(沈氏玄空學)》／《현공집요(玄空輯要)》','연 자백표와 당운 영성','유년 동성(同星)은 그해의 강화로만 쓰며 택명반을 대신하지 않습니다.')}),utilizationConfidence:places.length?'EVIDENCE_PRESENT':'UNKNOWN',authority:authority(AUTHORITY.SHEN_CORE,'《심씨현공학(沈氏玄空學)》','향수／향성 관련 규칙 논함','실제 택명반 향성 층에서 현재 원운 영성이 있는 궁을 찾습니다. 올해 동성은 둘째 층의 강화로만 씁니다.'),folkAuthority:authority(AUTHORITY.FOLK_CUSTOM,'현대 민속 실무','재물 상징 배치','생활화 참고일 뿐 심씨 핵심 규칙이 아닙니다.'),folkSuggestions:Object.freeze(['구역을 정갈하고 밝게 유지','저축을 상징하는 소품이나 건강한 넓은 잎 식물을 둘 수 있음']),waterCaution:'물은 현공에서 향성과 실제 환경을 따로 맞춰 판단해야 하며, 재운 방향이라는 이유만으로 여기에 물을 두는 것은 권하지 않습니다.'});
  }

  function analyzeRelationshipReference({annualStarGrid,placements={}}){
    assertStarGrid(annualStarGrid,'annualStarGrid');
    const primaryPalace=palaceForObjectStar(annualStarGrid,1),celebrationPalace=palaceForObjectStar(annualStarGrid,9),places=mappedPlaces(placements,primaryPalace,'relationship');
    return Object.freeze({...palaceResult(primaryPalace),primaryPalace,mappedPlaces:Object.freeze(places),practicalAdvice:places.length?`${koWith(koPlaces(places).join('·'),'이가')} 올해의 인연 참고 구역에 있어서, 밝고 정갈하게 두고 평소처럼 쓸 수 있습니다.`:'밝고 정갈하게 두어, 일상이나 사람을 만나는 공간으로 쓰기에 알맞습니다.',authority:authority(AUTHORITY.LATER_PURPLE_WHITE,'후세 자백 응용','유년 일백 인연·도화','일백을 인연／도화로 보는 것은 후세에 흔히 쓰는 확장이며 《심씨현공학(沈氏玄空學)》의 택 판단 핵심이 아닙니다.'),celebration:Object.freeze({...palaceResult(celebrationPalace),palace:celebrationPalace,authority:authority(AUTHORITY.LATER_PURPLE_WHITE,'후세 자백 응용','유년 구자 경사·혼인','구자를 경사·혼인 참고로 보는 것은 후세의 확장입니다.')}),folkAuthority:authority(AUTHORITY.FOLK_CUSTOM,'현대 민속 실무','인연·도화 배치','생활화 참고일 뿐 감정 결과를 보장하지 않습니다.'),folkSuggestions:Object.freeze(['생화','짝을 이룬 소품','따뜻한 색이나 분홍색 작은 장식'])});
  }

  function analyzeWenchangDirection({annualStarGrid,monthlyStarGrid,placements={}}){
    assertStarGrid(annualStarGrid,'annualStarGrid');assertStarGrid(monthlyStarGrid,'monthlyStarGrid');
    const primaryPalace=palaceForObjectStar(annualStarGrid,4),monthlyFourPalace=palaceForObjectStar(monthlyStarGrid,4),places=mappedPlaces(placements,primaryPalace,'wenchang'),deskHere=places.some(item=>['書桌／工作位','辦公桌'].includes(item)),deskElsewhere=PALACES.some(palace=>palace!==primaryPalace&&itemsForPalace(placements,palace).some(item=>['書桌／工作位','辦公桌'].includes(item)));
    return Object.freeze({...palaceResult(primaryPalace),primaryPalace,mappedPlaces:Object.freeze(places),practicalAdvice:deskHere?'지금 책상이 이미 추천 구역에 있어 유지할 수 있습니다.':deskElsewhere?'여유가 되면 여기에 독서·집필·업무를 우선 배치할 수 있습니다.':'독서·집필·시험 준비에 알맞습니다.',authority:authority(AUTHORITY.LATER_PURPLE_WHITE,'후세 자백 응용','유년 사록 문창','사록을 문창으로 보는 것은 후세 자백에서 흔히 쓰는 확장입니다. 본 버전은 이를 심씨 본명 일사동궁(一四同宮)으로 가장하지 않습니다.'),annualFour:Object.freeze({...palaceResult(primaryPalace),palace:primaryPalace,authority:authority(AUTHORITY.LATER_PURPLE_WHITE,'후세 자백 응용','유년 사록 문창','유년 사록을 독서와 시험 참고로 봅니다.')}),monthlyFour:Object.freeze({...palaceResult(monthlyFourPalace),palace:monthlyFourPalace,authority:authority(AUTHORITY.LATER_PURPLE_WHITE,'후세 자백 응용','유월 사록 문창','단기 참고로만 쓰며 매달 책상을 옮기는 것은 권하지 않습니다.')}),natalYiSi:Object.freeze({verified:false,implemented:false,authority:AUTHORITY.SHEN_CORE,note:'프로젝트 내에 《심씨(沈氏)》〈일사동궁 논함〉의 정식 비교 성층(星層) 원문 조건을 확인할 자료가 아직 없어, 본 버전은 본명 일사동궁 판정을 하지 않습니다.'}),folkAuthority:authority(AUTHORITY.FOLK_CUSTOM,'현대 민속 실무','문창 배치','생활화 참고일 뿐 심씨 핵심 규칙이 아닙니다.'),folkSuggestions:Object.freeze(['부귀죽 네 줄기','붓걸이나 붓','문창탑'])});
  }

  function buildWealthActionGuide({goal,placements={},scenario=ACTION_SCENARIOS.wealth.RECOVERY,houseContext={}}={}){
    if(!goal?.primaryPalace)throw new TypeError('재운 행동 안내에는 goal 이 필요합니다');
    const items=itemsForPalace(placements,goal.primaryPalace),location=goalLocation(goal),workHere=hasAny(items,['工作室','書房','書桌／工作位','辦公桌','收銀／辦公位']),fixedUse=hasAny(items,['廁所','浴室','儲藏室']),blocked=hasAny(items,['衣櫃','鞋櫃','高樓','樹木','柱','橫樑']),annual=goal.annualSupport?.matched;
    const useStep=blocked?'먼저 옮길 수 있는 높은 장이나 잡동사니를 치워 주요 통로와 개구부를 트이게 유지하세요.':workHere?'여기에는 이미 작업 자리가 있어, 일·수주·재무·중요 결정을 처리하는 데 많이 쓸 수 있습니다.':fixedUse?'여기는 고정 용도이니 억지로 격국을 뜯을 필요가 없습니다. 일과 주요 활동은 조건이 더 좋은 다른 구역에 우선 배치하세요.':'먼저 이 방향을 트이고 통하게 유지하고, 큰 가구로 완전히 막지 마세요.';
    if(scenario===ACTION_SCENARIOS.wealth.PROTECTION)return guide(scenario,'돈을 지키고 손실을 줄이고 싶을 때',[
      {title:'먼저 장기 위험을 본다',body:houseContext.hasMajorFinancialRisk?'택반에 보수적으로 다뤄야 할 장기 조건이 있어, 큰 지출과 장기 보유는 더 비교하는 것이 좋습니다.':'지금 자료로는 추가로 키울 만한 중대 재무 경고가 보이지 않습니다.'},
      {title:'지나치게 촉동하지 않는다',body:'단기 운세가 비교적 좋을 때도 이 구역을 일부러 시끄럽거나 자주 바꾸게 만들 필요가 없습니다.'},
      {title:'쓸 수 있게만 유지',body:`주요 재운 왕기는 ${location}에 있습니다. 통하게 유지하고 정상적으로 쓰면 됩니다.`},
      {title:'큰 수경을 함부로 두지 않는다',body:'어항·흐르는 물·큰 수경은 택반과 환경에 따로 맞춰야 하며, 여기가 재운 방향이라는 이유만으로 두는 것은 권하지 않습니다.'},
      {title:'사용에 중점을 둔다',body:'먼저 동선과 작업 자리를 정리하세요. 길상물을 쌓을 필요는 없습니다.'}
    ]);
    if(scenario===ACTION_SCENARIOS.wealth.OPPORTUNITY)return guide(scenario,'일／돈 기회를 늘리고 싶을 때',[
      {title:'먼저 위치를 찾는다',body:`지금 집의 주요 재운 왕기는 ${location}에 있습니다.`},
      {title:'실제 사용을 배치',body:workHere?'여기에는 이미 작업 자리가 있어, 일·제안·수주·중요 결정을 우선 처리할 수 있습니다.':'작업 책상이나 자주 쓰는 작업 구역이 있으면 이 구역에 우선 배치할 수 있습니다.'},
      {title:'통로를 정리',body:useStep},
      {title:'올해는 어떻게 보나',body:annual?'올해 이 방향이 다시 강해져서, 우선 활용할 수 있습니다.':`오래 쓸 자리는 먼저 ${koWith(goal.direction,'을를')} 보세요. 올해 잠시 강해지는 위치는 ${goal.annualSupport.direction}입니다.`}
    ]);
    return guide(ACTION_SCENARIOS.wealth.RECOVERY,'요즘 재운이 아주 나쁠 때',[
      {title:'먼저 위치를 찾는다',body:`지금 집의 주요 재운 왕기는 ${location}에 있습니다.`},
      {title:'쓸 수 있는지 먼저 확인',body:useStep},
      {title:'다음으로 올해를 본다',body:annual?'올해 이 방향이 다시 강화돼 우선 활용할 수 있습니다.':`본명 장기 방향은 ${goal.direction}이고, 올해 단기 강화는 ${goal.annualSupport.direction}입니다. 장기 사용은 여전히 본명 방향을 먼저 봅니다.`},
      {title:'마지막에야 배치를 본다',body:'의례감을 더하고 싶으면 건강한 식물이나 저축을 상징하는 소품을 둘 수 있습니다. 공간 사용이 배치를 사는 것보다 여전히 중요합니다.'}
    ]);
  }

  function buildRelationshipActionGuide({goal,placements={},scenario=ACTION_SCENARIOS.relationship.MEET}={}){
    if(!goal?.primaryPalace)throw new TypeError('도화 행동 안내에는 goal 이 필요합니다');
    const items=itemsForPalace(placements,goal.primaryPalace),location=goalLocation(goal),social=hasAny(items,['客廳','玄關','餐廳','陽台']),bedroomPalace=PALACES.find(palace=>hasAny(itemsForPalace(placements,palace),['主臥室','床位']));
    if(scenario===ACTION_SCENARIOS.relationship.FILTER)return guide(scenario,'늘 맞지 않는 사람을 만날 때',[
      {title:'먼저 목표를 바꾼다',body:'지금은 관계의 질을 높일 때이지 아는 사람 수를 늘릴 때가 아닙니다.'},
      {title:'도화 자리는 정상 사용',body:`올해 인연 위치는 ${location}에 있으며 일부러 더 강화할 필요가 없습니다.`},
      {title:'안정 관계로 전환',body:`중점을 ${goal.celebration.direction}의 경사·안정 관계 참고로 옮기세요. 이는 후세 자백 용법입니다.`},
      {title:'먼저 장기 공간을 처리',body:bedroomPalace?`안방이나 침대가 이미 ${PALACE_META[bedroomPalace].direction}에 표시돼 있으니, 침대와 장기 휴식 조건을 우선 비교하세요.`:'나중에 안방과 침대를 표시하면 사이트가 장기 휴식 위치를 다시 비교할 수 있습니다.'},
      {title:'배치는 간소하게',body:'의례감을 더하고 싶으면 짝을 이룬 온전한 소품이면 충분하며 분홍 수정을 쌓을 필요가 없습니다.'}
    ]);
    if(scenario===ACTION_SCENARIOS.relationship.STABLE)return guide(scenario,'연인이 있고 감정을 안정시키고 싶을 때',[
      {title:'먼저 안방과 침대를 본다',body:bedroomPalace?`먼저 ${PALACE_META[bedroomPalace].direction}의 안방과 침대를 유지하거나 조정하세요. 장기 휴식 위치가 단기 도화보다 중요합니다.`:'먼저 3단계에서 안방과 침대를 표시해야 사이트가 장기 휴식 위치를 비교할 수 있습니다.'},
      {title:'다음으로 본명 조건을 본다',body:'안정 관계는 먼저 주택의 장기 구조와 일상 생활 공간을 봅니다.'},
      {title:'경사 방향을 보조로',body:`올해는 ${goal.celebration.direction}의 구자 경사 방향을 참고할 수 있습니다.`},
      {title:'도화 자리는 일부러 촉동하지 않음',body:`${goal.direction}의 인연 위치는 정상적으로 쓰면 됩니다.`}
    ]);
    if(scenario===ACTION_SCENARIOS.relationship.REDUCE)return guide(scenario,'지금은 연애하고 싶지 않을 때',[
      {title:'도화를 특별히 촉동할 필요 없음',body:`올해 인연 위치는 ${location}에 있으며 정상적으로 쓰면 됩니다.`},
      {title:'도화 촉동 배치는 생략',body:'생화·분홍·따뜻한 색 장식이나 짝을 이룬 도화 촉동 소품을 일부러 둘 필요가 없습니다.'},
      {title:'막아 둘 필요 없음',body:'여기가 원래 생활 구역이면 사용을 멈출 필요가 없습니다.'},
      {title:'주의를 돌린다',body:'일이나 학업에 집중하고 싶으면 문창이나 작업 추천 위치를 우선 쓸 수 있습니다.'}
    ]);
    return guide(ACTION_SCENARIOS.relationship.MEET,'새로운 상대를 만나고 싶을 때',[
      {title:'올해 인연 위치를 찾는다',body:`올해 인연 위치는 ${location}에 있습니다.`},
      {title:'공간을 쓰기 쉽게',body:'밝고 정갈하게 유지하고 정상적으로 다니고 머물 공간도 남기세요.'},
      {title:'일상 사용을 늘린다',body:social?'여기에는 이미 공용이나 자주 쓰는 공간이 있어 정상적으로 사용을 늘릴 수 있습니다.':'여기가 거실·화장 구역이나 자주 쓰는 공간이면 정상적으로 사용을 늘릴 수 있습니다.'},
      {title:'마지막에야 배치를 본다',body:'의례감을 더하고 싶으면 생화나 따뜻한 색 소품을 둘 수 있습니다.'}
    ]);
  }

  function buildWenchangActionGuide({goal,placements={},scenario=ACTION_SCENARIOS.wenchang.FOCUS}={}){
    if(!goal?.primaryPalace)throw new TypeError('문창 행동 안내에는 goal 이 필요합니다');
    const targetItems=itemsForPalace(placements,goal.primaryPalace),deskHere=hasAny(targetItems,['書桌／工作位','辦公桌']),deskPalace=PALACES.find(palace=>hasAny(itemsForPalace(placements,palace),['書桌／工作位','辦公桌'])),location=goalLocation(goal);
    const position=deskHere?'지금 책상이 이미 추천 구역에 있어서 그대로 두어도 됩니다.':deskPalace?`지금 책상은 ${PALACE_META[deskPalace].direction}에 있습니다. 여유가 되면 ${koWith(goal.direction,'으로')} 먼저 옮길 수 있습니다.`:`고정된 독서나 작업 자리가 있으면 ${goal.direction}에 먼저 둘 수 있습니다.`;
    if(scenario===ACTION_SCENARIOS.wenchang.EXAM)return guide(scenario,'시험을 준비하고 있을 때',[
      {title:'주요 독서 구역을 고정',body:`올해 문창 위치는 ${location}에 있습니다.`},
      {title:'독서 시간대를 고정',body:'주요 독서 시간대를 이 구역에 배치하세요. 핵심은 꾸준한 사용입니다.'},
      {title:'책상을 못 옮겨도 방법이 있음',body:deskHere?'지금 책상 위치를 유지할 수 있습니다.':'책상을 옮길 수 없으면 추천 구역의 식탁이나 작업 구역을 주요 복습 자리로 쓸 수 있습니다.'},
      {title:'방해를 줄인다',body:'책상을 정갈하게, 조명을 충분히 유지하고 공부할 때 불필요한 방해를 줄이세요.'}
    ]);
    if(scenario===ACTION_SCENARIOS.wenchang.WORK)return guide(scenario,'업무에 집필／기획／연구가 필요할 때',[
      {title:'집중 위치를 찾는다',body:`올해 문창 위치는 ${location}에 있습니다.`},
      {title:'깊은 작업을 배치',body:'여기에서 집필·기획·연구와 오래 집중해야 하는 일을 처리할 수 있습니다.'},
      {title:'책상은 어떻게 보나',body:position},
      {title:'고정 사용 습관을 만든다',body:'조명과 책상을 정갈하게 유지하는 것이 자주 위치를 바꾸는 것보다 실용적입니다.'}
    ]);
    if(scenario===ACTION_SCENARIOS.wenchang.DESK_FIXED)return guide(scenario,'책상을 지금 옮길 수 없을 때',[
      {title:'먼저 현 상태 유지',body:'책상을 옮길 수 없으면 먼저 원위치를 유지하고 억지로 옮길 필요가 없습니다.'},
      {title:'중요한 일의 장소를 바꾼다',body:`중요한 독서·집필·복습을 ${location}에 배치할 수 있습니다.`},
      {title:'책상 없이도 가능',body:'짧은 시간 식탁이나 작업 구역을 쓰면 되고 영구 개조는 필요 없습니다.'},
      {title:'기본 조건을 유지',body:'원래 책상도 정갈하게, 조명을 충분히 유지하고 방해를 줄이세요.'}
    ]);
    return guide(ACTION_SCENARIOS.wenchang.FOCUS,'공부에 집중하기 어려울 때',[
      {title:'먼저 올해 위치를 본다',body:`올해 문창 위치는 ${location}에 있습니다.`},
      {title:'책상을 비교',body:position},
      {title:'환경을 정리',body:'책상을 정갈하게, 조명을 충분히, 방해를 줄이고 같은 위치에서 고정해 쓰세요.'},
      {title:'마지막에야 배치를 본다',body:'의례감을 더하고 싶으면 부귀죽 네 줄기·붓걸이·붓·문창탑을 쓸 수 있습니다.'}
    ]);
  }

  function buildGoalActionGuide({goalDirections,placements={},houseContext={}}={}){
    if(!goalDirections)throw new TypeError('goalDirections 가 필요합니다');
    return Object.freeze({
      wealth:Object.freeze(Object.values(ACTION_SCENARIOS.wealth).map(scenario=>buildWealthActionGuide({goal:goalDirections.wealth,placements,scenario,houseContext}))),
      relationship:Object.freeze(Object.values(ACTION_SCENARIOS.relationship).map(scenario=>buildRelationshipActionGuide({goal:goalDirections.relationship,placements,scenario}))),
      wenchang:Object.freeze(Object.values(ACTION_SCENARIOS.wenchang).map(scenario=>buildWenchangActionGuide({goal:goalDirections.wenchang,placements,scenario})))
    });
  }

  function buildGoalDirections(input={}){
    return Object.freeze({version:'shado-goal-directions-v122',wealth:analyzeWealthDirection(input),relationship:analyzeRelationshipReference(input),wenchang:analyzeWenchangDirection(input),authorityLevels:AUTHORITY});
  }

  return Object.freeze({AUTHORITY,ACTION_SCENARIOS,PALACES,PALACE_META,analyzeWealthDirection,analyzeRelationshipReference,analyzeWenchangDirection,buildWealthActionGuide,buildRelationshipActionGuide,buildWenchangActionGuide,buildGoalActionGuide,buildGoalDirections});
});
