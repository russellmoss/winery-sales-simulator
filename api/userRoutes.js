
import { createHandler } from '@vercel/node';
import { userRoutes } from '../server/routes/userRoutes';

export default createHandler(userRoutes);
      