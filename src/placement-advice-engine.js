(function(root){
  'use strict';
  const guidance=root.DualStarGuidance;
  if(!guidance)throw new Error('PlacementAdviceEngine requires DualStarGuidance');

  const palaces=['SE','S','SW','E','C','W','NE','N','NW'];
  const modes=['buy','lived','rent'];
  const statuses=['適合','不錯','一般','謹慎','避免'];
  const groups={
    rooms:['玄關','客廳','餐廳','主臥室','次臥室','兒童房','長輩房','書房','工作室','廚房','浴室','廁所','儲藏室','更衣室','其他房間'],
    openings:['大門','次要門','窗戶','陽台','天井／採光井'],
    furniture:['床位','嬰兒床','書桌／工作位','辦公桌','沙發','餐桌','衣櫃','鞋櫃','鏡子','神位','其他家具'],
    equipment:['爐灶','洗手盆／取水處','浴缸','飲水機','魚缸','水景','其他動水','電視','冰箱','洗衣機','冷氣','空調／風口'],
    circulation:['走道／通道','樓梯','電梯','收銀／辦公位'],
    exterior:['道路','動水','空曠處','低處','高樓','實山'],
    forms:['橫樑','柱','樹木','植物','煙囪','尖塔','電桿','橋口','尖角','房屋缺角','房屋凸角']
  };
  const items=Object.values(groups).flat();
  function koJosa(word,pair){const text=String(word??'');let jong=-1;for(let i=text.length-1;i>=0;i--){const code=text.charCodeAt(i);if(code>=0xAC00&&code<=0xD7A3){jong=(code-0xAC00)%28;break}if(code>=48&&code<=57){jong=[21,8,0,16,0,0,7,8,8,0][code-48];break}}if(jong<0)jong=0;const has=jong!==0;return pair==='은는'?(has?'은':'는'):pair==='이가'?(has?'이':'가'):pair==='을를'?(has?'을':'를'):pair==='과와'?(has?'과':'와'):pair==='으로'?((has&&jong!==8)?'으로':'로'):''}
  const koWith=(word,pair)=>`${word}${koJosa(word,pair)}`;
  const KO_ITEM={'玄關':'현관','客廳':'거실','餐廳':'식당','主臥室':'안방','次臥室':'작은방','兒童房':'아이방','長輩房':'어르신방','書房':'서재','工作室':'작업실','廚房':'주방','浴室':'욕실','廁所':'화장실','儲藏室':'창고방','更衣室':'드레스룸','其他房間':'기타 공간','大門':'대문','次要門':'보조문','窗戶':'창문','陽台':'발코니','天井／採光井':'채광정','床位':'침대 자리','嬰兒床':'아기 침대','書桌／工作位':'책상','辦公桌':'사무 책상','沙發':'소파','餐桌':'식탁','衣櫃':'옷장','鞋櫃':'신발장','鏡子':'거울','神位':'신위','其他家具':'기타 가구','爐灶':'가스레인지','洗手盆／取水處':'세면대','浴缸':'욕조','飲水機':'정수기','魚缸':'어항','水景':'수경','其他動水':'기타 동수','電視':'TV','冰箱':'냉장고','洗衣機':'세탁기','冷氣':'에어컨','空調／風口':'바람길','走道／通道':'복도','樓梯':'계단','電梯':'엘리베이터','收銀／辦公位':'계산대','道路':'도로','動水':'동수','空曠處':'빈터','低處':'낮은 곳','高樓':'높은 건물','實山':'실산','橫樑':'대들보','柱':'기둥','樹木':'나무','植物':'식물','煙囪':'굴뚝','尖塔':'첨탑','電桿':'전봇대','橋口':'교량 입구','尖角':'모서리','房屋缺角':'결각','房屋凸角':'돌출각'};
  const koName=item=>KO_ITEM[item]||item;
  const itemGroup=Object.fromEntries(Object.entries(groups).flatMap(([group,list])=>list.map(item=>[item,group])));
  const longStay=new Set(['主臥室','次臥室','兒童房','長輩房','書房','工作室','床位','嬰兒床','書桌／工作位','辦公桌','神位','衣櫃']);
  const activeUse=new Set(['玄關','客廳','餐廳','廚房','大門','次要門','窗戶','陽台','爐灶','洗手盆／取水處','飲水機','魚缸','水景','其他動水','電視','洗衣機','冷氣','空調／風口','走道／通道','樓梯','電梯','收銀／辦公位','道路','動水','空曠處','低處']);
  const lowUse=new Set(['浴室','廁所','儲藏室','更衣室']);
  const fireItems=new Set(['廚房','爐灶','電視','冰箱','冷氣','空調／風口','煙囪','尖塔']);
  const waterItems=new Set(['浴室','廁所','洗手盆／取水處','浴缸','飲水機','魚缸','水景','其他動水','洗衣機','道路','動水','低處']);
  const sharpItems=new Set(['爐灶','橫樑','柱','煙囪','尖塔','電桿','橋口','尖角']);
  const highSolid=new Set(['衣櫃','鞋櫃','神位','高樓','實山','橫樑','柱','樹木']);

  const axisOverride={
    玄關:'facing',客廳:'both',餐廳:'both',主臥室:'mountain',次臥室:'mountain',兒童房:'mountain',長輩房:'mountain',書房:'mountain',工作室:'both',廚房:'facing',浴室:'facing',廁所:'facing',儲藏室:'mountain',更衣室:'mountain',其他房間:'both',
    床位:'mountain',嬰兒床:'mountain','書桌／工作位':'mountain',辦公桌:'mountain',沙發:'mountain',餐桌:'both',衣櫃:'mountain',鞋櫃:'facing',鏡子:'both',神位:'mountain',其他家具:'both',
    冰箱:'both',高樓:'mountain',實山:'mountain',樹木:'mountain',植物:'both',橫樑:'mountain',柱:'mountain','房屋缺角':'both','房屋凸角':'both'
  };
  function axisFor(item){return axisOverride[item]||(activeUse.has(item)?'facing':'both')}

  const needs={
    rooms:'용도가 분명한지, 주요 가구의 정위치, 통풍·채광과 실제 사용 시간',
    openings:'개구부 크기, 여닫는 빈도, 외부에서 들어오는 경로와 실제로 받아들이는 활동',
    furniture:'가구의 중심과 사용자 위치, 뒤쪽의 승탁(承托), 문·창의 직풍과 통행 안전',
    equipment:'설비의 중심, 가동 시간, 열·물·전기·진동·소음과 유지보수 안전',
    circulation:'실제 보행 방향, 꺾임, 속도, 사용 빈도와 마지막으로 어디로 이어지는지',
    exterior:'방향·거리·높낮이·규모·흐름, 그리고 실제로 주택에 작용하는지 여부',
    forms:'형체의 방향·거리·크기·재질, 그리고 문·침대·좌석을 누르는지 여부'
  };
  const risks={
    rooms:'방을 오래 사용할 때 수면·집중·가족 간 관계와 일상 효율이 같은 조건의 영향을 꾸준히 받습니다',
    openings:'문·창과 발코니는 사람·소리·바람·외부 활동을 반복해 끌어들여, 본궁(本宮)의 좋고 나쁨을 키우기 쉽습니다',
    furniture:'사용자가 같은 자리에 머물거나 반복해 접촉하므로, 잘못 놓으면 수면 방해·산만·부딪힘·동선 방해가 생기기 쉽습니다',
    equipment:'설비의 열·물·전기·바람·소리·진동이 본궁을 계속 자극하므로, 겉모습과 색만 봐서는 안 됩니다',
    circulation:'잦은 이동은 본궁을 반복해 작동시켜, 다툼·조급함·파손·정체감을 더 뚜렷하게 만들기 쉽습니다',
    exterior:'통제하기 어려운 외부 형세는 오래 작용하며, 주요 문·창을 정면으로 향하면 작은 실내 소품보다 영향이 큽니다',
    forms:'뾰족하거나 무겁거나 높거나 누르거나 들쭉날쭉한 형체는 실제 가림·압박·부딪힘을 일으킬 수 있어, 상징물만으로는 처리할 수 없습니다'
  };
  const itemRisk={
    玄關:'신발장·종이상자·가림막이 입구를 막으면, 집에 오자마자 막히는 느낌이 들고 가족이 서로 비켜 다니며 잡동사니가 점점 쌓이기 쉽습니다.',
    客廳:'잦은 대화·TV·손님이 본궁 분위기를 키우므로, 배치가 나쁘면 가족이 오래 앉고 싶어 하지 않고 대화가 금세 다툼으로 번지기 쉽습니다.',
    餐廳:'식탁이 주요 통로를 겸하면 식사가 자주 끊기고, 재촉·부딪힘이 생겨 조용히 함께하기 어려워집니다.',
    主臥室:'오랜 수면은 영향을 누적시켜, 배치가 나쁘면 흔히 숙면 방해·조급한 감정·부부가 서로 양보 못 함·쉬어도 여전히 피곤함으로 먼저 나타납니다.',
    次臥室:'상주하는 방이면 문제가 안방에 가깝고, 가끔만 쓰면 영향이 적지만, 그래도 침대를 문바람·소음·궁(宮) 경계에 두는 것은 좋지 않습니다.',
    兒童房:'아이의 수면·놀이·학습이 한 공간에 몰리므로, 빛·소리가 과하거나 뾰족한 모서리·빠른 동선이 있으면 들뜸·산만·부딪힘이 늘어납니다.',
    長輩房:'야간 기상, 청력·시력·균형 요구가 더 크므로, 위치가 불안정하고 습기·문바람·잡동사니가 있으면 낙상과 수면 방해를 우선 처리할 가치가 있습니다.',
    書房:'주로 산만함·문서 반복 수정·오래 못 앉음·가족이 계속 지나다님·업무 진행이 끊김으로 나타납니다.',
    工作室:'실제 작업에 따라 나눠야 합니다. 조용한 서류 작업·응대·기계·공구가 뒤섞이면 소음·부딪힘·효율 저하가 동시에 생기기 쉽습니다.',
    廚房:'불·물·전기·칼·잦은 조작이 함께 있어, 본궁이 자극받으면 안 되는 곳이면 과열·설비 잦은 고장·가족의 조급함·조작 중 부딪힘으로 나타나기 쉽습니다.',
    浴室:'습기·고인 물·배기 불량은 무거운 느낌을 키우므로, 가장 먼저 누수·곰팡이 냄새·미끄럼 방지·야간 조명을 처리해야 합니다.',
    廁所:'문을 계속 열어두거나 누수가 있거나 주요 동선에 있으면, 배수와 습기가 인접 공간에 계속 영향을 줍니다. 화장실이 모든 문제를 저절로 눌러준다고 여겨서는 안 됩니다.',
    儲藏室:'사용 빈도는 낮지만 물건을 너무 높거나 무겁게 쌓거나 점검구를 막으면, 여전히 습기·화재 하중·물건을 꺼낼 때의 부딪힘을 일으킵니다.',
    更衣室:'높은 장·장문·좁은 회전 공간의 배치가 나쁘면 압박감·부딪힘이 생기기 쉽고, 수납도 금세 통제를 벗어납니다.',
    大門:'대문은 집 전체에서 가장 드나듦이 잦고 외부 기운을 받아들이는 자리이므로, 활동에 맞지 않는 궁에 놓이면 매일의 여닫음·발걸음·외부 경로로 문제가 반복해 커집니다.',
    次要門:'자주 열고 주요 동선과 이어질 때만 강하게 작용합니다. 실제 주요 출입구가 되면 대문 수준으로 다시 판단해야 합니다.',
    窗戶:'큰 창·자주 여는 창·강풍은 향성(向星)을 키웁니다. 침대·책상·불을 직접 향하면 수면·집중·조작 안전 문제도 생깁니다.',
    陽台:'발코니가 주요 채광·통풍면이면 큰 기구(氣口)에 가깝게 작용합니다. 창을 막거나 물건을 쌓거나 높은 건물이 바짝 붙으면 실제 효과가 바뀝니다.',
    '天井／採光井':'고인 물·어두움·여러 층을 바로 관통하는 소리·바람은 인접한 방에 영향을 줍니다. 천정(天井)이 보인다고 바로 좋은 기구로 여겨서는 안 됩니다.',
    床位:'침대는 가장 중요한 장시간 정적 위치입니다. 머리맡이 불안정하거나 문·창에 붙거나 배관에 붙거나 궁을 가로지르면, 대개 수면·휴식의 질이 가장 먼저 영향을 받습니다.',
    嬰兒床:'일반 침대 조건 외에도 에어컨 직풍·커튼 줄·콘센트·장 넘어짐·성인의 빠른 통행을 피해야 합니다.',
    '書桌／工作位':'자리 뒤로 사람이 자주 지나가거나 강한 빛을 정면으로 받거나 출입구에 방해받으면, 산만함·피로·업무 반복이 생기기 쉽습니다.',
    辦公桌:'관리자·장시간 근무 자리는 안정과 대외 활동을 함께 살펴야 합니다. 방향만 좇고 뒤쪽·눈부심·사람 흐름을 무시하면 실제 효과가 더 나빠집니다.',
    沙發:'소파는 거실에서 오래 앉는 주요 지점입니다. 대문 직선·통로·강풍 입구에 가까우면 가족이 편히 앉기 어렵고 대화도 끊기기 쉽습니다.',
    餐桌:'식탁 둘레에 온전한 통로가 없으면 음식 나르기·의자 빼기·가족 통행이 서로 방해하고, 뾰족한 모서리와 열원도 부딪힘을 늘립니다.',
    衣櫃:'큰 옷장은 높고 무거운 물건이라, 개방과 흐름이 필요한 자리에 두면 빛·바람을 막고 통로를 좁히며 넘어짐 위험도 생길 수 있습니다.',
    鞋櫃:'신발장이 너무 높거나 깊거나 문짝을 바로 막으면, 현관이 좁아지고 냄새가 쌓이며 드나들 때 서로 부딪히기 쉽습니다.',
    鏡子:'거울 자체가 길흉을 직접 정하지는 않지만, 강한 빛을 반사하거나 침대를 정면으로 비추거나 좁은 동선에 착시를 만들면 수면과 보행 안전에 영향을 줍니다.',
    神位:'안정·청결·통행 적음·향 안전을 우선해야 합니다. 욕실·화장실·불·진동 설비에 붙이거나 만능 해소물로 삼는 것은 좋지 않습니다.',
    爐灶:'실제 불과 높은 열은 그 궁을 뚜렷이 자극합니다. 싱크대·냉장고·창바람·가연성 장·주요 통로에 바짝 붙이지 않는 것이 좋습니다.',
    '洗手盆／取水處':'반복되는 물 사용과 배수는 습기 문제를 키웁니다. 누수·고인 물이 있거나 불에 바짝 붙으면 먼저 공사와 조작 안전을 처리하세요.',
    浴缸:'욕조는 많은 물·습기·하중·드나들 때의 넘나듦을 함께 지닙니다. 위치가 맞지 않으면 고인 물·곰팡이 냄새·미끄럼·야간 기상 안전을 우선 처리하세요.',
    飲水機:'큰 수경(水景)보다는 약하지만, 사용 빈도·누수·전선·통로 방해 여부를 봐야 하며 크기가 작다고 무시해서는 안 됩니다.',
    魚缸:'크고 계속 순환하는 어항은 향성을 강하게 작동시킵니다. 누수·하중·청소·전기 위험을 재물 번창 이야기보다 먼저 봐야 합니다.',
    水景:'물소리·조명·펌프가 공간을 계속 자극하므로, 위치가 맞지 않으면 사람을 짜증나게 하거나 습기를 늘리거나 유지보수 부담을 키울 수 있습니다.',
    其他動水:'실제 수량·유속·가동 시간으로 판단해야 하며, 작은 장식용 물과 큰 도로·수영장을 같은 무게로 봐서는 안 됩니다.',
    電視:'빛·소리·열과 오랜 시청이 활동성을 높이므로, 침실이나 자극받으면 안 되는 궁에 두면 수면과 가족 간 교류에 영향을 주기 쉽습니다.',
    冰箱:'냉장고는 무게·냉온 교환·전력·가동 소음을 함께 지니므로, 문길을 막거나 불에 바짝 붙거나 수리 공간이 부족해지지 않게 해야 합니다.',
    洗衣機:'물 사용·배수·진동·소음이 본궁을 반복해 작동시킵니다. 바닥이 고르지 않거나 누수가 있거나 수면 구역에 가까우면 문제가 더 뚜렷합니다.',
    冷氣:'실제 작용은 바람이 나오는 방향과 사용 시간에 있습니다. 침대·소파·책상을 직접 향하는 것이, 본체가 어느 칸에 놓이는지보다 먼저 처리할 문제입니다.',
    '空調／風口':'강풍·소음·응축수·장시간 송풍이 바람 받는 구역에 반복해 영향을 주므로, 설비 본체만 표시해서는 안 됩니다.',
    '走道／通道':'길고 곧거나 좁거나 통행이 잦은 통로는 조급함과 부딪힘을 키웁니다. 문·침대·불을 직접 찌르면 동선을 우선 조정해야 합니다.',
    樓梯:'계단 중심보다 계단 입구와 실제 오르내리는 경로가 더 중요합니다. 조명·미끄럼 방지·손잡이와 문·침대를 바로 향하는지를 먼저 확인하세요.',
    電梯:'엘리베이터 문이 가까운 거리에서 집 문을 정면으로 향하면 빛·소리·사람 흐름이 바로 문 앞까지 옵니다. 꺾임·현관·거리가 있으면 비중을 낮춰야 합니다.',
    '收銀／辦公位':'거래가 오가는 쪽은 향성을 보고, 오래 앉는 자리는 산성을 봅니다. 두 가지가 한 점에 섞이면 손님 동선과 일에 집중하는 일이 서로 방해하기 쉽습니다.',
    道路:'도로는 최종 진입로·흐름·차속·거리를 봐야 합니다. 번잡함이 곧 왕성함은 아니며, 직충(直沖)과 교통 안전은 작은 소품으로 상쇄할 수 없습니다.',
    動水:'외부의 실제 물이나 큰 유동 수체의 작용은 실내 작은 수경보다 훨씬 큽니다. 오고 감·모임과 흩어짐·거리, 그리고 주요 개구부를 향하는지를 봐야 합니다.',
    空曠處:'개방은 향성을 받아들이는 데 도움이 되지만, 지나치게 노출되거나 강풍이 있거나 사방에 기댈 데가 없으면 기운이 모이지 않고 오래 머물기 어려울 수 있습니다.',
    低處:'낮은 땅은 물의 기세를 받을 수도 있지만, 고인 물·습기·배수 문제를 가져올 수도 있으므로 실제 높낮이 차이를 먼저 봐야 합니다.',
    高樓:'뒤쪽의 높은 건물은 승탁(承托)이 될 수 있지만, 앞쪽에 높은 건물이 바짝 붙으면 빛을 막고 압박하며 통풍을 방해할 수 있으니 무조건 뒷받침(靠山)이라 불러서는 안 됩니다.',
    實山:'거리·높이·형세, 그리고 진짜 뒤쪽(坐後)에 있는지를 봐야 합니다. 너무 가까이 붙어 누르거나 음습하거나 위험한 비탈은 좋은 승탁(承托)이 아닙니다.',
    橫樑:'들보 아래가 바로 침대·좌석·주요 통로이면, 국부적 압박과 부딪힘이 상징적 해석보다 더 직접적입니다. 구조 문제는 전문가에게 맡기세요.',
    柱:'기둥 모서리가 튀어나오거나 통로를 좁히거나 침대·책상에 가까우면 부딪히기 쉽습니다. 장식으로 감싸 구조와 대피 문제를 가려서는 안 됩니다.',
    樹木:'큰 나무는 뿌리·가림·떨어지는 가지·거리를 봐야 합니다. 적당한 녹음과 벽·창을 누르는 것은 완전히 다른 조건입니다.',
    植物:'식물이 너무 빽빽하거나 가시가 있거나 오래 시들면 유지보수와 부딪힘이 늘어나므로, 모든 녹색 식물을 길한 물건으로 여겨서는 안 됩니다.',
    煙囪:'연기·열·냄새, 그리고 가까운 거리에서 문·창을 정면으로 향하는지를 점검해야 합니다. 환경·소방 문제가 오행 상징보다 우선입니다.',
    尖塔:'거리·시야각, 그리고 주요 개구부를 바로 가리키는지가 실제 세기를 정합니다. 멀리 있는 작은 물체를 가까운 큰 뾰족한 물체와 같게 봐서는 안 됩니다.',
    電桿:'전선·변압 설비·소음·시선 압박을 실제로 평가해야 하며, 단일 사물 이름만으로 길흉을 단정해서는 안 됩니다.',
    橋口:'교량 입구와 램프는 차량 흐름의 오고 감·속도·높낮이 차·직충 여부를 봐야 합니다. 교통·소음·대기 오염을 먼저 처리하세요.',
    尖角:'주요 문·창을 정면으로 향하고 가까이 있는 큰 뾰족한 모서리만 비중을 높일 필요가 있습니다. 실내에서는 먼저 위치 이동·모서리 둥글리기·거리 두기로 처리할 수 있습니다.',
    房屋缺角:'온전한 외벽과 비례 평면도로 확인해야 합니다. 작은 홈·발코니·공용 배관실을 일률적으로 결각(缺角)으로 여겨서는 안 됩니다.',
    房屋凸角:'돌출부는 택심(宅心)과 각 궁의 면적을 바꾸므로, 온전한 윤곽에 따라 다시 위치를 잡아야 하며 상징물로 격국을 메운 척해서는 안 됩니다.'
  };
  const fallbackRisk={其他房間:'용도가 아직 구체적이지 않으니, 머무는 시간·활동량·열·물·전기·주요 가구로 먼저 판단하세요.',其他家具:'높고 무거운지·뾰족한지·열이 나는지·반사하는지·물을 지녔는지·동선을 막는지를 먼저 보고 적합 여부를 정하세요.'};
  const axisCopy={mountain:'오래 머무르거나 쉬거나 안정을 유지해야 하며',facing:'사람·여닫음·소리·물기를 반복해 끌어들이며',both:'사람이 머물면서 동시에 대화·이동·설비 활동도 있으며'};
  const starRisk={1:'감정과 계획이 오락가락, 습기나 물기가 과함',2:'피로·미룸·습기와 돌봄 부담',3:'조급함·다툼·소음과 손발 부딪힘',4:'산만함·문서 반복과 인간관계 오해',5:'일이 막힘·설비 잦은 고장·공사 후 늘어나는 번거로움',6:'통제욕 과함·권위 충돌과 차갑고 딱딱한 압박',7:'말실수·충동 소비·파손과 금속 부딪힘',8:'물건 쌓임·정체·통로 좁아짐과 무거운 물건의 압박',9:'과열·강한 빛·수면 방해와 전기 기기 부담'};
  const starGood={1:'사고·소통과 업무 흐름',2:'돌봄·가사와 안정적 지지',3:'행동·실행과 개척',4:'독서·집필·설계와 조율',5:'장기적 문제를 발견하고 처리하기',6:'관리·결정과 재무 규율',7:'표현·응대·영업과 기술',8:'수납·자산과 장기 계획',9:'창의·노출·기술과 가족 활동'};

  // 쌍성 해석 텍스트는 이미 쉬운 한국어 풀이로 번역되어 있어 별도 치환이 필요 없다(식별자/계산 토큰 불변).
  function normalize(text){return String(text||'')}
  function orderedPair(pair){const value=String(pair).padStart(2,'0');return {mountain:Number(value[0]),facing:Number(value[1]),key:[...value].sort().join(''),value}}
  function periodDelta(star,period){const distance=(star-period+9)%9;if(distance===0)return 18;if(distance===1||distance===2)return 7;if(distance===8)return -4;return 0}
  function starPenalty(star,period){if(star===period)return 0;if(star===5)return -16;if(star===2)return -8;if(star===7)return -5;if(star===3)return -4;return 0}
  function statusFromScore(score){return score>=82?'適合':score>=68?'不錯':score>=50?'一般':score>=32?'謹慎':'避免'}
  function layerScore(star,period){return periodDelta(star,period)+starPenalty(star,period)}
  function evaluate({pair,palace,item,period=9,serviceMode='lived'}){
    const ordered=orderedPair(pair),base=guidance.profiles[ordered.key],pm=guidance.palaceMeta[palace],group=itemGroup[item],axis=axisFor(item);
    if(!base||!pm||!group||!modes.includes(serviceMode)||period<1||period>9)return null;
    const severity=base[4];let score=100-(severity-1)*17;
    if(axis==='mountain')score+=layerScore(ordered.mountain,period);else if(axis==='facing')score+=layerScore(ordered.facing,period);else score+=(layerScore(ordered.mountain,period)+layerScore(ordered.facing,period))/2;
    if(lowUse.has(item)&&severity>=4)score+=13;
    if(longStay.has(item)&&severity>=4)score-=8;
    if(activeUse.has(item)&&severity>=4)score-=7;
    if(fireItems.has(item)&&(ordered.mountain===5||ordered.facing===5||ordered.mountain===9||ordered.facing===9))score-=8;
    if(waterItems.has(item)&&(ordered.mountain===2||ordered.facing===2||ordered.mountain===5||ordered.facing===5))score-=6;
    if(sharpItems.has(item)&&(ordered.mountain===3||ordered.facing===3||ordered.mountain===6||ordered.facing===6||ordered.mountain===7||ordered.facing===7))score-=6;
    if(palace==='C'&&(activeUse.has(item)||fireItems.has(item)||waterItems.has(item)))score-=6;
    score=Math.max(0,Math.min(100,Math.round(score)));
    const status=statusFromScore(score),mainStar=axis==='mountain'?ordered.mountain:axis==='facing'?ordered.facing:null,layerReason=axis==='both'?`오래 머무르면 ${ordered.mountain} 성(星)의 영향을 받고, 일상 활동은 ${ordered.facing} 성을 자극합니다`:axis==='mountain'?`${mainStar} 성이 장시간 사용에 직접 영향을 줍니다`:`${mainStar} 성이 문 여닫음·이동·설비로 반복해 자극됩니다`;
    const name=koName(item);
    const why=`${koWith(name,'은는')} ${axisCopy[axis]}, ${pm.name}에서 ${layerReason}. ${normalize(base[1])}`;
    const itemProblem=itemRisk[item]||fallbackRisk[item]||`${koWith(name,'을를')} 맞지 않는 자리에 두면 이런 일이 생깁니다. ${risks[group]}`;
    const relevantRisk=axis==='mountain'?starRisk[ordered.mountain]:axis==='facing'?starRisk[ordered.facing]:`${starRisk[ordered.mountain]}, 그리고 ${starRisk[ordered.facing]}`;
    const goodCore=axis==='mountain'?starGood[ordered.mountain]:axis==='facing'?starGood[ordered.facing]:`${koWith(starGood[ordered.mountain],'과와')} ${starGood[ordered.facing]}`;
    const problem=status==='適合'||status==='不錯'?`지금은 ${koWith(goodCore,'을를')} 비교적 잘 살릴 수 있습니다. 그래도 실제로 물이 새거나, 시끄럽거나, 너무 뜨겁거나, 통로가 막히거나, 부딪히는 일은 피해야 합니다.`:status==='一般'?`사용할 수는 있지만, 배치가 나쁘면 ${koWith(relevantRisk,'이가')} 나타날 수 있습니다. ${itemProblem}`:`${name}의 주된 쓰임을 여기에 두는 것은 권하지 않습니다. ${koWith(relevantRisk,'이가')} 나타나기 쉽기 때문입니다. ${itemProblem}`;
    const target=axis==='mountain'?'조용하고 기댈 곳이 있으며 문바람이 적고 사람이 계속 지나다니지 않는 위치를 우선 고르세요':axis==='facing'?'개방적이고 통풍이 잘 되며 동선이 분명하고 일상 활동에 알맞은 위치를 우선 고르세요':'안심하고 머물 수 있으면서 동선이 서로 방해하지 않는 위치를 우선 고르세요';
    const modeAction={
      buy:`격국을 아직 고를 수 있다면 ${target}. 이 궁은 ${koWith(normalize(base[2]),'으로')} 바꾸는 편이 더 알맞습니다.`,
      lived:`방을 옮길 수 없다면, 먼저 침대·책상·소파·불 같은 실제 사용 지점을 본궁의 불리한 작은 칸 밖으로 옮기고, 소음·열원·물·빠른 통행·공사를 줄이세요.`,
      rent:`옮길 수 있는 침대·책상·소파·전자기기를 먼저 이동하세요. 벽을 바꿀 수 없을 때는 사용 위치·문 여닫는 빈도·조명·수납·통로 확보로 영향을 줄이세요.`
    }[serviceMode];
    const action=(status==='適合'||status==='不錯')?`${target}. 안전·청결·실제 사용을 유지하면 되고, 상징적인 소품을 더 쌓을 필요는 없습니다.`:modeAction;
    return {pair:ordered.value,palace,item,period,serviceMode,status,score,axis,why,problem,target,action,avoid:`${koWith(normalize(base[3]),'을를')} 피하고, ${koWith(relevantRisk,'을를')} 키우는 실제 조건도 늘리지 마세요.`,principle:`먼저 ${koWith(needs[group],'을를')} 보세요. ${risks[group]}.`,source:'《심씨현공학(沈氏玄空學)》의 산성·향성, 원운 왕쇠와 안팎의 육사 원칙을 먼저 보고, 옛 비결은 별 조합 원문을 대조할 때만 씁니다.'};
  }
  function rank({item,period=9,serviceMode='lived',chart}){
    if(!Array.isArray(chart))return [];
    return chart.map(({palace,pair})=>evaluate({pair,palace,item,period,serviceMode})).filter(Boolean).sort((a,b)=>b.score-a.score||palaces.indexOf(a.palace)-palaces.indexOf(b.palace));
  }
  function coverage(){return {orderedPairs:81,palaces:palaces.length,items:items.length,periods:9,modes:modes.length,total:81*palaces.length*items.length*9*modes.length}}
  root.PlacementAdviceEngine={evaluate,rank,coverage,items,palaces,modes,statuses,itemGroup,sourcePriority:['《심씨현공학(沈氏玄空學)》의 산성·향성, 원운 왕쇠, 형세와 내외 육사','《현공비지(玄空秘旨)》《비성부(飛星賦)》《현기부(玄機賦)》《자백결(紫白訣)》《죽절부(竹節賦)》《천옥경(天玉經)》《설괘전(說卦傳)》 원문 대조']};
})(typeof window!=='undefined'?window:globalThis);
