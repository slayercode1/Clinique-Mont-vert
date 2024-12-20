import { Request, Response } from 'express';
import prisma from '../../utils/prisma.js';
import { TicketType } from '../../utils/types/index.js';
import { render } from '../../utils/edge.js';
import { transporter } from '../../utils/mailer.js';

export const getTickets = async (
  _: Request,
  response: Response
): Promise<any> => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        material: true,
        employee: true,
        resolvedBy: true,
        assign: true,
      },
      where: {
        deleted: false
      }
    });
    return response.status(200).json({ success: true, data: tickets });
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des tickets',
    });
  }
};

export const getTicket = async (
  request: Request,
  response: Response
): Promise<any> => {
  const id = request.params.id;
  try {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id,
      },
      include: {
        material: true,
        employee: true,
        resolvedBy: true,
        assign: true,
      },
    });

    if (!ticket)
      return response.status(404).json({
        success: false,
        message: "La tâche n'a pas était trouver ",
      });

    return response.status(200).json({ success: true, data: ticket });
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des tickets',
    });
  }
};

export const createTicket = async (
  request: Request,
  response: Response
): Promise<any> => {
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
      where: {
        id: body.materialId,
      },
      data: {
        ticketId: newTicket.id,
      },
    });

    return response.status(200).json({ success: true, data: newTicket });
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la creation du ticket`,
    });
  }
};

export const updateTicket = async (
  request: Request,
  response: Response
): Promise<any> => {
  const id = request.params.id;
  try {
    const body = request.body as Partial<TicketType>;

    const ticket = await prisma.ticket.findUnique({
      where: {
        id,
      },
    });

    if (!ticket)
      return response.status(404).json({
        success: false,
        message: "La taâche n'a pas etait trouver ",
      });

    switch (body.status) {
      case 'IN_VALIDATE':
        return prisma.ticket
          .update({
            where: {
              id: ticket.id,
            },
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
            include: {
              employee: true,
              resolvedBy: true,
              material: true,
              assign: true,
            },
          })
          .then((data) => {
            sendemail(
              'task-completed-client-notification.edge',
              data,
              data.employee.email,
              'Tâche terminée - En attente de votre validation',
              response
            );
            return response.status(200).json({ success: true, data });
          });

      case 'VALIDE':
        return prisma.ticket
          .update({
            where: {
              id: ticket.id,
            },
            data: {
              status: 'CLOSED',
              priority: body.priority,
              serviceId: body.serviceId,
              employeeId: body.employeeId,
              decription: body.description,
            },
            include: {
              employee: true,
              resolvedBy: true,
              material: true,
            },
          })
          .then((data) => {
            sendemail(
              'client-task-approval-status.edge',
              data,
              data.resolvedBy!.email,
              ' Statut de la tâche - Validée  par le client',
              response
            );
            return response.status(200).json({ success: true, data });
          });

      case 'NOT_VALIDATE':
        return prisma.ticket
          .update({
            where: {
              id: ticket.id,
            },
            data: {
              status: 'IN_PROGRESS',
              priority: body.priority,
              serviceId: body.serviceId,
              employeeId: body.employeeId,
              decription: body.description,
              resolvedById: null,
            },
            include: {
              employee: true,
              resolvedBy: true,
              material: true,
            },
          })
          .then((data) => {
            sendemail(
              'client-task-approval-status.edge',
              data,
              data.resolvedBy!.email,
              ' Statut de la tâche - Refusée par le client',
              response
            );
            return response.status(200).json({ success: true, data });
          });

      default:
        const update = await prisma.ticket.update({
          where: {
            id: ticket.id,
          },
          data: {
            status: body.status,
            priority: body.priority,
            serviceId: body.serviceId,
            employeeId: body.employeeId,
            decription: body.description,
            resolvedById: null,
            validated_at: null,
          },
          include: {
            employee: true,
            resolvedBy: true,
            material: true,
          },
        });
        return response.status(200).json({ success: true, data: update });
    }
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la modification du ticket n° ${id}`,
    });
  }
};

export async function sendemail(
  template: string,
  data: any,
  to: string,
  subject: string,
  response: Response
) {
  try {
    const html = await render(template, data);

    const mailOptions = {
      from: 'cliniquemontvert-itservice@gmail.com',
      to: to,
      subject,
      html,
    };

    // Use a Promise-based approach to handle email sending
    await new Promise<void>((resolve, reject) => {
      transporter.sendMail(mailOptions, (error: Error | null) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    // Send success response only if email is sent successfully
    response.status(200).json({ success: true, message: 'Email sent' });
  } catch (err) {
    // Send error response only if not already sent
    if (!response.headersSent) {
      response.status(500).json({
        error: err instanceof Error ? err.message : 'Internal server error',
      });
    }
  }
}

export const deleteTicket = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const id = request.params.id

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: id,
      },
    });

    if (!ticket)
      return response.status(404).json({
        success: false,
        message: "Le ticket n'a pas etait trouver ",
      });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        deleted: true
      }
    })

    return response.status(200).json({ success: true, message: 'Le ticket a était supprimer' });


  } catch (error) {
    return response.status(500).json({
      success: false,
      message:
        'Une erreur est survenue lors de la suppression du ticket',
    });
  }
}
