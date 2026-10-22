/**
 * 세부 사업 데이터 테이블, 다차원 필터링, 정렬 및 상세 모달 모듈
 */
const DataTableManager = {
  items: [],
  filteredItems: [],
  activeCategory: 'all',
  onlyNew: false,
  searchKeyword: '',
  sortKey: 'id',
  sortOrder: 'asc',

  init(items) {
    this.items = items;
    this.renderCategoryChips();
    this.bindControls();
    this.applyFilterAndSort();
  },

  updateData(newItems) {
    this.items = newItems;
    this.activeCategory = 'all';
    this.renderCategoryChips();
    this.applyFilterAndSort();
  },

  setCategoryFilter(category) {
    if (this.activeCategory === category) {
      this.activeCategory = 'all';
    } else {
      this.activeCategory = category;
    }
    this.updateActiveChip();
    this.applyFilterAndSort();

    // 테이블 영역으로 스크롤 이동
    const tableSection = document.getElementById('tableSection');
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  renderCategoryChips() {
    const container = document.getElementById('categoryChips');
    if (!container) return;

    // 카테고리 목록 추출
    const categories = ['all', ...new Set(this.items.map(i => i.category))];

    container.innerHTML = categories.map(cat => {
      const isAll = cat === 'all';
      const isSelected = this.activeCategory === cat;
      const label = isAll ? '전체 보기' : (CATEGORY_META[cat]?.shortName || cat.replace(/^[①-⑧\d\s.-]+/, '').trim());
      return `
        <button class="chip ${isSelected ? 'active' : ''}" data-cat="${cat}">
          ${label}
        </button>
      `;
    }).join('');

    container.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setCategoryFilter(btn.dataset.cat);
      });
    });
  },

  updateActiveChip() {
    const container = document.getElementById('categoryChips');
    if (!container) return;
    container.querySelectorAll('.chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === this.activeCategory);
    });
  },

  bindControls() {
    const searchInput = document.getElementById('tableSearch');
    const newOnlyToggle = document.getElementById('toggleNewOnly');
    const sortSelect = document.getElementById('tableSortSelect');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = e.target.value.trim().toLowerCase();
        this.applyFilterAndSort();
      });
    }

    if (newOnlyToggle) {
      newOnlyToggle.addEventListener('change', (e) => {
        this.onlyNew = e.target.checked;
        this.applyFilterAndSort();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const [key, order] = e.target.value.split('-');
        this.sortKey = key;
        this.sortOrder = order;
        this.applyFilterAndSort();
      });
    }

    // 세부사업 엑셀 다운로드 버튼 이벤트 연동
    const exportBtns = [
      document.getElementById('btnExportExcel'),
      document.getElementById('btnExportExcelSub')
    ];
    exportBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => this.exportToExcel());
      }
    });

    this.bindModalEvents();
  },

  /**
   * 현재 필터링/정렬된 세부 사업 데이터를 원본 규격의 엑셀(.xlsx) 파일로 내보내기
   */
  exportToExcel() {
    if (!this.filteredItems || this.filteredItems.length === 0) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('다운로드할 세부 사업 데이터가 없습니다.', 'error');
      }
      return;
    }

    if (typeof XLSX === 'undefined') {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('엑셀 생성 라이브러리를 불러오지 못했습니다.', 'error');
      }
      return;
    }

    // 1. 표준 헤더 행 정의 (업로드 이미지 원본 서식과 100% 동일)
    const headers = [
      '연번',
      '분야 (중점영역)',
      '세부 사업 / 주요 지표',
      '구분/단위',
      '2026년 (A)',
      '2027년 정부안 (B)',
      '증감 (B-A)',
      '증가율 (%)',
      '핵심 내용 및 보도자료 박스 원문 근거'
    ];

    // 2. 데이터 행 구성
    const dataRows = this.filteredItems.map(item => [
      item.id,
      item.category,
      item.name,
      item.unit,
      item.prevYear,
      item.currYear,
      item.diff,
      item.rate,
      item.description
    ]);

    // 3. 워크시트 생성
    const sheetData = [headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // 컬럼 너비 설정 (한글 가독성 최적화)
    ws['!cols'] = [
      { wch: 8 },  // 연번
      { wch: 28 }, // 분야 (중점영역)
      { wch: 38 }, // 세부 사업 / 주요 지표
      { wch: 10 }, // 구분/단위
      { wch: 16 }, // 2026년 (A)
      { wch: 18 }, // 2027년 정부안 (B)
      { wch: 16 }, // 증감 (B-A)
      { wch: 12 }, // 증가율 (%)
      { wch: 68 }  // 핵심 내용 및 보도자료 박스 원문 근거
    ];

    // 4. 워크북 생성 및 시트 추가
    const wb = XLSX.utils.book_new();
    const sheetName = this.activeCategory === 'all' ? '세부사업_예산현황' : '중점분야_세부사업';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 5. 파일명 생성 (필터 상태 및 날짜 반영)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    let filterSuffix = '';
    if (this.activeCategory !== 'all') {
      filterSuffix += `_${this.activeCategory.replace(/^[①-⑧\d\s.-]+/, '').trim()}`;
    }
    if (this.onlyNew) {
      filterSuffix += '_신규사업';
    }
    const fileName = `2027국방예산_세부사업별_현황${filterSuffix}_${dateStr}.xlsx`;

    // 6. 엑셀 파일 다운로드 실행
    XLSX.writeFile(wb, fileName);

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`📥 세부사업 자료 ${this.filteredItems.length}건이 엑셀 파일(${fileName})로 다운로드되었습니다.`, 'success');
    }
  },

  applyFilterAndSort() {
    // 1. 필터링
    this.filteredItems = this.items.filter(item => {
      if (this.activeCategory !== 'all' && item.category !== this.activeCategory) {
        return false;
      }
      if (this.onlyNew && !item.isNew) {
        return false;
      }
      if (this.searchKeyword) {
        const targetText = `${item.name} ${item.category} ${item.description}`.toLowerCase();
        if (!targetText.includes(this.searchKeyword)) {
          return false;
        }
      }
      return true;
    });

    // 2. 정렬
    this.filteredItems.sort((a, b) => {
      let valA = a[this.sortKey];
      let valB = b[this.sortKey];

      if (this.sortKey === 'rate') {
        valA = a.isNew ? 999999 : (parseFloat(a.rate) || 0);
        valB = b.isNew ? 999999 : (parseFloat(b.rate) || 0);
      }

      if (this.sortOrder === 'asc') {
        return valA > valB ? 1 : (valA < valB ? -1 : 0);
      } else {
        return valA < valB ? 1 : (valA > valB ? -1 : 0);
      }
    });

    this.renderTable();
  },

  renderTable() {
    const tbody = document.getElementById('tableBody');
    const resultCount = document.getElementById('tableResultCount');
    if (!tbody) return;

    if (resultCount) {
      resultCount.textContent = `검색 결과: 총 ${this.filteredItems.length}건`;
    }

    if (this.filteredItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="empty-table">
            조건에 부합하는 예산 사업이 없습니다. 검색어 또는 필터를 변경해 보세요.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredItems.map(item => {
      const isPositive = item.diff >= 0;
      const sign = isPositive ? '+' : '';
      
      let rateBadgeHtml = '';
      if (item.isNew) {
        rateBadgeHtml = `<span class="table-badge badge-new">신규</span>`;
      } else if (isPositive) {
        rateBadgeHtml = `<span class="table-badge badge-inc">+${item.rate}</span>`;
      } else {
        rateBadgeHtml = `<span class="table-badge badge-dec">${item.rate}</span>`;
      }

      const meta = CATEGORY_META[item.category] || { color: '#3B82F6' };

      return `
        <tr data-id="${item.id}">
          <td class="text-center font-mono">${item.id}</td>
          <td>
            <span class="cat-pill" style="border-left-color: ${meta.color};">
              ${item.category}
            </span>
          </td>
          <td class="font-bold project-name-cell">
            ${item.name}
            ${item.isNew ? '<span class="inline-new-tag">NEW</span>' : ''}
          </td>
          <td class="text-center text-muted">${item.unit}</td>
          <td class="text-right font-mono">${item.prevYear.toLocaleString()}</td>
          <td class="text-right font-mono font-bold text-accent">${item.currYear.toLocaleString()}</td>
          <td class="text-right font-mono ${isPositive ? 'text-blue' : 'text-danger'}">
            ${sign}${item.diff.toLocaleString()}
          </td>
          <td class="text-center">${rateBadgeHtml}</td>
          <td class="text-center">
            <button class="btn-detail" data-id="${item.id}">원문 보기</button>
          </td>
        </tr>
      `;
    }).join('');

    // 행 및 버튼 클릭 시 모달 열기
    tbody.querySelectorAll('tr, .btn-detail').forEach(elem => {
      elem.addEventListener('click', (e) => {
        const id = Number(elem.dataset.id || elem.closest('tr').dataset.id);
        const item = this.items.find(i => i.id === id);
        if (item) this.openDetailModal(item);
      });
    });
  },

  openDetailModal(item) {
    const modal = document.getElementById('detailModal');
    if (!modal) return;

    document.getElementById('modalTitle').textContent = item.name;
    document.getElementById('modalCategory').textContent = item.category;
    document.getElementById('modalPrev').textContent = `${item.prevYear.toLocaleString()} ${item.unit}`;
    document.getElementById('modalCurr').textContent = `${item.currYear.toLocaleString()} ${item.unit}`;
    
    const diffSign = item.diff >= 0 ? '+' : '';
    document.getElementById('modalDiff').textContent = `${diffSign}${item.diff.toLocaleString()} ${item.unit} (${item.isNew ? '신규' : `${diffSign}${item.rate}`})`;
    
    const isNewBadge = document.getElementById('modalNewBadge');
    if (isNewBadge) {
      isNewBadge.style.display = item.isNew ? 'inline-block' : 'none';
    }

    document.getElementById('modalDescription').textContent = item.description;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeDetailModal() {
    const modal = document.getElementById('detailModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  bindModalEvents() {
    const modal = document.getElementById('detailModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const overlay = document.getElementById('modalOverlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDetailModal());
    }
    if (overlay) {
      overlay.addEventListener('click', () => this.closeDetailModal());
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('active')) {
        this.closeDetailModal();
      }
    });
  }
};
