var Mongoose = require('mongoose'),
    Schema = Mongoose.Schema;
var TemplateModel = new Schema({
    usage_activity: {
        type: String
    },
    email_body: {
        type: String
    },
    email_replace_config: {
        type: String
    },
    email_subject: {
        type: String,
    },
    emails_sent: {
        type: Number,
        default : 0
    },
    from_mail: {
        type: String,
    },

    from_name: {
        type: String,
    },
    email_status: {
        type: Number,
    },
    sms_body: {
        type: String,
    },
    sms_replace_config:{
        type:String
    },
    sms_sender_id:{
        type:String
    },
    sms_sent:{
        type:Number,
        default :0
    },
    sms_status:{
        type:Number
    },
    template_user_role:{
        type:Number
    },
    template_type:{
        type:String
    },
    created_time:{
        type:Number
    }
}, { versionKey: false });

module.exports = Mongoose.model('xxxxxx', TemplateModel , "xxxxxxxx");
