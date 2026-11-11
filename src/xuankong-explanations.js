(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.XuanKongCopyGlossary=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const NO_ACTION='지금은 특별히 처리할 필요가 없습니다.';
  const STEP_THREE_ACTION='5단계 「방 배치」에 위치를 표시하면 함께 읽습니다.';
  const NOT_AVAILABLE_ACTION='지금은 사이트에서 사용자가 직접 확인할 수 없어 별도의 조작 건의를 제공하지 않습니다.';
  const entry=(professionalName,beginnerTitle,explanation,impact,judgement='이것은 택반의 구조 설명입니다.',action=NO_ACTION)=>({
    professionalName,
    beginner:{title:beginnerTitle,summary:impact,severity:judgement,action},
    professional:{term:professionalName,technicalExplanation:explanation,rawData:null,source:'《심씨현공학(沈氏玄空學)》 규칙 층'},
    explanation,
    impact,
    judgement,
    action
  });

  const GLOSSARY={
    DOUBLE_AT_MOUNTAIN:entry('쌍성도산(雙星到山)','비교적 안정된 거주에 가까움','이 운에서 가장 중요한 두 작용이 집 뒤쪽에 모여 있습니다. 현공은 이쪽을 주로 거주·건강·가정·인정 같은 비교적 안정된 면을 보는 데 씁니다.','대개 장기 거주와 가정 안정 면의 강점으로 먼저 봅니다.','전반적으로 긍정적이나 어떤 사건이 반드시 일어남을 뜻하지는 않습니다.'),
    DOUBLE_AT_FACING:entry('쌍성도향(雙星到向)','일·대외 활동·재운에 비교적 이로움','이 운에서 가장 중요한 두 작용이 집이 향하는 쪽에 모여 있습니다. 현공은 보통 이쪽을 출입구·업무 왕래·재운 발현을 보는 데 씁니다.','대개 일자리·대외 왕래·재운 면의 강점으로 먼저 봅니다.','전반적으로 긍정적이나 거주 품질은 여전히 실제 공간을 기준으로 합니다.'),
    WANG_SHAN:entry('왕산(旺山)','거주와 휴식 면에서 가점','이 운의 중요한 산성이 집 뒤쪽에 떨어집니다.','침실·휴식·오래 머무는 공간이 알맞은 자리를 찾을 가능성이 비교적 높습니다.','긍정적입니다.',STEP_THREE_ACTION),
    WANG_XIANG:entry('왕향(旺向)','일·대외 활동·재운 면에서 가점','이 운의 중요한 향성이 집이 향하는 쪽에 떨어집니다.','대문·거실·자주 쓰는 동선이 알맞은 자리를 찾을 가능성이 비교적 높습니다.','긍정적입니다.',STEP_THREE_ACTION),
    DAO_SHAN_DAO_XIANG:entry('도산도향／왕산왕향(到山到向／旺山旺向)','전반적 바탕이 비교적 균형 잡힘','이 운의 산성이 집 뒤쪽에, 향성이 집이 향하는 쪽에 떨어집니다.','거주 안정과 일상 활동 두 면 모두 비교적 좋은 출발점을 가집니다.','전반적으로 긍정적이나 보장은 아닙니다.'),
    SHANG_SHAN:entry('상산(上山)','재운 위치에 주의 필요','본래 활동·재운에 가까운 향성이 집 뒤쪽에 떨어집니다.','출입구와 일상 활동의 위치가 알맞지 않으면 재운 강점이 발휘되기 어렵습니다.','주의가 필요합니다.',STEP_THREE_ACTION),
    XIA_SHUI:entry('하수(下水)','휴식 위치에 주의 필요','본래 거주·안정에 가까운 산성이 집이 향하는 쪽에 떨어집니다.','침실과 오래 머무는 위치를 더 세밀히 배치해야 합니다.','주의가 필요합니다.',STEP_THREE_ACTION),
    SHANG_SHAN_XIA_SHUI:entry('상산하수(上山下水)','전반 격국에 신중 필요','산성과 향성의 중요 위치가 서로 뒤집혔습니다.','거주와 활동 두 면 모두 격국의 제약을 받기 비교적 쉽습니다.','뚜렷이 주의가 필요합니다.',STEP_THREE_ACTION),
    MOUNTAIN_STAR:entry('산성(山星)','거주와 휴식을 봄','산성은 주로 조용하고 오래 머무는 공간을 판단하는 데 씁니다.','침실·침대·고정 좌석 판독에 흔히 씁니다.'),
    FACING_STAR:entry('향성(向星)','출입구와 활동을 봄','향성은 주로 활동·흐름·대외 연결 공간을 판단하는 데 씁니다.','대문·거실·도로·자주 쓰는 동선 판독에 흔히 씁니다.'),
    PERIOD_STAR:entry('운성(運星)','집이 속한 시간을 기록','운성은 주택이 성립할 때 속한 20년 주기를 나타냅니다.','택반 전체를 배열하는 시간 기준입니다.'),
    RULING_STAR:entry('영성(令星)','현재 주기에서 가장 중요한 별','영성은 어느 한 운에서 가장 중요한 숫자입니다.','사이트는 이것으로 그 주기에 어느 위치가 비교적 이로운지 판단합니다.'),
    WANG_QI:entry('왕기(旺氣)','이 주기에 비교적 이로운 작용','왕기는 전통 현공이 당기(當期)의 이로운 작용을 부르는 이름입니다.','반면의 경향을 설명할 뿐 직접 측정할 수 있는 에너지가 아닙니다.'),
    IN_PERIOD:entry('당운(當運)','여전히 원래의 유효 주기 안','주택이 속한 20년 주기가 현재 주기와 같습니다.','원래 택반이 가장 직접적인 시간 단계에 있습니다.'),
    OUT_OF_PERIOD:entry('실운／출운(失運／出運)','원래 가장 이로운 주기를 이미 떠남','주택 성립 당시의 20년 주기가 이미 끝났습니다.','원래 강점은 참고할 수 있으나 지금도 가장 왕성하다고 여길 수 없습니다.','장기 판단을 한 단계 높여 주의해야 합니다.'),
    SITTING_MOUNTAIN:entry('좌산(坐山)','집의 정후방','좌산은 좌향(坐向)의 뒤쪽이며 궁반을 잡는 기준입니다.','보통 화면에서는 「집 뒤쪽」으로 표시합니다.'),
    FACING_DIRECTION:entry('향수(向首)','집이 주로 향하는 쪽','향수는 주택이 바깥을 향하며 출입구·개방 공간과 주로 접하는 방향입니다.','보통 화면에서는 「집 앞쪽(좌향)」으로 표시합니다.'),
    PERIOD_CYCLE:entry('원운(元運)','20년마다 하나의 시간 주기','현공은 시간을 아홉 운으로 나누며 한 운이 20년입니다.','주택 성립 연도가 어느 택반을 쓸지 정합니다.'),
    PERIOD_9:entry('구운(九運)','2024~2043년의 주기','구운은 삼원구운(三元九運)의 아홉 번째 20년 주기입니다.','2024~2043년에 성립한 주택은 보통 구운(九運)으로 궁반을 잡습니다.'),
    LEANING_DIRECTION:entry('겸향(兼向)','각도가 두 방향의 경계에 가까움','한 산 15도 중 각도가 바깥쪽 3도에 떨어지면 겸향이라 합니다.','그래서 궁반 방식이 바뀌며, 화면이 정향·겸향을 가릅니다.'),
    REPLACEMENT_CHART:entry('체괘(替卦)','겸향에서 쓰는 궁반','겸향(兼向)이면 정향의 하괘(下卦)를 쓰지 않고, 심씨 규칙으로 입중성(入中星)을 바꿉니다.','사이트가 실측 각도에 따라 자동 선택합니다.'),
    QI_XING:entry('기성(起星)','겸향반 계산 방법','기성은 심씨가 겸향반을 다룰 때 쓰는 전문 계산 절차입니다.','산성과 향성의 배열을 실제로 바꿉니다.'),
    FAN_YIN:entry('반음(反吟)','반면에 상반된 관계가 나타남','일부 비성 위치가 상반되거나 대충(對沖)하는 관계를 이뤄, 전통 현공은 이를 주의 구조로 둡니다.','먼저 국부인지 전반인지 구분해야 하며 일률적으로 논할 수 없습니다.','주의가 필요하나 반드시 나쁜 일이 일어남을 뜻하지는 않습니다.'),
    FU_YIN:entry('복음(伏吟)','같은 영향이 겹치기 쉬움','일부 비성이 원래 위치와 겹쳐, 전통적으로 같은 종류의 작용이 겹치거나 정체되거나 커지기 쉬움을 뜻합니다.','먼저 국부인지 전반인지 구분해야 합니다.','주의가 필요하나 반드시 나쁜 일이 일어남을 뜻하지는 않습니다.'),
    LOCAL_FAN_YIN:entry('국부 반음(局部反吟)','일부 위치만 주의 필요','상반 관계가 개별 궁위에만 나타납니다.','집 전체가 반음이라는 뜻은 아닙니다.','국부적인 알림입니다.',STEP_THREE_ACTION),
    LOCAL_FU_YIN:entry('국부 복음(局部伏吟)','일부 위치만 주의 필요','겹침 관계가 개별 궁위에만 나타납니다.','집 전체가 복음이라는 뜻은 아닙니다.','국부적인 알림입니다.',STEP_THREE_ACTION),
    FULL_FAN_YIN:entry('전반 반음(全盤反吟)','택반 전체에 중요한 구조 문제','비성반 전체 층이 완전한 상반 배열을 이룹니다.','전통 현공이 이를 무겁게 평가하므로 장기 집 선택 시 무시하면 안 됩니다.','중대한 반국(盤局) 경고입니다.',NOT_AVAILABLE_ACTION),
    FULL_FU_YIN:entry('전반 복음(全盤伏吟)','택반 전체에 중요한 구조 문제','비성반 전체 층이 원래 위치와 완전히 겹칩니다.','전통 현공이 이를 무겁게 평가하므로 장기 집 선택 시 무시하면 안 됩니다.','중대한 반국 경고입니다.',NOT_AVAILABLE_ACTION),
    CORE_PALACE:entry('핵심궁(核心宮)','집 앞뒤 두 주요 방위','핵심궁은 주택의 집 뒤쪽과 집 앞쪽(좌향)을 가리킵니다.','이 두 곳의 국부 문제는 다른 방위보다 더 중시됩니다.'),
    EARTH_LUCK:entry('지운(地運)','택반의 장기 유효 시간','지운은 현공이 택반 하나가 얼마나 유지될지 추정하는 시간 척도입니다. 건물 수명이 아닙니다.','햇수가 길수록 장기 보유의 시간 압박이 대개 낮습니다.'),
    IMPRISONMENT:entry('영성 입수(令星入囚)','택반이 제한 단계에 들어감','입수는 택반이 원래 비교적 이로운 시간에서 비교적 제한된 단계로 바뀌는 시점입니다.','사이트가 전환까지 몇 년 남았는지 바로 표시합니다. 이는 건물 수명이 아니며 그해가 되면 못 산다는 뜻도 아닙니다.','남은 시간이 짧을수록 장기 매입에 더 주의해야 합니다.'),
    MOUNTAIN_IMPRISONMENT:entry('산성 입수(山星入囚)','거주 면의 강점이 제한됨','겸향반에서 당운 산성이 중앙에 바로 들어갑니다.','장기 거주와 안정 면의 강점이 제한됩니다.','주의가 필요합니다.'),
    FACING_IMPRISONMENT:entry('향성 입수(向星入囚)','활동과 재운 면의 강점이 제한됨','겸향반에서 당운 향성이 중앙에 바로 들어갑니다.','출입구·활동·재운 면의 강점이 제한됩니다.','주의가 필요합니다.'),
    COUPLE_COMBINATION_TEN:entry('부부 합십(夫婦合十)','두 층의 숫자가 완전한 짝을 이룸','두 층 비성이 각 궁에서 더해 10이 되는 것을 전문적으로 부부 합십이라 합니다.','반면 구조의 하나일 뿐 단독으로 집 전체의 좋고 나쁨을 정할 수 없습니다.'),
    ZHENG_SHEN:entry('정신(正神)','이 주기에 안정을 중시하는 쪽','정신은 특정 원운에서 높고 참·고요에 비교적 알맞은 방위 개념입니다.','환경 형태를 판단하는 데 쓰며 신(神)이 아닙니다.'),
    LING_SHEN:entry('영신(零神)','이 주기에 흐름을 중시하는 쪽','영신은 특정 원운에서 낮고 비움·동에 비교적 알맞은 방위 개념입니다.','도로·트인 곳·물의 배치를 판단하는 데 씁니다.'),
    LING_TANG:entry('영당(零堂)','흐름과 개방에 가까운 구역','영당은 영신 방위의 공간적 표현입니다.','보통 정말 낮고 비우고 동하는지 봅니다.'),
    CASTLE_GATE:entry('성문(城門)','주요 좌향 외의 유효 입구','성문은 특정 반국에서 이로운 작용을 끌어들이는 데 돕는 부(副) 입구나 틈입니다.','성립 조건이 엄격해 문만 보고 인정할 수 없습니다.'),
    PRIMARY_CASTLE_GATE:entry('정성문(正城門)','비교적 주요한 성문 후보','정성문은 향수 양쪽 괘위에서 추정한 주요 후보입니다.','그래도 반면과 실제 입구 조건에 맞아야 합니다.'),
    SECONDARY_CASTLE_GATE:entry('부성문(副城門)','부차적 성문 후보','부성문은 다른 쪽의 후보 입구입니다.','작용은 대개 정성문보다 약하며, 그래도 온전한 조건에 맞아야 합니다.'),
    CASTLE_GATE_USABLE:entry('성문 사용 가능','부 입구가 활용 가치 있음','반면과 실제 환경이 성문 성립 조건에 맞습니다.','전반 판단의 가점 항목으로 쓸 수 있습니다.'),
    CASTLE_GATE_INVALID:entry('성문 무효','부 입구가 조건에 맞지 않음','후보 입구에 필요한 반면이나 환경 조건이 없습니다.','가점 항목으로 삼을 수 없습니다.'),
    EXTERNAL_FORM:entry('외국(外局)','집 바깥의 실제 환경','외국은 도로·공터·건물·비탈·수역과 주요 출입구를 포함합니다.','반면의 위치가 실제로 쓰이는지에 영향을 줍니다.', '현장 조건입니다.', STEP_THREE_ACTION),
    QI_INTAKE:entry('납기(納氣)','집이 외부 흐름을 받아들이는 방식','납기는 주로 대문·창·발코니·도로가 주택과 어떻게 이어지는지 봅니다.','보통 화면에서는 출입구나 흐름으로 바로 설명합니다.', '실제 사용 조건입니다.', STEP_THREE_ACTION),
    WEALTH:entry('재운(財運)','일과 돈 기회의 전통 지표','현공은 주로 향성·출입구·활동 위치에서 재운 경향을 봅니다.','수입이나 투자 수익의 보장이 아닙니다.'),
    RESIDENTIAL_STABILITY:entry('인정／거주 면(人丁)','거주·휴식·가정 안정','현공은 주로 산성과 조용한 공간에서 거주 면을 봅니다.','건강이나 가정 사건이 반드시 일어남을 뜻하지 않습니다.'),
    MOUNTAIN:entry('산(山)','높고 참·고요한 환경','현공의 산은 진짜 산만이 아니라 비교적 높고 안정되고 조용한 건물이나 공간도 가리킵니다.','안정에 가까운 작용을 받아들이는 데 씁니다.'),
    WATER:entry('수(水)','낮고 비움·동하는 환경','현공의 물은 진짜 물만이 아니라 도로·공터·흐름이 비교적 강한 위치도 가리킵니다.','활동에 가까운 작용을 받아들이는 데 씁니다.'),
    ANNUAL_PURPLE_WHITE:entry('유년 자백(流年紫白)','올해 구궁의 단기 변화','유년 자백은 입춘에 해를 바꿔, 그해의 객성을 주택 본명반에 겹칩니다.','올해의 사용 알림만 바꾸며, 주택 본명반을 다시 배열하거나 PR을 바꾸지 않습니다.'),
    MONTHLY_PURPLE_WHITE:entry('유월 자백(流月紫白)','이 절기 달의 단기 변화','유월 자백은 입춘·경칩 등 절기로 달을 바꾸며 양력 매월 1일을 쓰지 않습니다.','약 한 달의 알림만 주며 본명 격국을 뒤집을 수 없습니다.'),
    VISITING_STAR:entry('객성(客星)','어느 위치에 잠시 오는 별','연성과 월성은 시간에 따라 움직이므로 객성이라 부릅니다.','객성은 당기의 사용 방식만 보정할 뿐 주택 원국을 대신할 수 없습니다.'),
    ANNUAL_STAR:entry('연성(年星)','약 1년 영향을 주는 객성','연성은 입춘부터 작용해 다음 해 입춘에 다시 계산합니다.','사이트는 이것으로 올해 조용히 두면 좋음·사용을 늘려도 됨 같은 건의를 만듭니다.'),
    MONTHLY_STAR:entry('월성(月星)','다음 절기까지 영향을 주는 객성','월성은 각 절기가 바뀌는 때에 전환됩니다.','화면은 단기 알림만 주며 한 달 변화로 영구 이동을 요구하지 않습니다.'),
    STAR_ONE:entry('일백(一白)','일백 객성','일백은 자백구성(紫白九星)의 하나입니다. 당기 작용은 여전히 주택 본명궁과 실제 용도를 함께 봐야 합니다.','일백만으로 그 위치가 반드시 이롭다고 판단할 수 없습니다.'),
    STAR_TWO:entry('이흑(二黑)','이흑 객성','이흑은 자백구성의 하나입니다. 전통적으로 그것이 더해진 위치는 비교적 보수적으로 씁니다.','사이트는 청결·건조·통풍을 우선 건의하며 질병을 예측하지 않습니다.'),
    STAR_THREE:entry('삼벽(三碧)','삼벽 객성','삼벽은 자백구성의 하나입니다. 당기에는 흔히 소음·부딪힘·충돌성 활동을 줄여 다룹니다.','단기 사용 알림일 뿐 사건이 반드시 일어남을 뜻하지 않습니다.'),
    STAR_FOUR:entry('사록(四綠)','사록 객성','사록은 자백구성의 하나입니다. 전통적으로 흔히 독서·학습·문서 활동을 봅니다.','사용을 늘려도 되는지는 여전히 본명궁 조건이 정합니다.'),
    STAR_FIVE:entry('오황(五黃)','오황 객성','오황은 자백구성의 하나입니다. 전통적으로 그것이 더해진 위치는 큰 두드림과 공사를 피합니다.','일상생활은 평소대로 할 수 있으며 겁주는 식의 단언을 쓰지 않습니다.'),
    STAR_SIX:entry('육백(六白)','육백 객성','육백은 자백구성의 하나입니다. 전통적으로 흔히 일·관리·실행 활동을 봅니다.','사용을 늘릴 가치가 있는지는 여전히 본명궁 조건이 정합니다.'),
    STAR_SEVEN:entry('칠적(七赤)','칠적 객성','칠적은 자백구성의 하나입니다. 당기에는 흔히 부딪힘·파손·과도한 시끄러움을 줄여 다룹니다.','단기 알림일 뿐 반드시 손실을 뜻하지 않습니다.'),
    STAR_EIGHT:entry('팔백(八白)','팔백 객성','팔백은 자백구성의 하나입니다. 당기 작용은 주택 원운과 본명궁을 함께 판단해야 합니다.','과거 원운의 고정된 길흉 꼬리표를 그대로 쓸 수 없습니다.'),
    STAR_NINE:entry('구자(九紫)','구자 객성','구자는 자백구성의 하나입니다. 당기 작용은 주택 본명궁과 실제 용도를 함께 봐야 합니다.','구자만으로 그 위치가 반드시 이롭다고 판단할 수 없습니다.'),
    YUAN_DRAGON:entry('원룡(元龍)','24산의 분류 방식','원룡(元龍)은 각 괘의 세 산을 천원·지원·인원으로 나눕니다.','궁반 계산에만 씁니다.'),
    FORWARD_REVERSE:entry('순비／역비(順飛／逆飛)','비성 배열의 방향','사이트가 좌향 음양에 따라 구성이 앞으로 또는 뒤로 배열되는지 정합니다.','계산 단계일 뿐 사용자가 조작할 필요가 없습니다.'),
    FIVE_YELLOW_LODGING:entry('오황 기궁(五黃寄宮)','오황의 특수 계산','오황은 고정된 후천 괘궁이 없어 심씨 규칙에 따라 별도로 처리해야 합니다.','궁반 엔진이 자동으로 처리합니다.')
  };

  const PATTERN_KEY={
    DAO_SHAN_DAO_XIANG:'DAO_SHAN_DAO_XIANG',
    SHANG_SHAN_XIA_SHUI:'SHANG_SHAN_XIA_SHUI',
    DOUBLE_AT_MOUNTAIN:'DOUBLE_AT_MOUNTAIN',
    DOUBLE_AT_FACING:'DOUBLE_AT_FACING',
    WANG_SHAN_ONLY:'WANG_SHAN',
    WANG_XIANG_ONLY:'WANG_XIANG',
    SHANG_SHAN_ONLY:'SHANG_SHAN',
    XIA_SHUI_ONLY:'XIA_SHUI',
    MIXED:null
  };

  const patternCopy=assessment=>{
    const key=PATTERN_KEY[assessment?.pattern?.primary]||null;
    if(!key)return {key:null,title:'전반 표현이 보통',summary:'이로운 위치와 주의해야 할 위치가 모두 있습니다.',professionalName:'종합 격국'};
    const row=GLOSSARY[key];
    return {key,title:row.beginner.title,summary:row.beginner.summary,professionalName:row.professionalName};
  };

  const riskCopy=assessment=>{
    const f=assessment?.fanFuYin||{};
    if(f.fullFanYin||f.fullFuYin){
      const terms=[f.fullFanYin?'전반 반음(全盤反吟)':null,f.fullFuYin?'전반 복음(全盤伏吟)':null].filter(Boolean).join('／');
      return {level:'major',title:'이 택반에 비교적 중요한 구조 문제가 하나 있습니다',summary:'장기 집 선택 시 무시하면 안 됩니다.',professionalName:terms,keys:[f.fullFanYin?'FULL_FAN_YIN':null,f.fullFuYin?'FULL_FU_YIN':null].filter(Boolean)};
    }
    if(f.riskLevel==='HIGH'||f.scope==='LOCAL')return {level:'local',title:'주요 방위에 국부적 반세(盤勢)가 하나 있어 주의가 필요합니다',summary:'택반 전체의 중대한 문제는 아닙니다.',professionalName:'국부 반음／복음',keys:['CORE_PALACE','LOCAL_FAN_YIN','LOCAL_FU_YIN']};
    return {level:'none',title:'전반적인 중대 문제는 발견되지 않았습니다',summary:'지금은 특별히 처리할 필요가 없습니다.',professionalName:'중대 반음／복음 없음',keys:[]};
  };

  const periodCopy=assessment=>assessment?.originalPeriodActive
    ?{title:'지금도 원래의 유효 운세 주기 안입니다',summary:`${assessment.housePeriod}운 주택이며 현재도 ${assessment.currentPeriod}운입니다.`,professionalName:`원래 성립한 ${assessment.housePeriod}운 유지 중`,key:'IN_PERIOD'}
    :{title:'원래 가장 이로운 20년 주기를 이미 떠났습니다',summary:`${assessment.housePeriod}운 주택이며 현재는 ${assessment.currentPeriod}운에 들어섰습니다.`,professionalName:`${assessment.housePeriod}운 택, 현재 ${assessment.currentPeriod}운`,key:'OUT_OF_PERIOD'};

  const earthLuckCopy=assessment=>{
    const e=assessment?.earthLuck||{},effective=assessment?.imprisonment?.effective||{},remaining=Number(effective.remainingYears),imprisoned=effective.status==='IMPRISONED',current=Boolean(effective.mountainStarImprisonedNow||effective.facingStarImprisonedNow);
    if(current)return {title:'이 겸향반은 이미 주의가 필요한 단계에 들어섰습니다',summary:'일반적인 장기 햇수만 봐서는 안 됩니다.',professionalName:effective.mountainStarImprisonedNow&&effective.facingStarImprisonedNow?'산성·향성 입수':effective.mountainStarImprisonedNow?'산성 입수':'향성 입수',keys:[effective.mountainStarImprisonedNow?'MOUNTAIN_IMPRISONMENT':null,effective.facingStarImprisonedNow?'FACING_IMPRISONMENT':null].filter(Boolean)};
    if(imprisoned)return {title:'이 택반은 이미 주의가 필요한 단계에 들어섰습니다',summary:'장기 보유 시 주의를 높여야 합니다.',professionalName:`약 ${effective.imprisonmentStartYear}년 전후에 입수`,keys:['EARTH_LUCK','IMPRISONMENT']};
    const title=remaining>40?'장기 택운이 아직 매우 넉넉함':remaining>20?'장기 택운이 그런대로 넉넉함':remaining>10?'앞으로 주의하기 시작해야 함':remaining>5?'이미 다음 단계에 가까움':'곧 주의가 필요한 다음 단계에 들어섬';
    const summary=remaining>20?'가까운 시일에 시간 압박이 없습니다.':remaining>5?`약 ${remaining}년 남았습니다.`:'장기 보유 시 주의를 높여야 합니다.';
    return {title,summary,professionalName:`이론 지운 약 ${e.theoreticalEarthLuckYears}년; 약 ${effective.imprisonmentStartYear}년 입수`,keys:['EARTH_LUCK','IMPRISONMENT']};
  };

  const overviewCopy=assessment=>{
    const pattern=patternCopy(assessment),risk=riskCopy(assessment),period=periodCopy(assessment),earth=earthLuckCopy(assessment);
    const riskSentence=risk.level==='none'?'전반적인 중대 문제는 없습니다.':`${risk.title}, ${risk.summary}`;
    const timeSentence=`${period.title}, ${earth.title}.`;
    return {title:pattern.title,summary:`${riskSentence}${timeSentence}`,pattern,risk,period,earth};
  };

  const decisionCopy=(assessment,kind)=>{
    const row=kind==='rental'?assessment?.rentalAssessment:assessment?.purchaseAssessment,code=row?.code;
    if(kind==='rental'){
      if(code==='CONSIDER')return {title:'단기 거주는 고려 가능',summary:'지금은 우선 배제해야 할 택반 문제가 없습니다.'};
      if(code==='NOT_PRIORITY')return {title:'단기 거주는 우선순위 아님',summary:'택반에 먼저 볼 알림이 있어 다른 집을 더 비교하기를 권합니다.'};
      return {title:'단기 거주 전 한 번 더 확인',summary:'먼저 3단계에서 침실과 대문 위치를 표시하면 사이트가 함께 분석합니다.'};
    }
    if(code==='CONSIDER')return {title:'장기 보유는 고려 가능',summary:'전반 구조와 유효 시간에 뚜렷한 압박이 없습니다.'};
    if(code==='NOT_PRIORITY')return {title:'장기 보유는 우선순위 아님',summary:'장기 거주 위험이 비교적 높아 매입 전에 더 비교하기를 권합니다.'};
    return {title:'매입 전에 더 비교하기를 권함',summary:'장기 보유는 전반 문제와 유효 시간을 함께 고려해야 합니다.'};
  };

  const practicalImprisonmentCopy=assessment=>{
    const effective=assessment?.imprisonment?.effective||{},remaining=Number(effective.remainingYears),year=Number(effective.imprisonmentStartYear),mountain=Boolean(effective.mountainStarImprisonedNow),facing=Boolean(effective.facingStarImprisonedNow);
    if(mountain||facing){
      const subject=mountain&&facing?'산성과 향성':mountain?'산성':'향성';
      return `이 겸향반의 ${subject}이(가) 지금 이미 중앙에 들어가, 제한이 이미 발생했으며 몇 년 뒤에 시작하는 것이 아닙니다.`;
    }
    if(effective.status==='IMPRISONED')return Number.isFinite(year)?`이 택반은 약 ${year}년 전후에 이미 제한 단계에 들어섰으니 장기 보유 시 주의를 높여야 합니다.`:'이 택반은 이미 제한 단계에 들어섰으니 장기 보유 시 주의를 높여야 합니다.';
    if(Number.isFinite(remaining)&&Number.isFinite(year))return `이 택반 계산에 따르면 다음 제한 단계까지 약 ${remaining}년 남았고, 약 ${year}년 전후에 바뀝니다.`;
    return '';
  };

  const sentence=text=>{const value=String(text||'').trim();return !value?'':/[。！？.!?]$/.test(value)?value:`${value}.`};
  const conciseExplanation=row=>{
    const parts=[row?.beginner?.title,row?.explanation,row?.impact,row?.judgement,row?.context];
    if(row?.action&&row.action!==NO_ACTION)parts.push(row.action);
    return [...new Set(parts.map(sentence).filter(Boolean))].join('');
  };

  const detailsForAssessment=assessment=>{
    const overview=overviewCopy(assessment),keys=[overview.pattern.key,...overview.risk.keys,overview.period.key,...overview.earth.keys].filter(Boolean);
    const context=practicalImprisonmentCopy(assessment);
    return [...new Set(keys)].map(key=>({key,...GLOSSARY[key],context:key==='IMPRISONMENT'||key==='MOUNTAIN_IMPRISONMENT'||key==='FACING_IMPRISONMENT'?context:''})).filter(row=>row.professionalName);
  };

  const PROHIBITED_BEGINNER_TERMS=['복핵','납기','재동','영성','좌산','향수','외국','원룡','입수','반음','복음','왕기','영신','정신','성문','합십'];
  const DANGLING_PHRASES=['함께 봐야','여전히','다시 봐야','다시 판단해야','검토 필요','더 봐야','다시 확인'];

  return {GLOSSARY,NO_ACTION,STEP_THREE_ACTION,NOT_AVAILABLE_ACTION,PROHIBITED_BEGINNER_TERMS,DANGLING_PHRASES,patternCopy,riskCopy,periodCopy,earthLuckCopy,overviewCopy,decisionCopy,practicalImprisonmentCopy,conciseExplanation,detailsForAssessment};
});
