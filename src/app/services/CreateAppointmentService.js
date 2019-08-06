import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import User from '../models/User';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

import Cache from '../../lib/Cache';

class CreateAppointmentService {
  async run({ provider_id, user_id, date }) {
    /** (
     * Check if provider id is a provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      throw new Error('You can only create appointements with providers');
    }

    if (provider_id === user_id) {
      throw new Error('Provider can not be the same user from appointment');
    }

    /**
     * Check for past dates
     */
    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date())) {
      throw new Error('Past dates are not allowed');
    }

    /**
     * Check date availability
     */
    const checkAvailability = await Appointment.findOne({
      where: { provider_id, canceled_at: null, date: hourStart },
    });

    if (checkAvailability) {
      throw new Error('Appointment date is not available');
    }

    const appointement = await Appointment.create({
      user_id,
      provider_id,
      date,
    });

    /**
     * Notify appointment provider
     */
    const user = await User.findByPk(user_id);

    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM ', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    /**
     * Invalidate Cache
     */
    await Cache.invalidatePrefix(`user:${user.id}:appointments`);

    return appointement;
  }
}

export default new CreateAppointmentService();
