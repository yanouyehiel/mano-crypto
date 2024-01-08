module.exports = {
    apps: [
      {
        name: 'Mansexch App',
        script: 'ng',
        args: 'serve',
        watch: true,
        env: {
          NODE_ENV: 'development'
        },
        env_production: {
          NODE_ENV: 'production'
        },
        node_args: '--max-old-space-size=1024'
      }
    ]
};