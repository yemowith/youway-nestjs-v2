import messages from './messages';

export default () => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  database: {
    url: process.env.DATABASE_URL || '',
  },
  paytr: {
    merchantId: process.env.PAYTR_MERCHANT_ID,
    merchantKey: process.env.PAYTR_MERCHANT_KEY,
    merchantSalt: process.env.PAYTR_MERCHANT_SALT,
    testMode: process.env.PAYTR_TEST_MODE === '1' ? 1 : 0,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  app: {
    baseUrl:
      process.env.APPURL ||
      `http://localhost:${process.env.PORT || 3000}/api/v1`,
    siteUrl: process.env.SITEURL || `${'http://localhost:1453'}`,
    name: process.env.APP_NAME || 'YouWay',
    logo: `<svg xmlns="http://www.w3.org/2000/svg" width="2131" height="506" fill="none" viewBox="0 0 2131 506">
      <mask id="a" width="1105" height="506" x="1026" y="0" maskUnits="userSpaceOnUse" style="mask-type:luminance">
        <path fill="#fff" d="M1026 0h1105v505.901H1026V0Z"/>
      </mask>
      <g mask="url(#a)">
        <mask id="b" width="1105" height="506" x="1026" y="0" maskUnits="userSpaceOnUse" style="mask-type:luminance">
          <path fill="#fff" d="M2101.73 0H1054.64c-7.6 0-14.88 3.161-20.25 8.786-5.37 5.626-8.39 13.25-8.39 21.204v369.078c0 7.953 3.02 15.578 8.39 21.203 5.37 5.625 12.65 8.786 20.25 8.786h14.08c7.59 0 14.88 3.162 20.25 8.782 5.37 5.625 8.39 13.255 8.39 21.208v29.203c0 6.078 3.14 11.677 8.2 14.646 5.06 2.963 11.26 2.833 16.2-.349l89.88-57.797c15.96-10.26 34.32-15.693 53.05-15.693h837.04c7.6 0 14.89-3.161 20.26-8.786 5.37-5.625 8.39-13.25 8.39-21.203V29.99c0-7.953-3.02-15.578-8.39-21.204C2116.62 3.161 2109.33 0 2101.73 0Z"/>
        </mask>
        <g mask="url(#b)">
          <path fill="#1D7FA8" d="M1026 0h1103.86v518.245H1026V0Z"/>
        </g>
      </g>
      <path fill="#171717" d="M250.167 70h56.979L146.771 443.208h-57.5l49.937-116.5c-15.14 0-26.073-2.604-32.791-7.812-6.724-5.208-12.438-13.531-17.146-24.979L0 70h56.48l80.208 198.208c1.677 4.709 3.526 7.74 5.541 9.084 2.011 1.333 5.542 2 10.584 2h7.062L250.167 70Zm193.168 0h55.979c35.302 0 63.381 10.932 84.23 32.792 20.843 21.849 31.27 55.302 31.27 100.354 0 44.724-10.427 78.099-31.27 100.125-20.849 22.015-48.928 33.021-84.23 33.021h-55.979c-35.656 0-63.823-11.006-84.5-33.021-20.666-22.026-31-55.401-31-100.125 0-45.052 10.334-78.505 31-100.354C379.512 80.932 407.679 70 443.335 70Zm50.938 51.438h-45.896c-23.208 0-40.115 6.39-50.708 19.166-10.584 12.781-15.875 33.625-15.875 62.542 0 28.583 5.291 49.265 15.875 62.042 10.593 12.765 27.5 19.145 50.708 19.145h45.896c22.859 0 39.666-6.38 50.416-19.145 10.761-12.777 16.146-33.459 16.146-62.042 0-28.917-5.385-49.761-16.146-62.542-10.75-12.776-27.557-19.166-50.416-19.166ZM677.339 70h53.979v159.375c0 15.458 5.63 28.49 16.896 39.083 11.26 10.584 27.484 15.875 48.666 15.875h43.375c21.177 0 37.318-5.291 48.417-15.875 11.094-10.593 16.646-23.625 16.646-39.083V70h52.437v161.396c0 30.599-9.75 55.729-29.25 75.396-19.5 19.666-48.244 29.5-86.229 29.5h-49.437c-37.99 0-66.74-9.834-86.25-29.5-19.5-19.667-29.25-44.797-29.25-75.396V70Z"/>
      <path fill="#F5F5F5" d="M1114 74.194h48.24l19.72 172.832c.56 4.748 2.03 8.314 4.4 10.692 2.38 2.383 6.23 3.57 11.54 3.57 5.04 0 8.74-1.044 11.11-3.137 2.38-2.101 4.13-5.112 5.25-9.028l31.47-134.243c3.35-14.82 9.92-26 19.7-33.547 9.8-7.555 23.5-11.333 41.12-11.333 17.62 0 31.04 3.778 40.27 11.333 9.23 7.546 15.53 18.727 18.89 33.547l29.79 134.243c1.67 8.11 7.26 12.165 16.77 12.165 5.04 0 8.67-1.187 10.9-3.57 2.24-2.378 3.64-5.944 4.2-10.692l23.08-172.833h48.24l-24.75 175.346c-1.96 15.388-7.77 27.769-17.41 37.135-9.65 9.366-24.54 14.053-44.67 14.053-17.07 0-30.43-3.778-40.08-11.333-9.65-7.555-16.15-19.018-19.5-34.397l-29.79-134.658c-.83-3.916-2.72-6.711-5.66-8.387-2.94-1.685-6.5-2.53-10.69-2.53-9.23 0-14.69 3.639-16.36 10.917l-31.47 134.658c-3.64 15.379-10.35 26.842-20.14 34.397-9.78 7.555-23.48 11.333-41.1 11.333-20.42 0-34.98-4.687-43.65-14.053-8.66-9.366-14.11-21.747-16.34-37.135L1114 74.194Zm437.96 0h132.99c18.45 0 33.33 3.149 44.66 9.444 11.33 6.285 19.58 14.954 24.76 26.009 5.17 11.047 7.76 23.558 7.76 37.534V251.22c0 15.942-2.94 27.34-8.82 34.189-5.87 6.853-18.17 10.276-36.91 10.276h-103.6c-26.3 0-45.25-6.013-56.86-18.039-11.6-12.026-17.39-28.527-17.39-49.507 0-20.136 5.65-35.792 16.98-46.977 11.33-11.182 30.56-16.774 57.68-16.774h105.29v-16.791c0-8.665-2.59-15.93-7.76-21.8-5.17-5.878-13.91-8.82-26.22-8.82h-132.56V74.194Zm154.38 178.274c8.11 0 12.16-3.769 12.16-11.316v-41.536h-104.45c-11.75 0-20.01 2.314-24.77 6.932-4.74 4.609-7.12 10.968-7.12 19.078s2.38 14.617 7.12 19.512c4.76 4.886 12.74 7.33 23.93 7.33h93.13Zm290.72-178.274h47.39l-133.39 310.42h-47.83l41.54-96.9c-12.59 0-21.69-2.167-27.28-6.499s-10.34-11.254-14.26-20.776l-74.25-186.245h46.98l66.71 164.862c1.4 3.916 2.93 6.437 4.61 7.555 1.67 1.109 4.61 1.663 8.8 1.663h5.88l75.1-174.08Z"/>
    </svg>
    `,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpirationTime: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    refreshTokenExpirationTime: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
    logo: `https://storage.youwayapp.com/storage/v1/object/public/media/logo/logo.svg`,
  },
  sms: {
    netgsm: {
      username: process.env.NETGSM_USERNAME,
      password: process.env.NETGSM_PASSWORD,
      header: process.env.NETGSM_SMSHEADER,
    },
  },
  security: {
    attemptMaxCount: parseInt(process.env.ATTEMPT_MAX_COUNT || '5', 10),
    attemptBlockDurationMinutes: parseInt(
      process.env.ATTEMPT_BLOCK_DURATION_MINUTES || '15',
      10,
    ),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  messages,
});
