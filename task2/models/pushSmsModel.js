var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var pushSmsModel = new Schema({
    sender_id: {
        type: String
    },
    sms_body: {
        type: String
    },
    sender_mobile: {
        type: String
    },
    send_date: { // time to send sms...
        type: Number
    },
    usage_activity: { // defines template...
        type: String
    },
    lead_id: { // only for buyer
        type: String
    },
    user_type: { // 1 - seller , 2- buyer , 3-admin user 
        type: Number
    },
    emp_id: { // only for admin
        type: String
    },
    city: { // only for seller and buyer
        type: String
    },
    seller_type: { // for campaign if custom type seller
        type: Number
    },
    seller_login_status: {
        type: Number
    },
    sent_status: {
        type: Number,
        default: 0
    },
    sms_type: { // 1- OTP // 2 -TRANS
        type: String,
    }
});

module.exports = mongoose.model('push_sms', pushSmsModel);