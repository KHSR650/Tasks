const mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var leadAllocationConfig = new Schema({

    lead_allocation_status: {
        type: Number,
        enum: [0, 1]
    },
    rm_lead_allocation_status: {
        type: Number,
        enum: [0, 1]
    },
    leads_limit: {
        type: Number,
    },
    last_updated_time: {
        type: Number
    },
    next_property_advisor: {
        type: Object
    },
    next_relationship_manager : {
        type : Object
    }
}, {
    versionKey: false
})


module.exports = mongoose.model('leads_allot_config', leadAllocationConfig, 'leads_allot_config')