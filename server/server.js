const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get('/api/data', (req, res) => {
  const protocol = req.query.protocol || 'tcp';
  const duration = req.query.duration || 10;
  const port = req.query.port || 5201;
  const direction = req.query.direction === 'receive' ? '-R' : '';

  const command = `iperf3 -c localhost -p ${port} -t ${duration} ${protocol === 'udp' ? '-u' : ''} ${direction}`;

  console.log('Executing command:', command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: error.message });
      return;
    }
    if (stderr) {
      console.error('Stderr:', stderr);
      res.status(500).json({ error: stderr });
      return;
    }

    console.log('Raw output:', stdout);

    // Парсинг данных из stdout
    const result = parseIperf3Output(stdout);
    console.log('Parsed Data:', result);
    res.status(200).json(result);
  });
});

function parseIperf3Output(output) {
  const lines = output.split('\n');
  const data = [];

  lines.forEach((line, index) => {
    const match = line.match(/\[\s*\d+\]\s+(\d+\.\d+)-(\d+\.\d+)\s+sec\s+(\d+\s+MBytes)\s+(\d+\.\d+)\s+Gbits\/sec/);
    if (match) {
      console.log('Matched line:', line); // Добавлен консольный вывод для диагностики
      data.push({
        time: new Date(Date.now() + index * 1000).toISOString(),
        bandwidth: parseFloat(match[4]),
        latency: Math.random() * 10, // Замените на реальное значение задержки, если доступно
        jitter: Math.random() * 5, // Замените на реальное значение джиттера, если доступно
        loss: Math.random() * 2 // Замените на реальное значение потерь, если доступно
      });
    } else {
      console.log('No match for line:', line); // Добавлен консольный вывод для диагностики
    }
  });

  return data;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
