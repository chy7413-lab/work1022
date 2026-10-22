/**
 * 대시보드 인포그래픽 및 KPI 렌더러 모듈
 */
const Dashboard = {
  /**
   * 데이터 배열로부터 거시 지표 및 분야별 통계 계산
   */
  calculateSummary(items) {
    let totalPrev = 0;
    let totalCurr = 0;
    let totalDiff = 0;
    let newProjectsCount = 0;
    let newProjectsTotal = 0;

    const categoryMap = {};

    items.forEach(item => {
      totalPrev += item.prevYear;
      totalCurr += item.currYear;
      totalDiff += item.diff;

      if (item.isNew) {
        newProjectsCount++;
        newProjectsTotal += item.currYear;
      }

      if (!categoryMap[item.category]) {
        const meta = CATEGORY_META[item.category] || {
          shortName: item.category.replace(/^[①-⑧\d\s.-]+/, '').trim(),
          icon: 'folder',
          color: '#3B82F6',
          bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(30,58,138,0.2))',
          borderColor: '#3B82F6'
        };

        categoryMap[item.category] = {
          category: item.category,
          shortName: meta.shortName,
          icon: meta.icon,
          color: meta.color,
          bgGradient: meta.bgGradient,
          borderColor: meta.borderColor,
          prevTotal: 0,
          currTotal: 0,
          diffTotal: 0,
          itemsCount: 0,
          newCount: 0,
          items: []
        };
      }

      const cat = categoryMap[item.category];
      cat.prevTotal += item.prevYear;
      cat.currTotal += item.currYear;
      cat.diffTotal += item.diff;
      cat.itemsCount++;
      if (item.isNew) cat.newCount++;
      cat.items.push(item);
    });

    const overallRate = totalPrev > 0 ? ((totalDiff / totalPrev) * 100).toFixed(1) : '신규';
    const categories = Object.values(categoryMap);

    // 분야별 증가율 계산
    categories.forEach(c => {
      c.rate = c.prevTotal > 0 ? ((c.diffTotal / c.prevTotal) * 100).toFixed(1) + '%' : '신규';
    });

    // 최대 증액 분야 찾기
    const maxDiffCategory = [...categories].sort((a, b) => b.diffTotal - a.diffTotal)[0];

    // 최고 증가율 사업 찾기 (신규 제외 중 최대치)
    const existingItems = items.filter(i => !i.isNew && i.prevYear > 0);
    const topGrowthItem = existingItems.sort((a, b) => {
      const rateA = parseFloat(a.rate) || 0;
      const rateB = parseFloat(b.rate) || 0;
      return rateB - rateA;
    })[0];

    const newProjects = items.filter(i => i.isNew);

    return {
      totalPrev,
      totalCurr,
      totalDiff,
      overallRate,
      newProjectsCount,
      newProjectsTotal,
      maxDiffCategory,
      topGrowthItem,
      categories,
      newProjects,
      totalItemsCount: items.length
    };
  },

  /**
   * 한국어 금액 포맷 (10,000 이상이면 조/억 동시 표기)
   */
  formatKoreanCurrency(num, unit = '억 원') {
    if (num === 0) return '0' + unit;
    if (Math.abs(num) >= 10000) {
      const cho = Math.floor(Math.abs(num) / 10000);
      const eok = Math.round(Math.abs(num) % 10000);
      const sign = num < 0 ? '-' : '';
      if (eok === 0) return `${sign}${cho}조 원`;
      return `${sign}${cho}조 ${eok.toLocaleString()}억 원`;
    }
    return `${num.toLocaleString()}${unit}`;
  },

  /**
   * 1. 종합 KPI 카드 렌더링
   */
  renderKPIs(summary) {
    const kpiGrid = document.getElementById('kpiGrid');
    if (!kpiGrid) return;

    const isDiffPositive = summary.totalDiff >= 0;
    const diffSign = isDiffPositive ? '+' : '';
    const diffBadgeClass = isDiffPositive ? 'badge-success' : 'badge-danger';

    kpiGrid.innerHTML = `
      <!-- 카드 1: 2027 총 예산 규모 -->
      <div class="kpi-card glass-panel highlight-blue">
        <div class="kpi-header">
          <span class="kpi-title">2027년 총 예산 규모</span>
          <div class="kpi-icon-wrap icon-blue">
            ${this.getSvgIcon('pie-chart')}
          </div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-number">${this.formatKoreanCurrency(summary.totalCurr)}</span>
        </div>
        <div class="kpi-subtext">
          <span class="kpi-badge ${diffBadgeClass}">
            ${diffSign}${this.formatKoreanCurrency(summary.totalDiff)} (${diffSign}${summary.overallRate}%)
          </span>
          <span class="kpi-desc">2026년 ${this.formatKoreanCurrency(summary.totalPrev)} 대비</span>
        </div>
      </div>

      <!-- 카드 2: 2027 신규 착수 사업 -->
      <div class="kpi-card glass-panel highlight-purple">
        <div class="kpi-header">
          <span class="kpi-title">2027 신규 착수 사업</span>
          <div class="kpi-icon-wrap icon-purple">
            ${this.getSvgIcon('sparkles')}
          </div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-number">${summary.newProjectsCount}<span class="unit-sm">개 사업</span></span>
        </div>
        <div class="kpi-subtext">
          <span class="kpi-badge badge-new">신규 순증 ${this.formatKoreanCurrency(summary.newProjectsTotal)}</span>
          <span class="kpi-desc">총 ${summary.totalItemsCount}개 사업 중 신규</span>
        </div>
      </div>

      <!-- 카드 3: 최대 증액 중점 분야 -->
      <div class="kpi-card glass-panel highlight-emerald">
        <div class="kpi-header">
          <span class="kpi-title">최대 증액 중점 분야</span>
          <div class="kpi-icon-wrap icon-emerald">
            ${this.getSvgIcon('trending-up')}
          </div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-number truncate" title="${summary.maxDiffCategory?.category || '-'}">
            ${summary.maxDiffCategory?.shortName || summary.maxDiffCategory?.category || '-'}
          </span>
        </div>
        <div class="kpi-subtext">
          <span class="kpi-badge badge-success">+${this.formatKoreanCurrency(summary.maxDiffCategory?.diffTotal || 0)}</span>
          <span class="kpi-desc">전년비 +${summary.maxDiffCategory?.rate || '0%'} 증액</span>
        </div>
      </div>

      <!-- 카드 4: 최고 증가율 세부 사업 -->
      <div class="kpi-card glass-panel highlight-amber">
        <div class="kpi-header">
          <span class="kpi-title">최고 성장률 계속사업</span>
          <div class="kpi-icon-wrap icon-amber">
            ${this.getSvgIcon('zap')}
          </div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-number truncate" title="${summary.topGrowthItem?.name || '-'}">
            ${summary.topGrowthItem?.name || '-'}
          </span>
        </div>
        <div class="kpi-subtext">
          <span class="kpi-badge badge-amber">+${summary.topGrowthItem?.rate || '0%'}</span>
          <span class="kpi-desc">+${(summary.topGrowthItem?.diff || 0).toLocaleString()}억 원 급증</span>
        </div>
      </div>
    `;
  },

  /**
   * 2. 분야별 인터랙티브 카드 그리드 렌더링
   */
  renderCategoryCards(categories, activeCategory, onSelectCategory) {
    const container = document.getElementById('categoryCardsGrid');
    if (!container) return;

    container.innerHTML = categories.map(cat => {
      const isSelected = activeCategory === cat.category;
      const isPositive = cat.diffTotal >= 0;
      const sign = isPositive ? '+' : '';

      return `
        <div class="category-card glass-panel ${isSelected ? 'selected' : ''}" data-category="${cat.category}" style="border-top-color: ${cat.color};">
          <div class="cat-header">
            <div class="cat-icon-box" style="background: ${cat.color}22; color: ${cat.color};">
              ${this.getSvgIcon(cat.icon)}
            </div>
            <div class="cat-title-wrap">
              <h4 class="cat-title" title="${cat.category}">${cat.shortName}</h4>
              <span class="cat-meta">${cat.itemsCount}개 사업 ${cat.newCount > 0 ? `· <b class="new-dot">신규 ${cat.newCount}건</b>` : ''}</span>
            </div>
          </div>
          <div class="cat-body">
            <div class="cat-budget-row">
              <span class="cat-budget-val">${this.formatKoreanCurrency(cat.currTotal)}</span>
              <span class="cat-diff-badge ${isPositive ? 'positive' : 'negative'}">
                ${sign}${cat.rate}
              </span>
            </div>
            <div class="cat-prev-info">
              전년 ${this.formatKoreanCurrency(cat.prevTotal)} (${sign}${this.formatKoreanCurrency(cat.diffTotal)})
            </div>
          </div>
          <div class="cat-footer">
            <span class="filter-hint">${isSelected ? '✓ 선택됨 (전체보기 클릭)' : '세부 사업 필터링 →'}</span>
          </div>
        </div>
      `;
    }).join('');

    // 카드 클릭 이벤트 리스너 바인딩
    container.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catName = card.dataset.category;
        onSelectCategory(catName);
      });
    });
  },

  /**
   * 3. 2027 신규 사업 하이라이트 쇼케이스 렌더링
   */
  renderNewProjectsShowcase(newProjects, onOpenDetail) {
    const container = document.getElementById('newProjectsGrid');
    const countBadge = document.getElementById('newProjectsCountBadge');
    if (!container) return;

    if (countBadge) {
      countBadge.textContent = `${newProjects.length}개 사업`;
    }

    if (newProjects.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>현재 업로드된 데이터에 신규 편성 사업이 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = newProjects.map(item => {
      const meta = CATEGORY_META[item.category] || { color: '#8B5CF6' };
      return `
        <div class="new-project-card glass-panel" data-id="${item.id}">
          <div class="new-card-top">
            <span class="new-pill">NEW 2027</span>
            <span class="new-category-tag" style="color: ${meta.color}; border-color: ${meta.color}44;">
              ${item.category.replace(/^[①-⑧\d\s.-]+/, '').trim()}
            </span>
          </div>
          <h4 class="new-card-title">${item.name}</h4>
          <div class="new-card-budget">
            <span class="budget-label">신규 편성액</span>
            <span class="budget-amt">${item.currYear.toLocaleString()} <small>억 원</small></span>
          </div>
          <p class="new-card-desc truncate-2">${item.description}</p>
          <button class="new-card-btn" data-id="${item.id}">
            원문 근거 및 상세 보기
            <span class="arrow">→</span>
          </button>
        </div>
      `;
    }).join('');

    // 카드 상세 보기 클릭 이벤트
    container.querySelectorAll('.new-project-card, .new-card-btn').forEach(elem => {
      elem.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(elem.dataset.id || elem.closest('.new-project-card').dataset.id);
        const item = newProjects.find(p => p.id === id);
        if (item) onOpenDetail(item);
      });
    });
  },

  /**
   * 세련된 SVG 인라인 아이콘 헬퍼 (의존성 없는 고품질 아이콘)
   */
  getSvgIcon(name) {
    const icons = {
      'pie-chart': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`,
      'sparkles': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`,
      'trending-up': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>`,
      'zap': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
      'shield': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
      'users': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      'cpu': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M9 1v3"></path><path d="M15 1v3"></path><path d="M9 20v3"></path><path d="M15 20v3"></path><path d="M20 9h3"></path><path d="M20 14h3"></path><path d="M1 9h3"></path><path d="M1 14h3"></path></svg>`,
      'crosshair': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>`,
      'heart': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,
      'briefcase': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
      'message-square': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
      'folder': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>`
    };
    return icons[name] || icons['folder'];
  }
};
