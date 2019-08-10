var mongoose = require('mongoose'),
    Schema = mongoose.Schema
var leadTrack = new Schema({
    lead_id: {
        type: String
    },
    time: {
        type: Number
    },
    source: {
        type: String // this represents Where this action occur like Buyer page .. Sales.. Telecaller
    },
    emp_id: {
        type: String,
    },
    lead_status: {
        type: Number,
    },
    emp_name: {
        type: String
    },
    sales_status: {
        type: Number
    },
    sales_sub_status: {
        type: Number
    },
    sales_stage_status: {
        type: Number
    },
    comment: {
        type: String
    }

}, { versionKey: false });

module.exports = mongoose.model('leads_tracking', leadTrack, 'leads_tracking');