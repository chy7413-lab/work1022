/**
 * 엑셀(.xlsx, .xls) 및 CSV 파일 파서 모듈
 * SheetJS (XLSX) 라이브러리를 활용하여 다양한 양식의 예산 데이터를 표준 형식으로 정규화
 */
const BudgetParser = {
  /**
   * File 객체를 받아 정규화된 항목 배열을 Promise로 반환
   * @param {File} file
   * @returns {Promise<Array>}
   */
  async parseFile(file) {
    const isCsv = file.name.endsWith('.csv');
    const buffer = await file.arrayBuffer();

    let workbook;
    if (isCsv) {
      // CSV의 경우 인코딩(UTF-8 / EUC-KR) 처리
      const text = await this.readAsTextWithEncoding(file);
      workbook = XLSX.read(text, { type: 'string', raw: true });
    } else {
      workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("유효한 시트가 포함되어 있지 않은 파일입니다.");
    }

    // 첫 번째 시트 또는 이름에 '예산'/'중점'이 들어간 시트 탐색
    let targetSheetName = workbook.SheetNames[0];
    for (const name of workbook.SheetNames) {
      if (name.includes('예산') || name.includes('중점') || name.includes('추출')) {
        targetSheetName = name;
        break;
      }
    }

    const sheet = workbook.Sheets[targetSheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (!rawRows || rawRows.length < 2) {
      throw new Error("데이터 행이 충분하지 않습니다.");
    }

    return this.normalizeRows(rawRows);
  },

  /**
   * CSV 텍스트 인코딩 판별 읽기 (UTF-8 우선, 필요 시 EUC-KR)
   */
  async readAsTextWithEncoding(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("파일 읽기에 실패했습니다."));
      reader.readAsText(file, 'utf-8');
    });
  },

  /**
   * 2차원 배열 형태의 행 데이터를 표준 JSON 포맷으로 변환 및 헤더 자동 탐지
   */
  normalizeRows(rows) {
    // 1. 헤더 행 인덱스 찾기 ('분야' 또는 '사업' 또는 '2026' 또는 '2027' 단어가 포함된 행)
    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const rowStr = rows[i].map(c => String(c).trim()).join(' ');
      if ((rowStr.includes('분야') || rowStr.includes('사업')) && 
          (rowStr.includes('2026') || rowStr.includes('2027') || rowStr.includes('정부안') || rowStr.includes('증감'))) {
        headerRowIdx = i;
        break;
      }
    }

    // 헤더를 못 찾은 경우 기본 첫 번째 행을 헤더로 간주
    if (headerRowIdx === -1) {
      headerRowIdx = 0;
    }

    const header = rows[headerRowIdx].map(c => String(c).trim());
    const colMap = this.mapHeaderColumns(header);

    const items = [];
    let currentCategory = "기타 사업";

    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      // 행의 모든 셀이 비어있으면 스킵
      const hasContent = row.some(cell => String(cell).trim() !== '');
      if (!hasContent) continue;

      let category = this.getCellValue(row, colMap.category);
      const name = this.getCellValue(row, colMap.name);
      
      // 세부 사업명이 없으면 스킵 (혹은 합계/소계 행일 경우 스킵)
      if (!name || name.includes('합계') || name.includes('총계')) {
        continue;
      }

      if (category) {
        currentCategory = category;
      } else {
        category = currentCategory;
      }

      const id = this.getCellValue(row, colMap.id) || (items.length + 1);
      const unit = this.getCellValue(row, colMap.unit) || '억원';
      
      const prevValRaw = this.getCellValue(row, colMap.prevYear);
      const currValRaw = this.getCellValue(row, colMap.currYear);
      const diffValRaw = this.getCellValue(row, colMap.diff);
      const rateValRaw = String(this.getCellValue(row, colMap.rate) || '').trim();
      const descValRaw = this.getCellValue(row, colMap.description);

      const prevYear = this.parseNumeric(prevValRaw);
      const currYear = this.parseNumeric(currValRaw);

      let diff = this.parseNumeric(diffValRaw);
      if (diff === 0 && (currYear !== 0 || prevYear !== 0)) {
        diff = Math.round((currYear - prevYear) * 100) / 100;
      }

      // 신규 여부 판별
      const isNew = rateValRaw.includes('신규') || 
                    rateValRaw.toUpperCase().includes('NEW') || 
                    (prevYear === 0 && currYear > 0);

      // 증가율 계산/정규화
      let rate = rateValRaw;
      if (isNew) {
        rate = "신규";
      } else if (!rate || rate === '0%' || rate === '-') {
        if (prevYear > 0) {
          const calcRate = ((diff / prevYear) * 100).toFixed(1);
          rate = `${calcRate}%`;
        } else {
          rate = "0.0%";
        }
      }

      items.push({
        id: Number(id) || (items.length + 1),
        category: category,
        name: name,
        unit: unit,
        prevYear: prevYear,
        currYear: currYear,
        diff: diff,
        rate: rate,
        isNew: isNew,
        description: descValRaw || `${name} 관련 예산 편성 내역`
      });
    }

    if (items.length === 0) {
      throw new Error("유효한 사업 행을 추출할 수 없습니다. 엑셀 컬럼명을 확인해 주세요.");
    }

    return items;
  },

  /**
   * 헤더 텍스트를 분석하여 표준 컬럼 인덱스 매핑 객체 생성
   */
  mapHeaderColumns(headers) {
    const map = {
      id: -1,
      category: -1,
      name: -1,
      unit: -1,
      prevYear: -1,
      currYear: -1,
      diff: -1,
      rate: -1,
      description: -1
    };

    headers.forEach((h, idx) => {
      const clean = h.replace(/\s+/g, '').toLowerCase();

      if (clean.includes('연번') || clean === 'no' || clean === 'id' || clean === '번호') {
        if (map.id === -1) map.id = idx;
      } else if (clean.includes('분야') || clean.includes('중점영역') || clean.includes('카테고리')) {
        if (map.category === -1) map.category = idx;
      } else if (clean.includes('세부사업') || clean.includes('사업명') || clean.includes('주요지표') || clean.includes('세부과목')) {
        if (map.name === -1) map.name = idx;
      } else if (clean.includes('단위') || clean.includes('구분/단위') || clean === '구분') {
        if (map.unit === -1) map.unit = idx;
      } else if (clean.includes('2026') || clean.includes('(a)') || clean.includes('전년')) {
        if (map.prevYear === -1) map.prevYear = idx;
      } else if (clean.includes('2027') || clean.includes('(b)') || clean.includes('정부안') || clean.includes('당해')) {
        if (map.currYear === -1) map.currYear = idx;
      } else if (clean.includes('증감') || clean.includes('(b-a)')) {
        if (map.diff === -1) map.diff = idx;
      } else if (clean.includes('증가율') || clean.includes('증감율') || clean.includes('비율') || clean.includes('%')) {
        if (map.rate === -1) map.rate = idx;
      } else if (clean.includes('핵심') || clean.includes('보도자료') || clean.includes('근거') || clean.includes('비고') || clean.includes('설명')) {
        if (map.description === -1) map.description = idx;
      }
    });

    // 만약 매핑되지 않은 주요 컬럼이 있으면 기본 순서 추론 (C1~C9)
    if (map.category === -1 && headers.length > 1) map.category = 1;
    if (map.name === -1 && headers.length > 2) map.name = 2;
    if (map.unit === -1 && headers.length > 3) map.unit = 3;
    if (map.prevYear === -1 && headers.length > 4) map.prevYear = 4;
    if (map.currYear === -1 && headers.length > 5) map.currYear = 5;
    if (map.diff === -1 && headers.length > 6) map.diff = 6;
    if (map.rate === -1 && headers.length > 7) map.rate = 7;
    if (map.description === -1 && headers.length > 8) map.description = 8;

    return map;
  },

  getCellValue(row, idx) {
    if (idx === -1 || idx === undefined || idx >= row.length) return '';
    return String(row[idx]).trim();
  },

  /**
   * 콤마, 통화 기호, 공백 등을 제거하고 순수 숫자로 변환
   */
  parseNumeric(val) {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const clean = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }
};
