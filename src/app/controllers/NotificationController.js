import User from '../models/User';
import Notifications from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });
    if (!isProvider) {
      return req.status(401).json('Only provider can load notifications');
    }
    const notifications = await Notifications.find({ user: req.userId })
      .sort({ createdAt: 'desc' })
      .limit(20);
    return res.json(notifications);
  }
}

export default new NotificationController();
