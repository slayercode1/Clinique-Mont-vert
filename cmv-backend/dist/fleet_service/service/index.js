import prisma from '../../utils/prisma.js';
export const getVehicles = async (_, response) => {
    try {
        const vehicles = await prisma.vehicle.findMany();
        return response.status(200).json({ success: true, data: vehicles });
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération des véhicules',
        });
    }
};
export const getCost = async (request, response) => {
    try {
        const id = request.params.id;
        const vehicleId = await prisma.vehicle.findUnique({
            where: { id: id },
        });
        if (!vehicleId) {
            return response.status(404).json({
                success: false,
                message: "Le véhicule n'a pas était trouver ",
            });
        }
        const vehicle = await prisma.cost.findMany({
            where: { vehicleId: vehicleId?.id },
        });
        return response.status(200).json({ success: true, data: vehicle });
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération du véhicule',
        });
    }
};
export const createVehicle = async (request, response) => {
    try {
        const body = request.body;
        const newVehicle = await prisma.vehicle.create({
            data: {
                brand: body.brand,
                state: body.state,
                kilometres: body.kilometres,
                model: body.model,
                year: body.year,
                maintenance_date: body.maintenance_date,
            },
        });
        return response.status(200).json({ success: true, data: newVehicle });
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: `Une erreur est survenue lors de la creation du véhicule`,
        });
    }
};
export const createCost = async (request, response) => {
    try {
        const body = request.body;
        const newCost = await prisma.cost.create({
            data: {
                vehicleId: body.vehicleId,
                description: body.description,
                cost: body.cost,
                maintenance_date: body.maintenance_date,
            },
        });
        return response.status(200).json({ success: true, data: newCost });
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: `Une erreur est survenue lors de la creation d' un coût `,
        });
    }
};
export const updateVehicle = async (request, response) => {
    const id = request.params.id;
    try {
        const body = request.body;
        const vehicle = await prisma.vehicle.findUnique({
            where: {
                id,
            },
        });
        if (!vehicle)
            return response.status(404).json({
                success: false,
                message: "Le véhicule n'a pas était trouver ",
            });
        const vehicleUpdate = await prisma.vehicle.update({
            where: {
                id: vehicle.id,
            },
            data: {
                ...body,
            },
        });
        return response.status(200).json({ success: true, data: vehicleUpdate });
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: `Une erreur est survenue lors de la modification du véhicule ${id}`,
        });
    }
};
