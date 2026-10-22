/**
 * 2027년 국방예산 기본 탑재 샘플 데이터
 * 국방부·방위사업청·병무청 2027년 국방예산 정부안 편성 보도자료 기반
 */
const DEFAULT_BUDGET_DATA = [
  {
    id: 1,
    category: "① 자주국방 & 전작권 전환",
    name: "전작권 전환 및 자주국방 핵심전력 확보",
    unit: "억원",
    prevYear: 90222,
    currYear: 121744,
    diff: 31522,
    rate: "34.9%",
    isNew: false,
    description: "전작권 전환 및 자주국방 예산 34.9% 대폭 증액 (KF-21 양산, 핵추진잠수함 착수, L-SAM 조기 확보 등 한국군 주도 연합방위 핵심전력 구축)"
  },
  {
    id: 2,
    category: "② 효율적 군 인력구조 전환",
    name: "상비예비군 운영 예산",
    unit: "억원",
    prevYear: 87,
    currYear: 256,
    diff: 169,
    rate: "194.3%",
    isNew: false,
    description: "상비예비군 3,700명에서 7,000명으로 대폭 확대. 평시 추가훈련을 통한 전시 즉각 전투력 발휘 보장 (+169억원 증액)"
  },
  {
    id: 3,
    category: "② 효율적 군 인력구조 전환",
    name: "예비군 훈련비 총예산",
    unit: "억원",
    prevYear: 688,
    currYear: 903,
    diff: 215,
    rate: "31.3%",
    isNew: false,
    description: "동원훈련 보상비 9.5만→13만 원(+36.8%), 작계훈련비 1만→1.6만 원(+60%) 등 ’30년까지 최저시급 수준 지급 목표 단계적 인상"
  },
  {
    id: 4,
    category: "③ AI·유무인 복합체계(MUM-T)",
    name: "AI·유무인 복합체계 총예산",
    unit: "억원",
    prevYear: 4968,
    currYear: 7727,
    diff: 2759,
    rate: "55.5%",
    isNew: false,
    description: "국방데이터 통합플랫폼(551억), GPU 1,137장 확보(366억), 국방AX 거점 확대 및 첨단 유·무인 복합체계 전환 집중 투자 (+55.5%)"
  },
  {
    id: 5,
    category: "③ AI·유무인 복합체계(MUM-T)",
    name: "피지컬 AI 실증사업",
    unit: "억원",
    prevYear: 0,
    currYear: 430,
    diff: 430,
    rate: "신규",
    isNew: true,
    description: "[신규 430억원] 수송·주둔지 경계·위험물 취급 등 병력절감 효과 큰 분야 휴머노이드(2대), UGV(4대), 다족보행로봇(200대) 시범도입"
  },
  {
    id: 6,
    category: "④ 드론 / 대드론 역량강화",
    name: "드론·대드론 역량강화 예산",
    unit: "억원",
    prevYear: 6788,
    currYear: 8061,
    diff: 1273,
    rate: "18.8%",
    isNew: false,
    description: "군집드론 R&D 착수, 중거리 및 분대급 자폭드론 도입, 레이저 대공무기 확충 등 다층 대드론 방어체계 고도화 (+1,273억원)"
  },
  {
    id: 7,
    category: "④ 드론 / 대드론 역량강화",
    name: "50만 드론전사 양성 교육훈련",
    unit: "억원",
    prevYear: 296,
    currYear: 771,
    diff: 475,
    rate: "160.5%",
    isNew: false,
    description: "전군 및 예비군 대상 교육용 상용드론 17,320대 확보, 시뮬레이터 및 대드론 교육장비 대폭 확충 (+475억원, +160.5%)"
  },
  {
    id: 8,
    category: "⑤ 장병 복무여건 & 간부 처우",
    name: "부사관 단기복무장려금 총예산",
    unit: "억원",
    prevYear: 531.5,
    currYear: 1152.0,
    diff: 620.5,
    rate: "116.7%",
    isNew: false,
    description: "장려금 단가 인상(1,000만 원 → 1,200만 원) 및 지원 대상 5,315명에서 9,600명으로 대폭 확대 반영 (+620.5억원, +116.7%)"
  },
  {
    id: 9,
    category: "⑤ 장병 복무여건 & 간부 처우",
    name: "단기복무 부사관 적금 매칭지원금",
    unit: "억원",
    prevYear: 0,
    currYear: 189,
    diff: 189,
    rate: "신규",
    isNew: true,
    description: "[신규 189억원] 기술집약형 부사관 육성을 위해 월 최대 30만원(3년 만기) 정부 매칭 지원, 만기 시 약 2,310만 원 자산 형성"
  },
  {
    id: 10,
    category: "⑤ 장병 복무여건 & 간부 처우",
    name: "간부 전세자금 지원단가 (관사 기준)",
    unit: "억원",
    prevYear: 2.11,
    currYear: 2.24,
    diff: 0.13,
    rate: "6.2%",
    isNew: false,
    description: "군 간부 주거 안정을 위해 중위 전세가의 84% 수준인 2.24억 원으로 전세자금 대출 한도 현실화 (+6.2%)"
  },
  {
    id: 11,
    category: "⑤ 장병 복무여건 & 간부 처우",
    name: "간부숙소 미입주자 전세자금 지원",
    unit: "억원",
    prevYear: 0.00,
    currYear: 1.05,
    diff: 1.05,
    rate: "신규",
    isNew: true,
    description: "[신규 지원] 숙소 공급 부족으로 관사/간부숙소를 배정받지 못한 초급간부 1,054명 대상 전세자금 이자 지원 신규 편성"
  },
  {
    id: 12,
    category: "⑤ 장병 복무여건 & 간부 처우",
    name: "병사 단체상해보험 도입",
    unit: "억원",
    prevYear: 0,
    currYear: 69,
    diff: 69,
    rate: "신규",
    isNew: true,
    description: "[신규 69억원] 군 복무 중 부상/질병 시 실질적인 민간 보상체계 확립 ('27년 7월 시행, 현역병 약 29만 명 전원 보장)"
  },
  {
    id: 13,
    category: "⑥ 미래 국방기술 주권 확보",
    name: "국방반도체 R&D 기술개발",
    unit: "억원",
    prevYear: 132,
    currYear: 565,
    diff: 433,
    rate: "328.0%",
    isNew: false,
    description: "[신규 R&D 565억원] 국방반도체법 시행('26.12)에 따른 무기체계 맞춤형 국산화 R&D 및 산학연 공동연구센터 구축 본격화 (+328%)"
  },
  {
    id: 14,
    category: "⑥ 미래 국방기술 주권 확보",
    name: "한국형 첨단항공추진체계(엔진)",
    unit: "억원",
    prevYear: 0,
    currYear: 90,
    diff: 90,
    rate: "신규",
    isNew: true,
    description: "[신규 90억원] 5,500 lbf급 무인전투기용 터보팬 엔진 시험개발(20억) + 차세대전투기용 16,000 lbf급 엔진 기반기술(70억)"
  },
  {
    id: 15,
    category: "⑥ 미래 국방기술 주권 확보",
    name: "고출력 레이저 하드킬 기술",
    unit: "억원",
    prevYear: 0,
    currYear: 121,
    diff: 121,
    rate: "신규",
    isNew: true,
    description: "[신규 121억원] 북한 드론 및 정밀유도무기 요격을 위한 고출력 레이저 기반 지향성에너지 하드킬 원천기술 연구개발"
  },
  {
    id: 16,
    category: "⑦ 방산 생태계 & 중소기업 육성",
    name: "K-방산 스타트업 발굴·육성",
    unit: "억원",
    prevYear: 54,
    currYear: 124,
    diff: 70,
    rate: "129.6%",
    isNew: false,
    description: "민간 첨단 기술 스타트업의 방산 진입 전주기 패키지(진입 1억→성장 5억→자립 21억) 지원 확대 (+129.6%)"
  },
  {
    id: 17,
    category: "⑦ 방산 생태계 & 중소기업 육성",
    name: "방산혁신기업 지원 예산",
    unit: "억원",
    prevYear: 659,
    currYear: 758,
    diff: 99,
    rate: "15.0%",
    isNew: false,
    description: "'방산혁신기업100'을 '방산혁신기업200'으로 확대, 우주·AI·양자·에너지 혁신 중소벤처기업 30개 내외 신규 선발 집중 육성"
  },
  {
    id: 18,
    category: "⑦ 방산 생태계 & 중소기업 육성",
    name: "중소기업 기술 軍 실증시험 지원",
    unit: "억원",
    prevYear: 78,
    currYear: 174,
    diff: 96,
    rate: "123.1%",
    isNew: false,
    description: "중소·벤처기업 개발품의 군 환경 현장실증 및 신속 성능검증 대폭 확대, 하향식 군 소요연계 과제 신설 (+123.1%)"
  },
  {
    id: 19,
    category: "⑦ 방산 생태계 & 중소기업 육성",
    name: "중소기업 수출 패키지 지원",
    unit: "억원",
    prevYear: 512,
    currYear: 627,
    diff: 115,
    rate: "22.5%",
    isNew: false,
    description: "방산 중소기업 수출길 개척(278억) 및 글로벌 가치사슬(GVC30) 진입 지원(348억) 패키지 (+22.5%)"
  },
  {
    id: 20,
    category: "⑧ 국민체감형 병무서비스",
    name: "생성형 AI 병무상담 챗봇 구축",
    unit: "억원",
    prevYear: 0,
    currYear: 19,
    diff: 19,
    rate: "신규",
    isNew: true,
    description: "[신규 19억원] 생성형 AI 및 RAG 기반 24시간 원스톱 맞춤형 병무상담 에이전트 구축으로 민원 대기시간 대폭 단축"
  },
  {
    id: 21,
    category: "⑧ 국민체감형 병무서비스",
    name: "병무청 동원훈련 통합관리시스템",
    unit: "억원",
    prevYear: 0,
    currYear: 14,
    diff: 14,
    rate: "신규",
    isNew: true,
    description: "[신규 14억원] 국방부-병무청으로 이원화되어 있던 예비군 동원훈련 행정업무를 병무청으로 원스톱 일원화하는 전산시스템 구축"
  },
  {
    id: 22,
    category: "⑧ 국민체감형 병무서비스",
    name: "국외체류자 입영·소집 항공여비",
    unit: "억원",
    prevYear: 0,
    currYear: 6,
    diff: 6,
    rate: "신규",
    isNew: true,
    description: "[신규 6억원] 자발적으로 병역을 이행하려는 재외국민 의무자 약 400명 대상 국내 입국 편도 항공료 신규 실비 지원"
  }
];

/** 분야별 메타정보 (아이콘, 대표색, 설명) */
const CATEGORY_META = {
  "① 자주국방 & 전작권 전환": {
    shortName: "자주국방·전작권",
    icon: "shield",
    color: "#2563EB",
    bgGradient: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(30,58,138,0.25))",
    borderColor: "#3B82F6"
  },
  "② 효율적 군 인력구조 전환": {
    shortName: "군 인력구조 개편",
    icon: "users",
    color: "#059669",
    bgGradient: "linear-gradient(135deg, rgba(5,150,105,0.15), rgba(6,78,59,0.25))",
    borderColor: "#10B981"
  },
  "③ AI·유무인 복합체계(MUM-T)": {
    shortName: "AI·유무인복합체계",
    icon: "cpu",
    color: "#7C3AED",
    bgGradient: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(76,29,149,0.25))",
    borderColor: "#8B5CF6"
  },
  "④ 드론 / 대드론 역량강화": {
    shortName: "드론·대드론 강화",
    icon: "crosshair",
    color: "#D97706",
    bgGradient: "linear-gradient(135deg, rgba(217,119,6,0.15), rgba(120,53,15,0.25))",
    borderColor: "#F59E0B"
  },
  "⑤ 장병 복무여건 & 간부 처우": {
    shortName: "복무여건·처우개선",
    icon: "heart",
    color: "#DB2777",
    bgGradient: "linear-gradient(135deg, rgba(219,39,119,0.15), rgba(131,24,67,0.25))",
    borderColor: "#EC4899"
  },
  "⑥ 미래 국방기술 주권 확보": {
    shortName: "미래 국방기술 R&D",
    icon: "zap",
    color: "#0891B2",
    bgGradient: "linear-gradient(135deg, rgba(8,145,178,0.15), rgba(22,78,99,0.25))",
    borderColor: "#06B6D4"
  },
  "⑦ 방산 생태계 & 중소기업 육성": {
    shortName: "방산생태계·중소기업",
    icon: "briefcase",
    color: "#0D9488",
    bgGradient: "linear-gradient(135deg, rgba(13,148,136,0.15), rgba(19,78,74,0.25))",
    borderColor: "#14B8A6"
  },
  "⑧ 국민체감형 병무서비스": {
    shortName: "국민체감 병무서비스",
    icon: "message-square",
    color: "#4F46E5",
    bgGradient: "linear-gradient(135deg, rgba(79,70,229,0.15), rgba(49,46,129,0.25))",
    borderColor: "#6366F1"
  }
};
