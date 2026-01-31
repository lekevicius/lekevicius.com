export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'lekevicius.nbg1.your-objectstorage.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'lekevicius.nbg1.your-objectstorage.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  // 'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
]
