import { RevenueSharing } from "../models/revenueSharing.model.js";
import { Admin } from "../models/admin.model.js";

export const createRevenueSharing = async (req, res) => {
    try {
        const { pricePerView, pricePerLike } = req.body;
        const adminId = req.id;

        // Verify admin exists and has permission
        const admin = await Admin.findById(adminId);
        if (!admin || !admin.isActive) {
            return res.status(403).json({
                message: 'Unauthorized to create revenue sharing settings',
                success: false
            });
        }

        // Check if admin has permission (Admin or Manager)
        if (!['super-admin', 'admin'].includes(admin.role)) {
            return res.status(403).json({
                message: 'Insufficient permissions to create revenue sharing settings',
                success: false
            });
        }

        // Deactivate existing active settings
        await RevenueSharing.updateMany(
            { isActive: true },
            { isActive: false }
        );

        // Create new revenue sharing settings
        const revenueSharing = await RevenueSharing.create({
            pricePerView,
            pricePerLike,
            createdBy: adminId
        });

        return res.status(201).json({
            message: 'Revenue sharing settings created successfully',
            revenueSharing,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const getRevenueSharing = async (req, res) => {
    try {
        const adminId = req.id;

        // Verify admin exists
        const admin = await Admin.findById(adminId);
        if (!admin || !admin.isActive) {
            return res.status(403).json({
                message: 'Unauthorized',
                success: false
            });
        }

        // Get current active settings
        const currentSettings = await RevenueSharing.findOne({ isActive: true })
            .populate('createdBy', 'fullName email role')
            .populate('updatedBy', 'fullName email role');

        // Get all settings history
        const allSettings = await RevenueSharing.find()
            .populate('createdBy', 'fullName email role')
            .populate('updatedBy', 'fullName email role')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            currentSettings,
            allSettings
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const updateRevenueSharing = async (req, res) => {
    try {
        const { pricePerView, pricePerLike } = req.body;
        const adminId = req.id;

        // Verify admin exists and has permission
        const admin = await Admin.findById(adminId);
        if (!admin || !admin.isActive) {
            return res.status(403).json({
                message: 'Unauthorized to update revenue sharing settings',
                success: false
            });
        }

        // Check if admin has permission (Admin or Manager)
        if (!['super-admin', 'admin'].includes(admin.role)) {
            return res.status(403).json({
                message: 'Insufficient permissions to update revenue sharing settings',
                success: false
            });
        }

        // Get current active settings
        const currentSettings = await RevenueSharing.findOne({ isActive: true });

        if (!currentSettings) {
            return res.status(404).json({
                message: 'No active revenue sharing settings found',
                success: false
            });
        }

        // Update current settings
        currentSettings.pricePerView = pricePerView;
        currentSettings.pricePerLike = pricePerLike;
        currentSettings.updatedBy = adminId;
        await currentSettings.save();

        await currentSettings.populate('updatedBy', 'fullName email role');

        return res.status(200).json({
            message: 'Revenue sharing settings updated successfully',
            revenueSharing: currentSettings,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const getRevenueSharingHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const adminId = req.id;

        // Verify admin exists
        const admin = await Admin.findById(adminId);
        if (!admin || !admin.isActive) {
            return res.status(403).json({
                message: 'Unauthorized',
                success: false
            });
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        const revenueSharingHistory = await RevenueSharing.find()
            .populate('createdBy', 'fullName email role')
            .populate('updatedBy', 'fullName email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalSettings = await RevenueSharing.countDocuments();

        return res.status(200).json({
            success: true,
            revenueSharingHistory,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalSettings / limit),
                totalSettings,
                hasNext: page * limit < totalSettings,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};
