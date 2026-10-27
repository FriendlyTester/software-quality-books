import path from 'path';

const config = {
  consumer: 'YourConsumer',   // Consumer name
  provider: 'YourProvider',   // Provider name
  dir: path.resolve(import.meta.dirname, 'pacts'),  // Path to store pact files
  logLevel: 'INFO',           // Log level for pact mock service
};

export default config;