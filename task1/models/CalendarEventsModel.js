var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var userCalenderEventModel = new Schema({
    emp_id: {
        type: String
    },
    emp_name: {
        type: String
    },
    emp_email: {
        type: String
    },
    emp_phone: {
        type: String
    },
    event_data: {
        type: Object // it contains event text , start time , end time,
            // from this process we have will added notice_counter 
    },

    // SMS DATA

    sms_body: {
        type: String

    },
    sender_id: {
        type: String

    },
    sms_status: { // sms sent = 1 , sms not sent = 0
        type: Number
    },
    sms_sending_time: { // if event related sms it should be one hour before event starting time
        type: Number
    },

    lead_id: {
        type: String
    },
    lead_status: {
        type: Number
    },
    notice_counter: {
        type: Number
    }
});

module.exports = mongoose.model('xxxxxxxxx', userCalenderEventModel);
