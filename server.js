import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 School Information System Running`);
  console.log(`🌐 Public Website : http://localhost:${PORT}`);
  console.log(`📊 Admin Panel    : http://localhost:${PORT}/admin`);
  console.log(`⚙️  Environment   : ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
