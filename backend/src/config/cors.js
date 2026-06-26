const LOCAL_DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

function getAllowedOrigins() {
  const configuredOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origins = configuredOrigins.length > 0 ? configuredOrigins : ['http://localhost:5173'];

  if (process.env.NODE_ENV !== 'production') {
    LOCAL_DEV_ORIGINS.forEach((origin) => origins.push(origin));
  }

  return [...new Set(origins)];
}

function getCorsOptions() {
  const allowedOrigins = new Set(getAllowedOrigins());

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  };
}

module.exports = {
  getAllowedOrigins,
  getCorsOptions
};
