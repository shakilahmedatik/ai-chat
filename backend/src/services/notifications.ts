import {
  Notification,
  INotification,
  NotificationType,
} from '../models/Notification'

export type NotificationDto = {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

export function toNotificationDto(n: INotification): NotificationDto {
  return {
    id:
      (n as any)._id &&
      typeof (n as any)._id === 'object' &&
      typeof (n as any)._id.toString === 'function'
        ? (n as any)._id.toString()
        : String((n as any)._id),
    userId: n.userId.toString(),
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }
}

// create + emit helper
export async function createAndEmitNotification(input: {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}) {
  const notif = await Notification.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
  })

  const io = (global as any).io
  if (io) {
    io.to(`user:${input.userId}`).emit('notification', toNotificationDto(notif))
  }

  return notif
}
