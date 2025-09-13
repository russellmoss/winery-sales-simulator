
import { createHandler } from '@vercel/node';
import { claudeRoutes } from '../server/routes/claudeRoutes';

export default createHandler(claudeRoutes);
      