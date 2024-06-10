import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import { DateTime } from 'luxon';

function NetworkGraph() {
  const chartRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const chartInstance = useRef(null);

  const [protocol, setProtocol] = useState('TCP');
  const [duration, setDuration] = useState(10);
  const [windowSize, setWindowSize] = useState(1);
  const [port, setPort] = useState(5201);
  const [numStreams, setNumStreams] = useState(1);
  const [connectionType, setConnectionType] = useState('client');
  const [direction, setDirection] = useState('send');
  const [chartType, setChartType] = useState('line');

  const neonColors = {
    bandwidth: 'rgba(0, 255, 255, 1)',
    latency: 'rgba(255, 0, 255, 1)',
    jitter: 'rgba(0, 255, 0, 1)',
    loss: 'rgba(255, 255, 0, 1)'
  };

  const fetchData = () => {
    if (loading) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/data?protocol=${protocol}&duration=${duration}&windowSize=${windowSize}&port=${port}&numStreams=${numStreams}&connectionType=${connectionType}&direction=${direction}`)
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка при получении данных:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (data.length > 0) {
      const ctx = chartRef.current.getContext('2d');

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const commonOptions = {
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'second',
              displayFormats: {
                second: 'HH:mm:ss'
              }
            },
            title: {
              display: true,
              text: 'Время теста',
              font: {
                size: 18,
                weight: 'bold'
              },
              color: '#ffffff',
              padding: { top: 20, left: 0, right: 0, bottom: 0 }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              drawTicks: true,
              tickColor: 'rgba(255, 255, 255, 0.8)',
              lineWidth: 1
            },
            ticks: {
              color: '#ffffff',
              callback: function(value) {
                return DateTime.fromMillis(value).toFormat('HH:mm:ss');
              }
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Значение параметра',
              font: {
                size: 18,
                weight: 'bold'
              },
              color: '#ffffff',
              padding: { top: 0, left: 0, right: 0, bottom: 20 }
            },
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              drawTicks: true,
              tickColor: 'rgba(255, 255, 255, 0.8)',
              lineWidth: 1
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#ffffff',
              font: {
                size: 16,
                weight: 'bold'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed.y;
                if (context.dataset.label === 'Пропускная способность (Mbps)') {
                  label += ' Mbps';
                } else if (context.dataset.label === 'Задержка (ms)') {
                  label += ' ms';
                } else if (context.dataset.label === 'Джиттер (ms)') {
                  label += ' ms';
                } else if (context.dataset.label === 'Потери (%)') {
                  label += ' %';
                }
                return label;
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0.1
          }
        }
      };

      const barOptions = {
        ...commonOptions,
        scales: {
          x: {
            ...commonOptions.scales.x,
            type: 'time',
            time: {
              unit: 'second',
              displayFormats: {
                second: 'HH:mm:ss'
              }
            },
            title: {
              display: true,
              text: 'Время теста',
              font: {
                size: 18,
                weight: 'bold'
              },
              color: '#ffffff',
              padding: { top: 20, left: 0, right: 0, bottom: 0 }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              drawTicks: true,
              tickColor: 'rgba(255, 255, 255, 0.8)',
              lineWidth: 1
            },
            ticks: {
              color: '#ffffff',
              callback: function(value) {
                return DateTime.fromMillis(value).toFormat('HH:mm:ss');
              }
            }
          },
          y: commonOptions.scales.y
        }
      };

      const radarOptions = {
        ...commonOptions,
        scales: {
          r: {
            angleLines: {
              color: 'rgba(255, 255, 255, 0.5)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.5)'
            },
            ticks: {
              color: '#ffffff',
              backdropColor: 'rgba(0, 0, 0, 0)',
              callback: function(value) {
                return value.toFixed(2); // Преобразование значений в текст
              }
            },
            pointLabels: {
              color: '#ffffff'
            }
          }
        },
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.raw;
                return label;
              }
            }
          }
        }
      };
      
      const pieAndDoughnutOptions = {
        ...commonOptions,
        scales: {},
        plugins: {
          legend: {
            labels: {
              color: '#ffffff',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += context.raw;
                  return label;
                }
              }
            }
          }
        }
      };

      const optionsMap = {
        line: commonOptions,
        bar: barOptions,
        radar: radarOptions,
        pie: pieAndDoughnutOptions,
        doughnut: pieAndDoughnutOptions
      };

      const datasetsMap = {
        line: [
          {
            label: 'Пропускная способность (Mbps)',
            data: data.map(d => d.bandwidth),
            borderColor: neonColors.bandwidth,
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            borderWidth: 2,
            fill: false,
            pointBackgroundColor: neonColors.bandwidth,
            pointBorderColor: neonColors.bandwidth,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHitRadius: 10,
            pointHoverBackgroundColor: neonColors.bandwidth,
            pointHoverBorderColor: neonColors.bandwidth
          },
          {
            label: 'Задержка (ms)',
            data: data.map(d => d.latency),
            borderColor: neonColors.latency,
            backgroundColor: 'rgba(255, 0, 255, 0.1)',
            borderWidth: 2,
            fill: false,
            pointBackgroundColor: neonColors.latency,
            pointBorderColor: neonColors.latency,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHitRadius: 10,
            pointHoverBackgroundColor: neonColors.latency,
            pointHoverBorderColor: neonColors.latency
          },
          {
            label: 'Джиттер (ms)',
            data: data.map(d => d.jitter),
            borderColor: neonColors.jitter,
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            borderWidth: 2,
            fill: false,
            pointBackgroundColor: neonColors.jitter,
            pointBorderColor: neonColors.jitter,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHitRadius: 10,
            pointHoverBackgroundColor: neonColors.jitter,
            pointHoverBorderColor: neonColors.jitter
          },
          {
            label: 'Потери (%)',
            data: data.map(d => d.loss),
            borderColor: neonColors.loss,
            backgroundColor: 'rgba(255, 255, 0, 0.1)',
            borderWidth: 2,
            fill: false,
            pointBackgroundColor: neonColors.loss,
            pointBorderColor: neonColors.loss,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHitRadius: 10,
            pointHoverBackgroundColor: neonColors.loss,
            pointHoverBorderColor: neonColors.loss
          }
        ],
        bar: [
          {
            label: 'Пропускная способность (Mbps)',
            data: data.map(d => d.bandwidth),
            backgroundColor: neonColors.bandwidth,
            borderColor: neonColors.bandwidth,
            borderWidth: 2,
            fill: false
          },
          {
            label: 'Задержка (ms)',
            data: data.map(d => d.latency),
            backgroundColor: neonColors.latency,
            borderColor: neonColors.latency,
            borderWidth: 2,
            fill: false
          },
          {
            label: 'Джиттер (ms)',
            data: data.map(d => d.jitter),
            backgroundColor: neonColors.jitter,
            borderColor: neonColors.jitter,
            borderWidth: 2,
            fill: false
          },
          {
            label: 'Потери (%)',
            data: data.map(d => d.loss),
            backgroundColor: neonColors.loss,
            borderColor: neonColors.loss,
            borderWidth: 2,
            fill: false
          }
        ],
        radar: [
          {
            label: 'Пропускная способность (Mbps)',
            data: data.map(d => d.bandwidth),
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            borderColor: neonColors.bandwidth,
            pointBackgroundColor: neonColors.bandwidth,
            pointBorderColor: neonColors.bandwidth,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHitRadius: 10
          },
          {
            label: 'Задержка (ms)',
            data: data.map(d => d.latency),
            backgroundColor: 'rgba(255, 0, 255, 0.1)',
            borderColor: neonColors.latency,
            pointBackgroundColor: neonColors.latency,
            pointBorderColor: neonColors.latency,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHitRadius: 10
          },
          {
            label: 'Джиттер (ms)',
            data: data.map(d => d.jitter),
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            borderColor: neonColors.jitter,
            pointBackgroundColor: neonColors.jitter,
            pointBorderColor: neonColors.jitter,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHitRadius: 10
          },
          {
            label: 'Потери (%)',
            data: data.map(d => d.loss),
            backgroundColor: 'rgba(255, 255, 0, 0.1)',
            borderColor: neonColors.loss,
            pointBackgroundColor: neonColors.loss,
            pointBorderColor: neonColors.loss,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHitRadius: 10
          }
        ],
        pie: [
          {
            data: [
              data.map(d => d.bandwidth).reduce((a, b) => a + b, 0),
              data.map(d => d.latency).reduce((a, b) => a + b, 0),
              data.map(d => d.jitter).reduce((a, b) => a + b, 0),
              data.map(d => d.loss).reduce((a, b) => a + b, 0)
            ],
            backgroundColor: [neonColors.bandwidth, neonColors.latency, neonColors.jitter, neonColors.loss],
            borderColor: [neonColors.bandwidth, neonColors.latency, neonColors.jitter, neonColors.loss],
            borderWidth: 2
          }
        ],
        doughnut: [
          {
            data: [
              data.map(d => d.bandwidth).reduce((a, b) => a + b, 0),
              data.map(d => d.latency).reduce((a, b) => a + b, 0),
              data.map(d => d.jitter).reduce((a, b) => a + b, 0),
              data.map(d => d.loss).reduce((a, b) => a + b, 0)
            ],
            backgroundColor: [neonColors.bandwidth, neonColors.latency, neonColors.jitter, neonColors.loss],
            borderColor: [neonColors.bandwidth, neonColors.latency, neonColors.jitter, neonColors.loss],
            borderWidth: 2
          }
        ]
      };

      chartInstance.current = new Chart(ctx, {
        type: chartType,
        data: {
          labels: chartType === 'pie' || chartType === 'doughnut' ? ['Пропускная способность', 'Задержка', 'Джиттер', 'Потери'] : data.map(d => DateTime.fromISO(d.time).toFormat('HH:mm:ss')),
          datasets: datasetsMap[chartType]
        },
        options: optionsMap[chartType]
      });
    }
  }, [data, chartType]);

  const calculateStats = (data, key) => {
    const values = data.map(d => d[key]);
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    return { avg, max, min };
  };

  const stats = data.length > 0 && {
    bandwidth: calculateStats(data, 'bandwidth'),
    latency: calculateStats(data, 'latency'),
    jitter: calculateStats(data, 'jitter'),
    loss: calculateStats(data, 'loss')
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', margin: '20px', width: '100%', maxWidth: '1400px' }}>
      <div style={{ width: '30%', minWidth: '400px' }}>
        <h2>График производительности сети</h2>
        <form style={{ marginBottom: '20px', textAlign: 'left', padding: '20px', backgroundColor: '#282c34', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
          <label>
            Протокол:
            <select value={protocol} onChange={e => setProtocol(e.target.value)} style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px' }}>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
            </select>
            <small>Выберите протокол для теста (TCP или UDP)</small>
          </label>
          <br />
          <label>
            Длительность (секунды):
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              min="1"
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px' }}
            />
            <small>Укажите длительность теста в секундах</small>
          </label>
          <br />
          <label>
            Размер окна (KB):
            <input
              type="number"
              value={windowSize}
              onChange={e => setWindowSize(e.target.value)}
              min="1"
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px' }}
            />
            <small>Укажите размер окна в килобайтах</small>
          </label>
          <br />
          <label>
            Порт:
            <input
              type="number"
              value={port}
              onChange={e => setPort(e.target.value)}
              min="1"
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px' }}
            />
            <small>Укажите порт для тестирования (по умолчанию 5201)</small>
          </label>
          <br />
          <label>
            Количество потоков:
            <input
              type="number"
              value={numStreams}
              onChange={e => setNumStreams(e.target.value)}
              min="1"
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px' }}
            />
            <small>Укажите количество потоков для тестирования</small>
          </label>
          <br />
          <label>
            Тип соединения:
            <select value={connectionType} onChange={e => setConnectionType(e.target.value)} style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px' }}>
              <option value="client">Клиент</option>
              <option value="server">Сервер</option>
            </select>
            <small>Выберите тип соединения (клиент или сервер)</small>
          </label>
          <br />
          <label>
            Направление:
            <select value={direction} onChange={e => setDirection(e.target.value)} style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px' }}>
              <option value="send">Отправка</option>
              <option value="receive">Прием</option>
            </select>
            <small>Выберите направление теста (отправка или прием)</small>
          </label>
          <br />
          <label>
            Тип графика:
            <select value={chartType} onChange={e => setChartType(e.target.value)} style={{ marginLeft: '10px', padding: '5px', borderRadius: '3px' }}>
              <option value="line">Линейный график</option>
              <option value="bar">Столбчатый график</option>
              <option value="radar">Радарный график</option>
              <option value="pie">Круговая диаграмма</option>
              <option value="doughnut">Кольцевая диаграмма</option>
            </select>
            <small>Выберите тип графика</small>
          </label>
          <br />
          <button type="button" onClick={fetchData} disabled={loading} style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: '#61dafb', color: '#282c34', boxShadow: '0 0 5px #61dafb', transition: 'all 0.3s ease' }}>
            {loading ? 'Запуск теста...' : 'Запустить тест'}
          </button>
        </form>
      </div>
      <div style={{ width: '70%', minWidth: '800px' }}>
        <div style={{ position: 'relative', width: '100%', height: '600px' }}>
          <canvas ref={chartRef} style={{ filter: 'blur(0px) brightness(100%)' }}></canvas>
        </div>
        {stats && (
          <div style={{ 
            marginTop: '20px', 
            padding: '20px', 
            backgroundColor: '#282c34', 
            borderRadius: '5px', 
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)', 
            width: '100%', 
            maxWidth: '800px', 
            marginLeft: '90px' 
          }}>
            <h3 style={{ color: '#ffffff', margin: '0 0 10px 0', textAlign: 'center' }}>Средние, максимальные и минимальные значения</h3>
            <table style={{ width: '100%', color: '#ffffff', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px', borderBottom: '1px solid #ffffff', textAlign: 'left', paddingLeft: '5px' }}>Параметр</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #ffffff', textAlign: 'left', paddingLeft: '5px' }}>Среднее</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #ffffff', textAlign: 'left', paddingLeft: '5px' }}>Максимальное</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #ffffff', textAlign: 'left', paddingLeft: '5px' }}>Минимальное</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>Пропускная способность (Mbps)</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.bandwidth.avg.toFixed(2)}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.bandwidth.max.toFixed(2)}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.bandwidth.min.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>Задержка (ms)</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.latency.avg.toFixed(2)}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.latency.max.toFixed(2)}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.latency.min.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>Джиттер (ms)</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.jitter.avg.toFixed(2)}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.jitter.max.toFixed(2)}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.jitter.min.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>Потери (%)</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.loss.avg.toFixed(2)}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.loss.max.toFixed(2)}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ffffff' }}>{stats.loss.min.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default NetworkGraph;
