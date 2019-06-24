import { Router } from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Jay Gibran',
    email: 'jaygibran@gmail',
    password_hash: '1231561',
  });

  res.json(user);
});

export default routes;
