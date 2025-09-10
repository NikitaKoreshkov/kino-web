module.exports = {
  apps: [
    {
      name: "kino-web",
      cwd: __dirname,
      script: "npm",
      args: "run start",
      interpreter: "/bin/bash",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
