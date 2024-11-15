// utils/config.ts
// Se utiliza para hacer referencia a la URL de la API en el frontend, y poder trabajar mas comodo entre ramas
const config = {
    development: {
      API_URL: 'http://127.0.0.1:8000',
    },
    production: {
      API_URL: 'https://backend-pruebatecnica.onrender.com',
    },
    test: {
      API_URL: 'http://127.0.0.1:8001',
    },
  };
  
  // Determinar el entorno actual
  const ENV = process.env.NODE_ENV || 'development';
  
  // Cargar la configuración según el entorno
  const currentConfig = config[ENV as keyof typeof config];
  
  // Imprimir la configuración para verificar
  console.log(`Cargando configuración para el entorno: ${ENV}`);
  console.log(`API_URL: ${currentConfig.API_URL}`);
  
  export default currentConfig;
  