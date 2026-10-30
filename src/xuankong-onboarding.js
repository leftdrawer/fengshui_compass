/* 은호당 현공: 초보자 측정 신뢰도 레이어. UI 상태만 관리하며 택반 계산에는 참여하지 않는다. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.XuanKongOnboarding=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const HEADING_CONFIDENCE=Object.freeze({
    QUICK_ESTIMATE:'QUICK_ESTIMATE',
    USER_CONFIRMED:'USER_CONFIRMED',
    PROFESSIONAL_CONFIRMED:'PROFESSIONAL_CONFIRMED'
  });
  const STORAGE_KEY='xuankong-heading-confidence';
  const FALLBACK_KEY='xuankong-beginner-fallback-mode';

  function normalizeConfidence(value,hasHeading=false){
    return Object.values(HEADING_CONFIDENCE).includes(value)
      ?value
      :hasHeading?HEADING_CONFIDENCE.USER_CONFIRMED:'';
  }

  function confidenceAfterLock({quickEstimate=false,professional=false}={}){
    if(professional)return HEADING_CONFIDENCE.PROFESSIONAL_CONFIRMED;
    return quickEstimate?HEADING_CONFIDENCE.QUICK_ESTIMATE:HEADING_CONFIDENCE.USER_CONFIRMED;
  }

  function beginnerCopy(confidence,{nearBoundary=false}={}){
    if(confidence!==HEADING_CONFIDENCE.QUICK_ESTIMATE)return Object.freeze({title:'',detail:''});
    return Object.freeze({
      title:'완료! 이제 택반(宅盤)을 볼 수 있습니다.',
      detail:nearBoundary
        ?'지금은 대문 방향으로 먼저 추정합니다. 각도가 두 가지 택반의 경계에 가까우니, 나중에 여유가 될 때 한 번 더 측정해 보세요.'
        :'지금은 대문 방향으로 먼저 추정합니다. 더 정확하게 하고 싶으면 나중에 다시 확인하면 됩니다.'
    });
  }

  return Object.freeze({HEADING_CONFIDENCE,STORAGE_KEY,FALLBACK_KEY,normalizeConfidence,confidenceAfterLock,beginnerCopy});
});
