import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        trim: true
    },
    description: String,
    permissions: [
        {
            permission: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Permission',
                required: true
            },
            actions: [String]
        }
    ],
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Helper to check for a permission
roleSchema.methods.hasPermission = function (resource, action) {
    const res = this.permissions.find(p => p.resource === resource || p.resource === '*');
    if (!res) return false;
    return res.actions.includes(action) || res.actions.includes('*');
};

const Role = mongoose.model('Role', roleSchema);
export default Role;
