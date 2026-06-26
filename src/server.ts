import express from 'express';
import { env } from './config/env.config';
import journalRoutes from './routes/journal.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
app.use(express.json({ limit: '10kb' })); 

// CSRF Layer Defense: Enforce explicit origin boundaries for state-changing operations
app.use((req, res, next) => {
  const allowedFrontendOrigin = 'http://localhost:5173'; // Your frontend development server URL axis
  const requestOrigin = req.headers.origin;

  // Intercept and reject foreign traffic on data modification methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && requestOrigin) {
    if (requestOrigin !== allowedFrontendOrigin) {
      return res.status(403).json({
        status: 'fail',
        message: 'CSRF Block Activated: Transaction rejected due to unauthorized origin source matching.'
      });
    }
  }
  next();
});

// Attach authenticated API channels
app.use('/api', journalRoutes);

// Centralized error firewall must sit at the absolute end of the application pipeline
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[${env.NODE_ENV}] me-time core engine running securely on port ${env.PORT}`);
});

export default app;