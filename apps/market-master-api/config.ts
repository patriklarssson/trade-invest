const config = {
  development: {
    ssl: {
      key: "C:/certs/key.pem",
      cert: "C:/certs/cert.pem"
    }
  },
  production: {
    ssl: {
      key: "/var/www/html/trade-invest/key.pem",
      cert: "/var/www/html/trade-invest/cert.pem"
    }
  }
};

export default process.env.NODE_ENV === 'production' ? config.production : config.development;
