/* 은호당 현공 주택 어드바이저: 7단계 기초 안내. 문안만 제공하며 택반 계산에는 참여하지 않는다. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.XuanKongBeginnerGuide=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const symbols=Object.freeze(['①','②','③','④']);
  const freezeSequence=rows=>Object.freeze(rows.map((row,index)=>Object.freeze({...row,symbol:symbols[index]})));
  const directionDiagram='<div class="direction-position-diagram" role="img" aria-label="대문은 북동쪽 모서리에 있지만 문향은 동쪽인 예시 그림"><span class="diagram-north">북</span><div class="diagram-house"><span class="diagram-door">🚪</span><span class="diagram-arrow">→</span></div><span class="diagram-south">남</span></div><div class="direction-position-facts"><span>대문 위치: <strong>북동</strong></span><span>대문 문향: <strong>동</strong></span><span>1단계 측정: <strong>동 90°</strong></span><span>5단계 표시: <strong>북동</strong></span></div>';
  const step=(number,name,goal,sequence,primaryCTA,scrollTarget,more=[])=>Object.freeze({eyebrow:'사용 안내',title:`${number}단계｜${name}`,oneSentenceGoal:goal,sequence:freezeSequence(sequence),more:Object.freeze(more),primaryCTA,scrollTarget});
  const steps=Object.freeze({
    1:Object.freeze({...step(1,'방향 측정','이 단계는 한 가지만 합니다. 집이 어디를 향하는지 사이트에 알려 주는 것이지, 대문이 어느 모서리에 있는지가 아닙니다.',[
      {title:'방향과 위치를 먼저 구분',html:'<p>주택 좌향은 집 전체가 어디를 향하는지이고, 대문 문향은 문 안쪽에서 바깥을 보는 것이며, 대문 위치는 문이 평면도의 어느 구역에 있는지입니다.</p>'},
      {title:'어떻게 측정하나',html:'<p>각도를 알면 바로 입력할 수 있습니다. 휴대폰을 쓸 때는 수평을 유지하고, 휴대폰 상단이 집 바깥 방향을 향하게 하며, 자석 케이스와 큰 금속에서 떨어지세요.</p>'},
      {title:'가장 헷갈리기 쉬운 점',html:'<p>대문이 북동쪽 모서리에 있어도 나가는 방향은 정동쪽인 경우: 1단계에서 동 90°를 측정하고, 5단계에서 문을 북동에 표시합니다.</p>'+directionDiagram},
      {title:'마치면 무엇을 얻나',html:'<p>사이트가 주택 좌향·집 뒤쪽·택반을 자동으로 구해, 직접 180°를 더할 필요가 없습니다.</p>'}
    ],'방향 측정 시작','instrument',[{title:'대문과 주택 좌향이 다르면?',html:'<p>일반 모드에서는 먼저 주택 좌향을 완료하세요. 대문 문향은 「고급 설정 → 측정 대상」에서 기록할 수 있고, 대문 위치는 여전히 5단계에서 표시합니다.</p>'}]),quickStart:Object.freeze({title:'빨리 시작만 하고 싶나요?',copy:'주택 좌향을 몰라도 괜찮습니다. 평소 주로 드나드는 대문을 향해 한 번 측정하면 시작할 수 있습니다.',cta:'바로 측정하기'})}),
    2:step(2,'택반 보기','먼저 집 전체의 택반 바탕을 봅니다.',[
      {title:'먼저 전체 바탕을 본다',html:'<p>PR 은 같은 주택 시간 주기에서 이 좌향의 택반 바탕 순위이며, 비성을 먼저 알 필요가 없습니다.</p>'},
      {title:'다음으로 구궁을 본다',html:'<p>3×3 택반은 아홉 방향을 나타내며 방 평면도가 아닙니다. 방향은 위 남·아래 북·왼쪽 동·오른쪽 서로 고정입니다.</p>'},
      {title:'한 칸을 눌러 방향 선택',html:'<p>궁위를 누르면 3단계 「비성반 보기」에 바로 동기화돼 다시 고를 필요가 없습니다.</p>'},
      {title:'마치면 무엇을 얻나',html:'<p>집 전체의 바탕과 어느 방향을 더 자세히 볼지를 먼저 알게 됩니다.</p>'}
    ],'택반 보기 시작','chartStep',[{title:'PR 택반 바탕 ≠ 실거주 총평',html:'<p>PR 은 택반 바탕만 봅니다. 6단계에서는 문·방·가구·도로·현재 시간까지 더합니다.</p>'}]),
    3:step(3,'비성반 보기','고른 방향의 나는 별(비성)을 어떻게 쓰면 좋을지 봅니다.',[
      {title:'먼저 이 궁의 결론을 본다',html:'<p>일반 화면은 쓸 수 있는지·무엇에 비교적 알맞은지·무엇을 피해야 하는지를 먼저 알려 줍니다.</p>'},
      {title:'다른 방향으로 전환',html:'<p>위쪽 소형 구궁 전환기를 쓰세요. 2단계에서 고른 방향이 자동으로 들어옵니다.</p>'},
      {title:'필요할 때 전문 해설을 본다',html:'<p>펼친 뒤 「상세 분석·배치 건의·자료 출처」 두 층 메뉴로 깊이 볼 수 있습니다.</p>'},
      {title:'마치면 무엇을 얻나',html:'<p>별 숫자를 먼저 읽지 않아도 어느 방향이 업무·휴식·단시간 활동에 알맞은지 알게 됩니다.</p>'}
    ],'비성반 보기','flyingStarStep'),
    4:step(4,'길방 찾기','재물 자리·도화 자리·문창 자리를 봅니다.',[
      {title:'먼저 세 위치를 본다',html:'<p>카드가 방향을 바로 보여 줍니다. 방을 이미 표시했으면 우리 집의 실제 공간으로도 옮겨 줍니다.</p>'},
      {title:'다음으로 활용법을 본다',html:'<p>재물 자리는 사용과 통함을 중시하고, 도화 자리는 인연 수요를 보며, 문창 자리는 독서와 집중 작업을 배치할 수 있습니다.</p>'},
      {title:'당신의 문제에 맞는 상황을 고른다',html:'<p>「실제로 어떻게 하나」를 눌러 지금 다루려는 문제를 고르면 사이트가 그에 맞는 방법을 줍니다.</p>'},
      {title:'마치면 무엇을 얻나',html:'<p>구궁을 직접 대조할 필요 없이 바로 쓸 수 있는 방향 하나를 얻습니다.</p>'}
    ],'길방 찾기 시작','goalStep'),
    5:step(5,'방 배치','대문·방·가구·설비를 주택에 표시합니다.',[
      {title:'먼저 방향을 맞춘다',html:'<p>2단계의 3×3 은 방향을 보고, 여기 9×9 는 실제 위치를 더 정확히 표시하는 것이지 두 번째 비성반이 아닙니다.</p>'},
      {title:'가장 중요한 것부터 표시',html:'<p>대문·안방·침대·책상·주방·화장실·주요 창 순서로 표시하기를 권하며, 한 번에 다 채울 필요는 없습니다.</p>'},
      {title:'문향은 문 위치와 다름',html:'<p>문이 동 90°를 향해도 북동쪽 모서리에 있을 수 있습니다. 이 단계는 실제로 어디에 있는지만 표시합니다.</p>'+directionDiagram},
      {title:'마치면 무엇을 얻나',html:'<p>사이트가 「어느 방향」을 「당신의 안방·서재·대문」으로 옮겨 실거주 건의를 만듭니다.</p>'}
    ],'방 배치 시작','layoutWorkspace',[{title:'평면도는 어떻게 조정하나?',html:'<p>① 먼저 방향을 맞춥니다. ② 그다음 위치와 크기를 조정합니다. ③ 마지막으로 방이 올바른 방향에 있는지 확인합니다. 화면을 채우는 것보다 방향이 맞는 것이 중요합니다.</p>'}]),
    6:step(6,'총평 보기','모든 자료를 가장 먼저 할 만한 일로 통합합니다.',[
      {title:'먼저 가장 먼저 할 일을 본다',html:'<p>사이트가 최대 세 가지 다른 행동을 먼저 제시하며, 중요하고 실제로 할 수 있는 일을 우선합니다.</p>'},
      {title:'바꿀 수 있는지 구분',html:'<p>결과는 쉽게 조정 가능·가구 이동 필요·수리 필요·주택 고정 조건을 구분합니다.</p>'},
      {title:'당신의 상황에 맞게 읽는다',html:'<p>임대는 되돌릴 수 있는 개선을 먼저, 매입은 고정 문제를 먼저, 입주 완료는 상위 세 가지 행동을 먼저 보세요.</p>'},
      {title:'마치면 무엇을 얻나',html:'<p>택반·궁위·실제 배치를 통합한 행동 목록을 얻습니다.</p>'}
    ],'총평 보기 시작','homeScore',[{title:'결과를 더 정확하게 하려면 무엇을 보충할 수 있나?',dynamic:'missing',html:''}]),
    7:step(7,'유년 비성','올해의 비성(유년 비성)과 이번 달 알림을 봅니다.',[
      {title:'먼저 올해를 본다',html:'<p>유년 비성은 올해의 비성입니다. 비교적 긴 일깨움으로, 예컨대 올해 어느 방향에서 큰 공사를 먼저 하지 말아야 하는지입니다.</p>'},
      {title:'다음으로 이번 달을 본다',html:'<p>유월은 다음 절기까지만 유지되며 주택 자체의 장기 구조를 뒤집지 않습니다.</p>'},
      {title:'장기와 단기를 구분',html:'<p>본명이 유년보다, 유년이 유월보다 우선입니다. 한 달 일깨움 때문에 영구 개조를 하지 마세요.</p>'},
      {title:'마치면 무엇을 얻나',html:'<p>올해와 이번 달에 정상적으로 쓰거나 조용히 두거나 공사를 멈춰야 할 위치를 알게 됩니다.</p>'}
    ],'유년 비성 보기','temporalStep')
  });
  const tour=Object.freeze([
    ['①','방향 측정','집이 어디를 향하는지 사이트에 알려 줍니다.'],['②','택반 보기','먼저 집 전체의 택반 바탕을 봅니다.'],['③','비성반 보기','고른 방향의 나는 별(비성)을 어떻게 쓸지 봅니다.'],['④','길방 찾기','재물 자리·도화 자리·문창 자리를 봅니다.'],['⑤','방 배치','대문·방·가구·설비를 주택에 표시합니다.'],['⑥','총평 보기','가장 먼저 할 만한 일로 통합합니다.'],['⑦','유년 비성','올해의 비성과 이번 달 알림을 봅니다.']
  ].map(([symbol,title,copy])=>Object.freeze({symbol,title,copy})));
  const quickMeasure=Object.freeze({eyebrow:'30초 빠른 측정',title:'주택 좌향을 모르나요? 괜찮습니다',lead:'가장 간단한 방법으로 첫 측정을 먼저 끝내고, 나중에 다시 보정할 수 있습니다.',steps:freezeSequence([
    {title:'거실이나 주요 생활 구역에 선다',html:'<p>철문·냉장고·큰 금속에서 비교적 먼 자리를 찾으세요.</p>'},
    {title:'평소 주로 드나드는 대문을 향한다',html:'<p>평소 나가는 방향을 그대로 향하세요.</p><div class="quick-measure-diagram" role="img" aria-label="당신이 대문과 집 바깥을 향한 예시 그림"><span>나</span><b>→</b><span>🚪</span><b>→</b><span>집 밖</span></div>'},
    {title:'휴대폰을 문 밖으로 향해 바로 측정',html:'<p>휴대폰 윗부분을 문 밖으로 향하게 하고 각도가 안정되면 「방향 고정」을 누르세요.</p>'}
  ]),primaryCTA:'방향 측정 시작'});
  return Object.freeze({symbols,steps,tour,quickMeasure,storageKey:'beginnerTutorialSeen',learnerStorageKey:'xuankong-user-mode'});
});
