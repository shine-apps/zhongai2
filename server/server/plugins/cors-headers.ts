export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:response', (response) => {
    response.headers['access-control-allow-origin'] = '*'
    response.headers['access-control-allow-methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    response.headers['access-control-allow-headers'] = 'Content-Type, Authorization'
  })
})
