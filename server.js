import app, { logger } from './app.js'

const port = 3000

// Start express server
app.listen(port, ()=>{
  logger.info(`Reward endpoint server is now listening on port ${port}`);
})