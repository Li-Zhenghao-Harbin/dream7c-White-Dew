<template>
  <div class="statistic-form">
    <div ref="chartRef" class="chart-container"></div>
    <div class="form-actions">
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts';

const emit = defineEmits(['submit'])

const props = defineProps({
  chartData: {
    type: Array,
    required: true,
    default: () => []
  },
  title: {
    type: String,
    default: '状态分布'
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '400px'
  }
});

// 响应式变量
const chartRef = ref(null);
let chartInstance = null;
const containerReady = ref(false);

// 等待容器准备就绪的辅助函数
const waitForContainerReady = () => {
  return new Promise((resolve) => {
    if (chartRef.value && chartRef.value.offsetWidth > 0 && chartRef.value.offsetHeight > 0) {
      resolve(true);
      return;
    }

    // 使用 requestAnimationFrame 循环检查
    const checkContainer = () => {
      if (chartRef.value && chartRef.value.offsetWidth > 0 && chartRef.value.offsetHeight > 0) {
        containerReady.value = true;
        resolve(true);
      } else {
        requestAnimationFrame(checkContainer);
      }
    };

    checkContainer();

    // 设置超时，防止无限等待
    setTimeout(() => {
      console.warn('等待容器就绪超时');
      resolve(false);
    }, 1000);
  });
};

// 初始化或更新图表的函数
const initOrUpdateChart = async () => {
  if (!chartRef.value) {
    console.warn('图表容器未找到');
    return;
  }

  // 如果没有数据，显示空状态
  if (!props.chartData || props.chartData.length === 0) {
    console.warn('没有图表数据');
    if (chartInstance) {
      chartInstance.clear();
    }
    return;
  }

  // 确保容器已就绪
  const isReady = await waitForContainerReady();
  if (!isReady) {
    return;
  }

  try {
    // 如果实例不存在，则进行初始化
    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.value);
    }

    // 准备图表的配置项
    const option = {
      title: {
        text: props.title,
        left: 'center',
        textStyle: {
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: 12
        }
      },
      series: [
        {
          name: '数据',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
            fontSize: 12
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: true
          },
          data: props.chartData
        }
      ]
    };

    // 使用配置项绘制图表
    chartInstance.setOption(option);

    // 立即调整大小，确保显示
    setTimeout(() => {
      if (chartInstance) {
        chartInstance.resize();
      }
    }, 10);
  } catch (error) {
    console.error('图表初始化失败:', error);
  }
};

// 监听窗口大小变化，实现图表自适应
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 强制重绘图表
const forceChartRender = () => {
  if (chartInstance) {
    // 先清除，再重新设置
    chartInstance.clear();
    initOrUpdateChart();
  } else {
    initOrUpdateChart();
  }
};

// 生命周期钩子
onMounted(() => {
  // 延迟初始化，确保DOM已完全渲染
  setTimeout(() => {
    initOrUpdateChart();
  }, 100);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});

// 监听 props 数据变化，自动更新图表
watch(
    () => props.chartData,
    () => {
      // 使用 nextTick 确保DOM更新完成
      nextTick(() => {
        setTimeout(() => {
          forceChartRender();
        }, 50);
      });
    },
    { deep: true, immediate: true }
);

const handleSubmit = async () => {
  emit('submit')
}
</script>

<style scoped>
.statistic-form {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 450px;
}

/* 图表容器 - 固定高度，占据主要空间 */
.chart-container {
  flex: 1;
  width: 100%;
  min-height: 400px; /* 确保图表有足够空间显示 */
  margin: 0;
  padding: 0;
  position: relative;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0; /* 防止按钮区域被压缩 */
}

/* 确保el-dialog内容区域有足够高度 */
:deep(.el-dialog__body) {
  min-height: 300px;
}
</style>