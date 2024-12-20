import prisma from '../../utils/prisma.js';
import { render } from '../../utils/edge.js';
import { transporter } from '../../utils/mailer.js';
export const getTickets = async (_, response) => {
    try {
        const tickets = await prisma.ticket.findMany({
            include: {
                material: true,
                employee: true,
                resolvedBy: true,
                assign: true,
            },
        });
        return response.status(200).json({ success: true, data: tickets });
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération des tickets',
        });
    }
};
export const getTicket = async (request, response) => {
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
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération des tickets',
        });
    }
};
export const createTicket = async (request, response) => {
    try {
        const body = request.body;
        const newTicket = await prisma.ticket.create({
            data: {
                decription: body.description,
                servive: body.service,
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
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: `Une erreur est survenue lors de la creation du ticket`,
        });
    }
};
export const updateTicket = async (request, response) => {
    const id = request.params.id;
    try {
        const body = request.body;
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
                        servive: body.service,
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
                    sendemail('task-completed-client-notification.edge', data, data.employee.email, 'Tâche terminée - En attente de votre validation', response);
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
                        servive: body.service,
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
                    sendemail('client-task-approval-status.edge', data, data.resolvedBy.email, ' Statut de la tâche - Validée  par le client', response);
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
                        servive: body.service,
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
                    sendemail('client-task-approval-status.edge', data, data.resolvedBy.email, ' Statut de la tâche - Refusée par le client', response);
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
                        servive: body.service,
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
    }
    catch (error) {
        return response.status(500).json({
            success: false,
            message: `Une erreur est survenue lors de la modification du ticket n° ${id}`,
        });
    }
};
export async function sendemail(template, data, to, subject, response) {
    try {
        const html = await render(template, data);
        const mailOptions = {
            from: 'cliniquemontvert-itservice@gmail.com',
            to: to,
            subject,
            html,
        };
        // Use a Promise-based approach to handle email sending
        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
        // Send success response only if email is sent successfully
        response.status(200).json({ success: true, message: 'Email sent' });
    }
    catch (err) {
        // Send error response only if not already sent
        if (!response.headersSent) {
            response.status(500).json({
                error: err instanceof Error ? err.message : 'Internal server error',
            });
        }
    }
}
