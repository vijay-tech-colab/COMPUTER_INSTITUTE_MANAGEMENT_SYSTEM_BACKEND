import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
    resource: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true
    },
    actions: [
        {
            type: String,
            default: ['view', 'list', 'create', 'update', 'delete', '*']
        }
    ],
    module: {
        type: String,
        enum: ['Core', 'Academic', 'Finance', 'Library', 'Administrative'],
        default: 'Core'
    }
}, {
    timestamps: true
});

const Permission = mongoose.model('Permission', permissionSchema);
export default Permission;
