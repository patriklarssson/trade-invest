const config = {
  development: {
    marketMasterApiBaseUrl: 'https://localhost:3333',
    // marketMasterApiBaseUrl: 'https://84.217.73.211:4545',
  },
  production: {
    marketMasterApiBaseUrl: 'https://84.217.73.211:4545',
  },
};

export default process.env.NODE_ENV === 'production'
  ? config.production
  : config.development;
