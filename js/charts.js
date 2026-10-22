/**
 * 대시보드 인터랙티브 차트 모듈 (Chart.js 기반)
 * 분야별 예산 점유율(도넛 차트) 및 전년 대비 비교(그룹 바 차트)
 */
const DashboardCharts = {
  donutChart: null,
  barChart: null,

  /**
   * 테마에 따른 차트 공통 옵션 스타일 계산
   */
  getThemeColors(isDark) {
    return {
      textColor: isDark ? '#94A3B8' : '#475569',
      headingColor: isDark ? '#F8FAFC' : '#0F172A',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      tooltipBg: isDark ? '#1E293B' : '#FFFFFF',
      tooltipText: isDark ? '#F8FAFC' : '#0F172A',
      tooltipBorder: isDark ? '#334155' : '#E2E8F0',
      barPrevColor: isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.6)',
      barCurrColor: '#3B82F6'
    };
  },

  /**
   * 차트 전체 렌더링 또는 업데이트
   */
  renderCharts(categoriesData, isDark = true) {
    this.renderDonutChart(categoriesData, isDark);
    this.renderBarChart(categoriesData, isDark);
  },

  /**
   * 1. 분야별 2027 예산 비중 도넛 차트
   */
  renderDonutChart(categories, isDark) {
    const ctx = document.getElementById('donutChart');
    if (!ctx) return;

    const theme = this.getThemeColors(isDark);
    const labels = categories.map(c => c.shortName || c.category);
    const data = categories.map(c => Math.round(c.currTotal));
    const colors = categories.map(c => c.color || '#3B82F6');

    if (this.donutChart) {
      this.donutChart.destroy();
    }

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: isDark ? '#0F172A' : '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: theme.textColor,
              font: {
                family: 'Pretendard, -apple-system, sans-serif',
                size: 11
              },
              boxWidth: 12,
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.headingColor,
            bodyColor: theme.tooltipText,
            borderColor: theme.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percent = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${val.toLocaleString()}억 원 (${percent}%)`;
              }
            }
          }
        }
      }
    });
  },

  /**
   * 2. 분야별 2026 vs 2027 예산 증감 비교 막대 차트
   */
  renderBarChart(categories, isDark) {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;

    const theme = this.getThemeColors(isDark);
    const labels = categories.map(c => c.shortName || c.category);
    const prevData = categories.map(c => Math.round(c.prevTotal));
    const currData = categories.map(c => Math.round(c.currTotal));

    if (this.barChart) {
      this.barChart.destroy();
    }

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '2026년',
            data: prevData,
            backgroundColor: theme.barPrevColor,
            borderRadius: 6,
            barPercentage: 0.7,
            categoryPercentage: 0.7
          },
          {
            label: '2027년 정부안',
            data: currData,
            backgroundColor: theme.barCurrColor,
            borderRadius: 6,
            barPercentage: 0.7,
            categoryPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: theme.textColor,
              font: {
                family: 'Pretendard, -apple-system, sans-serif',
                size: 12
              },
              boxWidth: 14
            }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleColor: theme.headingColor,
            bodyColor: theme.tooltipText,
            borderColor: theme.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                return ` ${context.dataset.label}: ${val.toLocaleString()}억 원`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: theme.textColor,
              font: {
                family: 'Pretendard, -apple-system, sans-serif',
                size: 11
              },
              maxRotation: 25,
              minRotation: 0
            }
          },
          y: {
            grid: {
              color: theme.gridColor
            },
            ticks: {
              color: theme.textColor,
              font: {
                size: 11
              },
              callback: function(val) {
                if (val >= 10000) {
                  return (val / 10000).toFixed(1) + '조';
                }
                return val.toLocaleString() + '억';
              }
            }
          }
        }
      }
    });
  }
};
