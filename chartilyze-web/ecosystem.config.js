module.exports = {
  apps: [{
    name: 'chartilyze-app',
    script: 'npm',
    args: 'start',
    cwd: '/home/Rassell/chartilyze/chartilyze-web',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_bW92ZWQtZ2xvd3dvcm0tMTQuY2xlcmsuYWNjb3VudHMuZGV2JA',
      CLERK_SECRET_KEY: 'sk_test_RowCWxeaxCper6HYmvYKgmy61U5B7HJYeliAoJhKAx',
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/dashboard',
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/dashboard',
      NEXT_PUBLIC_CLERK_FRONTEND_API: 'https://moved-glowworm-14.clerk.accounts.dev',
      NEXT_PUBLIC_CLERK_DOMAIN: 'app.chartilyze.com'
    },
    exp_backoff_restart_delay: 100,
    max_memory_restart: '1G',
    error_file: '/home/Rassell/chartilyze/logs/chartilyze-app-error.log',
    out_file: '/home/Rassell/chartilyze/logs/chartilyze-app-out.log',
  }]
};

    