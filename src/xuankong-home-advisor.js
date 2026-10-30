/* 은호당 현공 주택 어드바이저: 생활 결정 층. 순수 함수, DOM 없음, LLM 없음. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.XuanKongHomeAdvisor=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const FIXABILITY=Object.freeze({EASY:'EASY',MOVABLE:'MOVABLE',RENOVATION:'RENOVATION',FIXED:'FIXED'});
  const FIXABILITY_LABEL=Object.freeze({EASY:'쉽게 조정 가능',MOVABLE:'가구 이동 필요',RENOVATION:'수리 필요',FIXED:'주택 고정 조건'});
  const COST_LABEL=Object.freeze({NONE:'비용 들지 않음',LOW:'소액 비용 가능',MOVING:'운반 도움 필요 가능',PROJECT:'전문가 현장 평가 필요'});
  const PALACE_LABEL=Object.freeze({SE:'남동쪽 구역',S:'남쪽 구역',SW:'남서쪽 구역',E:'동쪽 구역',C:'중앙 구역',W:'서쪽 구역',NE:'북동쪽 구역',N:'북쪽 구역',NW:'북서쪽 구역'});
  const SLEEP_ITEMS=Object.freeze(['床位','嬰兒床']);
  const DESK_ITEMS=Object.freeze(['書桌／工作位','辦公桌']);
  const DOOR_ITEMS=Object.freeze(['大門','次要門']);
  const INTERNAL_BLOCKERS=Object.freeze(['衣櫃','鞋櫃','大型家具']);
  const EXTERNAL_BLOCKERS=Object.freeze(['高樓','實山']);
  const ACTION_FAMILY=Object.freeze({AVOID_CONSTRUCTION:'AVOID_CONSTRUCTION',MOVE_BED:'MOVE_BED',MOVE_DESK:'MOVE_DESK',KEEP_ENTRY_CLEAR:'KEEP_ENTRY_CLEAR',REDUCE_BLOCKAGE:'REDUCE_BLOCKAGE',USE_MORE:'USE_MORE',KEEP_QUIET:'KEEP_QUIET',TEMPORARY_CAUTION:'TEMPORARY_CAUTION',FIXED_PROPERTY_WARNING:'FIXED_PROPERTY_WARNING',KEEP_CURRENT:'KEEP_CURRENT'});

  const unique=list=>[...new Set((list||[]).filter(Boolean))];
  const tagsFor=(placements,palace)=>Array.isArray(placements?.[palace])?placements[palace]:[];
  const locationsOf=(placements,item)=>Object.keys(placements||{}).filter(palace=>tagsFor(placements,palace).includes(item));
  const detailFor=(details,palace,item)=>details?.[`${palace}:${item}`]||{};
  const trace=(label,data)=>Object.freeze({label,data:Object.freeze(data||{})});
  const action=(input)=>Object.freeze({...input,family:input.family||input.id||ACTION_FAMILY.KEEP_CURRENT,fixabilityLabel:FIXABILITY_LABEL[input.fixability],costLabel:COST_LABEL[input.cost],trace:Object.freeze(input.trace||[])});

  function buildDoorPositionRecord({facingAngle,doorPositionPalace}){
    const angle=Number(facingAngle);
    if(!Number.isFinite(angle))throw new TypeError('facingAngle 은 유효한 각도여야 합니다');
    if(!Object.hasOwn(PALACE_LABEL,doorPositionPalace))throw new TypeError('doorPositionPalace 는 유효한 구궁이어야 합니다');
    return Object.freeze({facingAngle:((angle%360)+360)%360,doorPositionPalace,note:'문향과 문 위치는 서로 독립된 자료입니다. 문 위치는 주택 좌향을 바꾸지 않습니다.'});
  }

  function missingData(placements){
    const all=unique(Object.values(placements||{}).flat()),rows=[];
    if(!all.some(item=>DOOR_ITEMS.includes(item)))rows.push(Object.freeze({item:'大門',copy:'「대문」을 더 표시하면 주요 진기(進氣)와 입구 사용을 분석할 수 있습니다.'}));
    if(!all.some(item=>/主臥室/.test(item)))rows.push(Object.freeze({item:'主臥室',copy:'「안방」을 더 표시하면 주요 휴식 공간을 판단할 수 있습니다.'}));
    if(!all.some(item=>SLEEP_ITEMS.includes(item)))rows.push(Object.freeze({item:'床',copy:'「침대」를 더 표시하면 실제 잠자는 위치를 비교할 수 있습니다.'}));
    if(!all.some(item=>DESK_ITEMS.includes(item)))rows.push(Object.freeze({item:'書桌',copy:'「책상／작업 자리」를 더 표시하면 작업 위치를 추천할 수 있습니다.'}));
    if(!all.includes('道路'))rows.push(Object.freeze({item:'道路',copy:'매입을 평가하려면 근처 도로를 더 표시하세요. 모르면 보충하지 않아도 됩니다.'}));
    return Object.freeze(rows);
  }

  function bestAlternative({item,currentPalace,chart,placementChart,evaluate,rank,mode}){
    if(typeof rank!=='function'||!chart||!Array.isArray(placementChart))return null;
    const rows=rank({item,period:chart.p||chart.period,serviceMode:mode,chart:placementChart}).filter(Boolean);
    const current=rows.find(row=>row.palace===currentPalace),best=rows.find(row=>row.palace!==currentPalace);
    if(!best||!current||best.score-current.score<12)return null;
    return {best,current};
  }

  function furnitureActions({placements,chart,placementChart,evaluate,rank,mode}){
    const actions=[];
    for(const item of [...SLEEP_ITEMS,...DESK_ITEMS]){
      const currentPalace=locationsOf(placements,item)[0];if(!currentPalace)continue;
      const alternative=bestAlternative({item,currentPalace,chart,placementChart,evaluate,rank,mode});
      const current=typeof evaluate==='function'?evaluate({item,palace:currentPalace,index:Object.keys(PALACE_LABEL).indexOf(currentPalace),mode}):null;
      if(alternative){
        const isBed=SLEEP_ITEMS.includes(item),title=`${isBed?'침대':'책상'}을(를) ${PALACE_LABEL[alternative.best.palace]}(으)로 옮기기`;
        actions.push(action({id:`move-${item}`,family:isBed?ACTION_FAMILY.MOVE_BED:ACTION_FAMILY.MOVE_DESK,title,reason:`${PALACE_LABEL[alternative.best.palace]}이(가) 지금의 ${PALACE_LABEL[currentPalace]}보다 ${isBed?'장시간 휴식':'업무와 독서'}에 더 알맞습니다. 위치를 옮길 수 있으면 우선 조정하세요.`,fixability:isBed?FIXABILITY.MOVABLE:FIXABILITY.EASY,cost:isBed?'MOVING':'NONE',duration:'장기',priority:isBed?84:88,source:'심씨 택명반＋기존 배치 엔진',trace:[trace('위치 비교',{item,currentPalace,currentScore:alternative.current.score,recommendedPalace:alternative.best.palace,recommendedScore:alternative.best.score})]}));
      }else if(current&&['適合','不錯'].includes(current.status)){
        actions.push(action({id:`keep-${item}`,title:`${item}은(는) 지금 위치에 둘 수 있음`,reason:`지금 ${PALACE_LABEL[currentPalace]}이(가) ${SLEEP_ITEMS.includes(item)?'휴식':'업무와 독서'}에 알맞으니 풍수 때문에 옮길 필요가 없습니다.`,fixability:FIXABILITY.EASY,cost:'NONE',duration:'장기',priority:35,source:'심씨 택명반＋기존 배치 엔진',trace:[trace('현재 위치',{item,currentPalace,status:current.status,score:current.score})]}));
      }
    }
    return actions;
  }

  function doorActions({placements,chart,placementChart,evaluate,rank,mode}){
    const doorPalace=locationsOf(placements,'大門')[0];if(!doorPalace)return [];
    const actions=[action({id:'clear-door',family:ACTION_FAMILY.KEEP_ENTRY_CLEAR,title:'대문 주변을 트이게 유지하기',reason:'대문은 주택의 주요 출입과 통풍 자리입니다. 쌓인 물건과 큰 가구를 치워 문이 완전히 열리고 다니는 데 막힘이 없게 하세요.',fixability:FIXABILITY.EASY,cost:'NONE',duration:'장기',priority:78,source:'《심씨현공학(沈氏玄空學)·양택삼십칙(陽宅三十則)》 대문 납기',trace:[trace('대문 위치',{palace:doorPalace})]})];
    const blockers=tagsFor(placements,doorPalace).filter(item=>INTERNAL_BLOCKERS.includes(item));
    if(blockers.length)actions.push(action({id:'door-blocker',family:ACTION_FAMILY.REDUCE_BLOCKAGE,title:`대문 옆의 ${blockers[0]} 치우기`,reason:'이 방향은 원래 쓸 수 있지만 입구가 큰 가구에 가려져 있습니다. 여유가 되면 가림을 먼저 줄이세요.',fixability:FIXABILITY.MOVABLE,cost:'MOVING',duration:'장기',priority:91,source:'《양택삼십칙(陽宅三十則)》 왕문수폐(旺門受蔽)',trace:[trace('같은 궁 가림',{palace:doorPalace,blockers})]}));
    const secondary=locationsOf(placements,'次要門')[0];
    if(secondary&&typeof rank==='function'&&Array.isArray(placementChart)){
      const rows=rank({item:'大門',period:chart.p||chart.period,serviceMode:mode,chart:placementChart}),main=rows.find(row=>row.palace===doorPalace),other=rows.find(row=>row.palace===secondary);
      if(main&&other&&other.score-main.score>=18)actions.push(action({id:'use-secondary-door',family:ACTION_FAMILY.USE_MORE,title:'더 이로운 입구의 사용 빈도를 늘릴 수 있음',reason:`생활 동선이 허락하면 ${PALACE_LABEL[secondary]}의 기존 입구를 지금 주 입구보다 더 자주 쓸 수 있습니다. 벽을 허물어 새 문을 낼 필요는 없습니다.`,fixability:FIXABILITY.EASY,cost:'NONE',duration:'장기',priority:72,source:'《양택삼십칙(陽宅三十則)》 승왕개문(乘旺開門)의 비공사 번안',trace:[trace('기존 입구 비교',{main:doorPalace,mainScore:main.score,secondary,secondaryScore:other.score})]}));
    }
    return actions;
  }

  function roadAndFormActions({placements,placementDetails,mode}){
    const actions=[],fixed=[];
    for(const palace of Object.keys(PALACE_LABEL)){
      if(tagsFor(placements,palace).includes('道路')){
        const detail=detailFor(placementDetails,palace,'道路');
        if(!detail.distance){fixed.push(Object.freeze({title:`${PALACE_LABEL[palace]}에 도로 있음`,summary:'지금은 거리 자료가 없어 영향 강약을 판단하지 않습니다.',fixability:FIXABILITY.FIXED,fixabilityLabel:FIXABILITY_LABEL.FIXED}));continue}
        const near=detail.distance==='near',direct=detail.shape==='direct',shapeLabel={direct:'주택을 직충',cross:'주택 앞을 가로지름',curved:'굽어 지나감'}[detail.shape]||'길 형태 미입력';
        const summary=`도로가 ${detail.distance==='near'?'주택에 가깝고':detail.distance==='far'?'거리가 비교적 멀고':'거리가 보통이고'}, ${shapeLabel}.`;
        fixed.push(Object.freeze({title:`${PALACE_LABEL[palace]} 도로`,summary,fixability:FIXABILITY.FIXED,fixabilityLabel:FIXABILITY_LABEL.FIXED}));
        if(near&&direct)actions.push(action({id:`road-${palace}`,family:ACTION_FAMILY.FIXED_PROPERTY_WARNING,title:'가까운 직충 도로를 집 선택의 중점으로',reason:`${PALACE_LABEL[palace]}의 도로가 가깝고 주택을 직충합니다. 이는 주택 고정 조건이라 가구를 옮겨도 실제로 바꿀 수 없습니다.${mode==='buy'?' 계약 전 비중을 높여야 합니다.':' 일상에서 먼저 소음·조명·출입 안전을 처리하세요.'}`,fixability:FIXABILITY.FIXED,cost:'PROJECT',duration:mode==='buy'?'계약 전 확인':'장기',priority:mode==='buy'?96:70,source:'《양택삼십칙(陽宅三十則)》 도로 원근과 입로',trace:[trace('도로',{palace,...detail})]}));
      }
      const external=tagsFor(placements,palace).filter(item=>EXTERNAL_BLOCKERS.includes(item));
      if(external.length)fixed.push(Object.freeze({title:`${PALACE_LABEL[palace]} 외부 가림`,summary:`${external.join('·')}이(가) 표시됨. 이는 외부 고정 조건이라 실내 가구를 옮겨도 없앨 수 없습니다.`,fixability:FIXABILITY.FIXED,fixabilityLabel:FIXABILITY_LABEL.FIXED}));
    }
    return {actions,fixed};
  }

  function temporalActions(temporal){
    if(!temporal?.currentActions)return [];
    const rows=[],annualEnd=temporal.annual?.endInstant?`다음 입춘까지(${String(temporal.annual.endInstant).slice(0,10)})`:'다음 입춘까지',monthEnd=temporal.monthly?.endInstant?`다음 절기까지(${String(temporal.monthly.endInstant).slice(0,10)})`:'다음 절기까지';
    for(const item of temporal.currentActions.annualAttention||[]){const construction=item.actionLevel==='AVOID_DISTURBANCE';rows.push(action({id:`annual-${item.palace}`,family:construction?ACTION_FAMILY.AVOID_CONSTRUCTION:ACTION_FAMILY.KEEP_QUIET,title:item.annualAction.replace(/[。.]$/,''),reason:construction?'올해의 보수적 사용 일깨움입니다. 일상 사용은 정상이며 벽 뚫기·두드림·큰 수리만 피하면 됩니다.':'올해의 보수적 사용 일깨움입니다. 청결·건조·통풍과 안정된 사용을 유지하면 됩니다.',fixability:FIXABILITY.EASY,cost:'NONE',duration:annualEnd,priority:construction?94:76,source:'본명반＋유년 자백',trace:[trace('시간 중첩반',{...item.trace,palace:item.palace})]}))}
    for(const item of temporal.currentActions.monthlyAttention||[])rows.push(action({id:`monthly-${item.palace}`,family:ACTION_FAMILY.TEMPORARY_CAUTION,title:item.monthlyAction.replace(/[。.]$/,''),reason:'이번 달의 임시 일깨움입니다. 다음 절기가 지나면 다시 계산하므로 가구를 영구히 옮길 필요가 없습니다.',fixability:FIXABILITY.EASY,cost:'NONE',duration:monthEnd,priority:62,source:'본명반＋유월 자백',trace:[trace('시간 중첩반',{...item.trace,palace:item.palace})]}));
    return rows;
  }

  function fixedServiceActions({placements,mode}){
    const actions=[],fixed=[];
    for(const item of ['廚房','爐灶','廁所','浴室'])for(const palace of locationsOf(placements,item)){
      const title=`${item}이(가) ${PALACE_LABEL[palace]}에 있음`,summary=`${item}은(는) 보통 고정 격국이라 바꾸려면 수도·전기나 수리가 필요합니다.`;
      fixed.push(Object.freeze({title,summary,fixability:FIXABILITY.RENOVATION,fixabilityLabel:FIXABILITY_LABEL.RENOVATION}));
      if(mode==='buy'&&['廁所','廚房'].includes(item))actions.push(action({id:`fixed-${item}-${palace}`,title:`매입 전 ${item} 고정 위치 확인`,reason:`${summary} 이를 계약 판단에 넣으세요. 사이트는 배치로 고정 격국을 바꾼 척하지 않습니다.`,fixability:FIXABILITY.RENOVATION,cost:'PROJECT',duration:'계약 전 확인',priority:58,source:'《양택삼십칙(陽宅三十則)》 불과 배수의 현대 주택 번안',trace:[trace('고정 설비',{item,palace})]}));
    }
    return {actions,fixed};
  }

  function lightAndAccessActions({placements}){
    const actions=[];
    for(const palace of Object.keys(PALACE_LABEL)){
      const tags=tagsFor(placements,palace),hasPassage=tags.includes('走道／通道'),hasOpening=tags.some(item=>['窗戶','陽台'].includes(item)),blockers=tags.filter(item=>INTERNAL_BLOCKERS.includes(item));
      if(hasPassage)actions.push(action({id:`passage-${palace}`,title:'주요 통로를 밝고 트이게 유지',reason:`${PALACE_LABEL[palace]}에 주요 통로가 표시됐습니다. 먼저 쌓인 물건을 치우고 일상 조명을 보충하며 안전 폭을 남기세요.`,fixability:FIXABILITY.EASY,cost:'LOW',duration:'장기',priority:54,source:'《양택삼십칙(陽宅三十則)》 내로·명암·막힘의 현대 주택 번안',trace:[trace('통로',{palace})]}));
      if(hasOpening&&blockers.length)actions.push(action({id:`opening-block-${palace}`,title:`창가의 ${blockers[0]} 치우기`,reason:`${PALACE_LABEL[palace]}의 주요 개구부가 큰 가구에 가려졌습니다. 여유가 되면 채광·통풍·여는 공간을 먼저 회복하세요.`,fixability:FIXABILITY.MOVABLE,cost:'MOVING',duration:'장기',priority:82,source:'《양택삼십칙(陽宅三十則)》 왕향수폐(旺向受蔽)의 현대 주택 번안',trace:[trace('개구부 가림',{palace,blockers})]}));
    }
    return actions;
  }

  function modeAssessment(mode,actions,fixedIssues){
    if(mode==='rent')return Object.freeze({mode,label:'임대',summary:actions.some(row=>row.fixability===FIXABILITY.FIXED)?'먼저 지금 살 수 있는지 보세요. 고정 문제는 판단에 넣되 임대를 위해 구조 공사를 하는 것은 권하지 않습니다.':'비용이 들지 않고 되돌릴 수 있는 조정을 우선 하세요.'});
    if(mode==='buy')return Object.freeze({mode,label:'매입',summary:fixedIssues.length?'먼저 도로·외부 가림·좌향·고정된 물·불 위치를 확인하세요. 이것이 가구를 옮기는 것보다 중요합니다.':'계약 전 대문·도로·고정 격국 자료를 갖추세요.'});
    return Object.freeze({mode,label:'입주 완료',summary:'먼저 조정하기 쉬운 침대·책상·문 앞과 올해 공사 계획을 처리하세요.'});
  }

  function deduplicateActionRecommendations(rows=[]){
    const ordered=[...rows].sort((a,b)=>b.priority-a.priority),families=new Map();
    for(const row of ordered){const group=families.get(row.family)||[];group.push(row);families.set(row.family,group)}
    const merged=[];
    for(const group of families.values()){
      const first=group[0];
      if(first.family===ACTION_FAMILY.AVOID_CONSTRUCTION&&group.length>1){
        const palaces=unique(group.flatMap(row=>row.trace.filter(item=>item.label==='시간 중첩반').map(item=>item.data.palace))),directions=palaces.map(palace=>PALACE_LABEL[palace]).filter(Boolean);
        merged.push(action({...first,id:`annual-construction-${palaces.join('-')}`,title:`올해 ${directions.join('·')}에서 큰 공사를 먼저 피하기`,reason:'일상 사용은 정상입니다. 벽 뚫기·두드림·큰 수리를 먼저 피하세요.',trace:group.flatMap(row=>row.trace)}));
      }else merged.push(first);
    }
    return Object.freeze(merged.sort((a,b)=>b.priority-a.priority));
  }

  function buildHomeAdvice(input={}){
    const mode=['rent','buy','lived'].includes(input.mode)?input.mode:'lived',placements=input.placements||{},road=roadAndFormActions({placements,placementDetails:input.placementDetails||{},mode}),service=fixedServiceActions({placements,mode}),all=[...road.actions,...temporalActions(input.temporalAssessment),...doorActions({...input,mode}),...furnitureActions({...input,mode}),...lightAndAccessActions({placements}),...service.actions];
    const uniqueIds=[...new Map(all.map(row=>[row.id,row])).values()],diverse=deduplicateActionRecommendations(uniqueIds),actions=Object.freeze(diverse.slice(0,3)),fixedIssues=Object.freeze([...road.fixed,...service.fixed]);
    return Object.freeze({version:'shado-home-advisor-v121',mode,actions,fixedIssues,missingData:missingData(placements),modeAssessment:modeAssessment(mode,actions,fixedIssues),fixability:FIXABILITY,source:Object.freeze({level:'PRODUCT_INTERPRETATION',basis:'심씨 택명반, 양택삼십칙(陽宅三十則)과 기존 배치／시간 중첩반 결과. 개운물(開運物)은 쓰지 않음'})});
  }

  return Object.freeze({FIXABILITY,FIXABILITY_LABEL,COST_LABEL,ACTION_FAMILY,PALACE_LABEL,buildDoorPositionRecord,missingData,deduplicateActionRecommendations,buildHomeAdvice});
});
