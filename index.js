import app from './app.js';
import config from './src/utils/config.js';
import logger from './src/utils/logger.js';


const { port } = config;

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});