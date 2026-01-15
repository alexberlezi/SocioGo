const mysql = require('mysql2/promise');

async function test() {
  console.log('Tentando conectar...');
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      port: 3306
    });
    console.log('✅ Conectado com sucesso ao MySQL!');
    
    // Check if database exists
    const [rows] = await connection.query("SHOW DATABASES LIKE 'sociogo'");
    if (rows.length > 0) {
      console.log('✅ Banco sociogo existe.');
    } else {
      console.log('❌ Banco sociogo NÃO existe.');
      // Try to create
      try {
          await connection.query("CREATE DATABASE sociogo");
          console.log('✅ Banco sociogo criado com sucesso!');
      } catch (e) {
          console.log('❌ Erro ao criar banco:', e.message);
      }
    }
    
    await connection.end();
  } catch (err) {
    console.error('❌ Falha na conexão:', err.message);
  }
}

test();
