/**
 * 애플리케이션 메인 오케스트레이터
 * 파일 업로드, 테마 관리, 이벤트 바인딩 및 전역 상태 갱신
 */
const App = {
  currentData: [],
  isDarkMode: true,

  init() {
    this.currentData = [...DEFAULT_BUDGET_DATA];
    this.initTheme();
    this.bindGlobalEvents();
    this.bindUploadEvents();
    this.renderAll();
  },

  /**
   * 다크/라이트 테마 초기화
   */
  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  },

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
    
    // 차트 테마 업데이트
    const summary = Dashboard.calculateSummary(this.currentData);
    DashboardCharts.renderCharts(summary.categories, this.isDarkMode);
  },

  applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      const themeBtn = document.getElementById('themeToggleBtn');
      if (themeBtn) themeBtn.innerHTML = `☀️ <span class="btn-text">라이트 모드</span>`;
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      const themeBtn = document.getElementById('themeToggleBtn');
      if (themeBtn) themeBtn.innerHTML = `🌙 <span class="btn-text">다크 모드</span>`;
    }
  },

  /**
   * 전체 대시보드 렌더링 갱신
   */
  renderAll() {
    const summary = Dashboard.calculateSummary(this.currentData);

    // 1. 거시 KPI 카드 렌더링
    Dashboard.renderKPIs(summary);

    // 2. 분야별 인포그래픽 카드 렌더링
    Dashboard.renderCategoryCards(summary.categories, DataTableManager.activeCategory, (selectedCat) => {
      DataTableManager.setCategoryFilter(selectedCat);
      // 활성 상태 UI 동기화
      Dashboard.renderCategoryCards(summary.categories, DataTableManager.activeCategory, () => {});
    });

    // 3. 차트 렌더링 (도넛 & 바)
    DashboardCharts.renderCharts(summary.categories, this.isDarkMode);

    // 4. 신규 사업 쇼케이스 렌더링
    Dashboard.renderNewProjectsShowcase(summary.newProjects, (item) => {
      DataTableManager.openDetailModal(item);
    });

    // 5. 세부 사업 테이블 초기화
    DataTableManager.init(this.currentData);
  },

  /**
   * 파일 업로드 이벤트 (Drag & Drop 및 파일 선택)
   */
  bindUploadEvents() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');

    if (!dropZone || !fileInput) return;

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => fileInput.click());
    }

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this.handleFile(file);
        fileInput.value = ''; // 재업로드 가능하도록 초기화
      }
    });

    // 드래그 앤 드롭 시각 피드백
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
      });
    });

    dropZone.addEventListener('drop', async (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        await this.handleFile(files[0]);
      }
    });
  },

  /**
   * 파일 파싱 및 대시보드 데이터 주입
   */
  async handleFile(file) {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      this.showToast('지원되지 않는 파일 형식입니다. .xlsx, .xls, .csv 파일을 업로드해 주세요.', 'error');
      return;
    }

    this.showLoading(true);

    try {
      const parsedItems = await BudgetParser.parseFile(file);
      this.currentData = parsedItems;
      this.renderAll();

      const fileNameElem = document.getElementById('currentFileName');
      if (fileNameElem) {
        fileNameElem.textContent = `현재 파일: ${file.name} (${parsedItems.length}개 사업)`;
      }

      this.showToast(`🎉 "${file.name}" 데이터를 성공적으로 불러왔습니다!`, 'success');
    } catch (err) {
      console.error(err);
      this.showToast(`파일 처리 실패: ${err.message}`, 'error');
    } finally {
      this.showLoading(false);
    }
  },

  /**
   * 글로벌 버튼 이벤트 바인딩
   */
  bindGlobalEvents() {
    // 테마 토글 버튼
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // 기본 샘플 데이터 리셋 버튼
    const resetBtn = document.getElementById('resetDataBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.currentData = [...DEFAULT_BUDGET_DATA];
        const fileNameElem = document.getElementById('currentFileName');
        if (fileNameElem) {
          fileNameElem.textContent = '현재 파일: 2027년_국방예산 (기본 샘플)';
        }
        this.renderAll();
        this.showToast('기본 2027년 국방예산 샘플 데이터로 복원되었습니다.', 'info');
      });
    }

    // 인쇄/PDF 저장
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  },

  showLoading(isLoading) {
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
      loader.style.display = isLoading ? 'flex' : 'none';
    }
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// DOM 로드 완료 시 애플리케이션 기동
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
