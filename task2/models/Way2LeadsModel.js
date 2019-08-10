var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var LeadModel = new Schema({
    // these fields buyer_status,closure_time,username  not required.. we need to remove .. 
    buyer_status: {
        type: String,
    },
    closure_time: {
        type: String,
    },
    username: {
        type: String,
    },
    // end of not required fields ...


    // these fields added new 

    property_stage: {
        type: String
    },
    moving_plan: {
        type: String
    },
    need: {
        type: String,
    },
    rating: {
        type: Number,
        require: false,
    },
    home_loan: {
        type: Number, // reuire-1 & not require - 0
    },
    sale_type: [{
        type: Number, // Under construction 1 & Resale 2 && Ready to move in 3
    }],
    name: {
        type: String,
    },
    is_salaried: {
        type: Number, // 1 for salaried 2 for none
    },
    gender: {
        type: Number, // 1 for male 2 for female and 3 for others
    },
    age: {
        type: Number,

    },
    email: {
        type: String,
        require: false,
    },
    phone_number: {
        type: String,
        unique: true
    },
    already_seen_projects: [{
        type: String,
    }],
    view_count: {
        type: Number,
        default: 0
    },
    available_timings: {
        type: String
    },
    searching_since: {
        type: String
    },
    current_status: {
        type: String
    },
    currently_staying: [{
        type: String
    }],
    lead_status: {
        type: Number,
        default: 1,
    },
    purpose: {
        type: String,
    },
    budget_min: {
        type: Number,
    },
    budget_max: {
        type: Number,
    },
    work: {
        type: String,
    },
    company: {
        type: String,
    },
    purchase_count: {
        type: Number,
        default: 0
    },
    income: {
        type: Number
    },
    credits: {
        type: Number
    },
    sub_cities: {
        type: Array
    },
    prefered_locations: [{
        type: String
    }],
    projects_contacted: [{
        type: String
    }],
    property_type: [{
        type: Number,
    }],
    property_subtype: [{
        type: String,
    }],
    desired_city: {
        type: String,
    },
    lead_updated_time: {
        type: Number,
    },
    credit_updated_time: {
        type: Number,
    },
    comment: {
        type: String
    },
    utm_source: {
        type: String,
    },
    utm_medium: {
        type: String,
    },
    utm_content: {
        type: String,
    },
    utm_campaign: {
        type: String,
    },
    created_time: {
        type: Number,
    },
    sellers_list: [{
        type: String,
        default: []
    }],
    call_timings: {
        type: Number
    },
    landing_page: {
        type: String,
    },
    last_emp_id: {
        type: String,
    },
    last_emp_name: {
        type: String
    },
    relationship_manager: {
        type: Object
    },
    first_updated_time: {
        type: Number
    },
    apartment_facing: [{
        type: String
    }],
    vastu_compliant: {
        type: Number
    },
    kids_stay: {
        type: Number
    },
    elders_stay: {
        type: Number
    },

    // these keys for sale operations..

    sales_status: {
        type: Number // this is for exclusive lead status
    },
    sales_sub_status: {
        type: String // this is for exclusive lead sub status
    },
    sales_event: {
        type: Object // this is for event object if he selected calendar
    },
    sales_notes: [{
        type: Object // this is for notes from sales
    }],
    plot_size: {
        type: String
    },
    plot_size_units: {
        type: String
    },
    confirm_sms_sent: { // if  confirm sms sent 1 (not changed) .. otherwise 0 
        type: Number,
        default: 0
    },
    is_seller_notify: { // if lead notice sms sent 1 (not changed) ... otherwise 0
        type: Number,
        default: 0
    },

    allocated_to: { // this is for property advisers to allocationed 
        type: Object
    },
    allocated_time: {
        type: Number
    },
    ex_lead_type: {
        type: Number
    },
    project_name: {
        type: String
    }

}, {
    versionKey: false
});
module.exports = mongoose.model('way2leads', LeadModel, "way2leads");