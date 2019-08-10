const mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var leadAllocationCountsModel = new Schema({
    date: {
        type: Number,
    },
    emp_id: {
        type: String,
    },
    emp_name: {
        type: String,
    },
    total_allocated: {
        type: Number,
        default: 1
    }
}, {
    versionKey: false
})

module.exports = mongoose.model('lead_allot_counts', leadAllocationCountsModel, 'lead_allot_counts')