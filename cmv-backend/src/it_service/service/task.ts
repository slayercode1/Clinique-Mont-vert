import type { Request, Response } from 'express';
import { getCache, invalidateCache, setCache } from '../../utils/cache.js';
import { render } from '../../utils/edge.js';
import { transporter } from '../../utils/mailer.js';
import prisma from '../../utils/prisma.js';
import type { TicketType } from '../../utils/types/index.js';

export const getTickets = async (_: Request, response: Response): Promise<any> => {
  try {
    const cached = await getCache('tickets');
    if (cached) return response.status(200).json(cached);

    const tickets = await prisma.ticket.findMany({
      include: { material: true, employee: true, resolvedBy: true, assign: true },
      where: { deleted: false },
    });
    const payload = { success: true, data: tickets };
    await setCache('tickets', payload, 60);
    return response.status(200).json(payload);
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des tickets',
    });
  }
};

export const getTicket = async (request: Request, response: Response): Promise<any> => {
  const id = request.params.id;
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        material: true,
        employee: true,
        resolvedBy: true,
        assign: true,
        service: true,
      },
    });

    if (!ticket)
      return response.status(404).json({
        success: false,
        message: "Le ticket n'a pas été trouvé",
      });

    return response.status(200).json({ success: true, data: ticket });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération du ticket',
    });
  }
};

export const createTicket = async (request: Request, response: Response): Promise<any> => {
  try {
    const body = request.body as TicketType;

    const newTicket = await prisma.ticket.create({
      data: {
        decription: body.description,
        serviceId: body.serviceId as string,
        employeeId: body.employeeId,
        priority: body.priority,
        created_at: new Date(),
        status: 'TODO',
        assignId: body.assignId,
      },
      include: {
        employee: true,
        material: true,
        resolvedBy: true,
        assign: true,
      },
    });

    await prisma.material.update({
      where: { id: body.materialId },
      data: { ticketId: newTicket.id },
    });

    await invalidateCache('tickets');
    return response.status(200).json({ success: true, data: newTicket });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la création du ticket',
    });
  }
};

export const updateTicket = async (request: Request, response: Response): Promise<any> => {
  const id = request.params.id;
  try {
    const body = request.body as Partial<TicketType>;

    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket)
      return response.status(404).json({
        success: false,
        message: "Le ticket n'a pas été trouvé",
      });

    switch (body.status) {
      case 'IN_VALIDATE':
        return prisma.ticket
          .update({
            where: { id: ticket.id },
            data: {
              status: body.status,
              priority: body.priority,
              serviceId: body.serviceId,
              employeeId: body.employeeId,
              decription: body.description,
              resolvedById: body.resolvedById,
              assignId: body.assignId,
              validated_at: body.validated_at,
            },
            include: { employee: true, resolvedBy: true, material: true, assign: true },
          })
          .then((data) => {
            sendemail(
              'task-completed-client-notification.edge',
              data,
              data.employee.email,
              'Tâche terminée - En attente de votre validation'
            );
            return response.status(200).json({ success: true, data });
          });

      case 'VALIDE':
        return prisma.ticket
          .update({
            where: { id: ticket.id },
            data: {
              status: 'CLOSED',
              priority: body.priority,
              serviceId: body.serviceId,
              employeeId: body.employeeId,
              decription: body.description,
            },
            include: { employee: true, resolvedBy: true, material: true },
          })
          .then((data) => {
            if (data.resolvedBy?.email) {
              sendemail(
                'client-task-approval-status.edge',
                data,
                data.resolvedBy.email,
                'Statut de la tâche - Validée par le client'
              );
            }
            return response.status(200).json({ success: true, data });
          });

      case 'NOT_VALIDATE':
        return prisma.ticket
          .update({
            where: { id: ticket.id },
            data: {
              status: 'IN_PROGRESS',
              priority: body.priority,
              serviceId: body.serviceId,
              employeeId: body.employeeId,
              decription: body.description,
              resolvedById: null,
            },
            include: { employee: true, resolvedBy: true, material: true },
          })
          .then((data) => {
            if (data.resolvedBy?.email) {
              sendemail(
                'client-task-approval-status.edge',
                data,
                data.resolvedBy.email,
                'Statut de la tâche - Refusée par le client'
              );
            }
            return response.status(200).json({ success: true, data });
          });

      default: {
        const update = await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: body.status,
            priority: body.priority,
            serviceId: body.serviceId,
            employeeId: body.employeeId,
            decription: body.description,
            resolvedById: null,
            validated_at: null,
          },
          include: { employee: true, resolvedBy: true, material: true },
        });
        await invalidateCache('tickets', `ticket:${id}`);
        return response.status(200).json({ success: true, data: update });
      }
    }
  } catch (_error) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la modification du ticket n° ${id}`,
    });
  }
};

export async function sendemail(template: string, data: any, to: string, subject: string) {
  try {
    const html = await render(template, data);
    await new Promise<void>((resolve, reject) => {
      transporter.sendMail(
        { from: process.env.EMAIL || 'noreply@cmv.re', to, subject, html },
        (error: Error | null) => (error ? reject(error) : resolve())
      );
    });
  } catch {
    // L'envoi d'email ne doit pas bloquer l'opération principale
  }
}

export const deleteTicket = async (request: Request, response: Response): Promise<any> => {
  try {
    const id = request.params.id;
    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket)
      return response.status(404).json({
        success: false,
        message: "Le ticket n'a pas été trouvé",
      });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { deleted: true },
    });

    await invalidateCache('tickets', `ticket:${id}`);
    return response.status(200).json({ success: true, message: 'Le ticket a été supprimé' });
  } catch (_error) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la suppression du ticket',
    });
  }
};
