
import { createHandler } from '@vercel/node';
import { elevenlabsRoutes } from '../server/routes/elevenlabsRoutes';

export default createHandler(elevenlabsRoutes);
      