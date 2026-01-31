export default ({ env }) => ({
  upload: {
    enabled: true,
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('CDN_URL'),
        rootPath: env('CDN_ROOT_PATH', ''),
        s3Options: {
          credentials: {
            accessKeyId: env('S3_ACCESS_KEY_ID'),
            secretAccessKey: env('S3_ACCESS_SECRET'),
          },
          region: env('S3_REGION'),
          endpoint: env('S3_ENDPOINT'),
          params: {
            // ACL: env('S3_ACL', 'public-read'),
            // signedUrlExpires: env('S3_SIGNED_URL_EXPIRES', 15 * 60),
            Bucket: env('S3_BUCKET'),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  publisher: {
    enabled: true,
  },
})
