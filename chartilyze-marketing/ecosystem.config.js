module.exports = {
  apps: [
    {
      name: "chartilyze-marketing",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3020 -H 0.0.0.0",
      cwd: "./",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
