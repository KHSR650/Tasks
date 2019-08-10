var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs')
var userModel = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    emp_id: {
        type: String,
    },
    phone_number: {
        type: String,
    },
    city: {
        type: [String],
    },
    password: {
        type: String,
    },
    role: {
        type: Object,
    },
    designation: {
        type: String
    },
    joining_date: {
        type: Number,
    },
    reporting_to: {
        type: String,
    },
    user_status: {
        type: Number,
        default: 1 /// 1-active 2- removed(deleted) 0-Inactive
    },
    reset_pwd: {
        type: Number,
        default: 1 // for reset password
    },
    google_calendar_code: { // it is for confirmation code for calendar for first time..
        type: String,
        default: ''
    },
    google_calendar_status: { // it is for maintaing google calendar for sale events,
        type: Number, // if user allow calender permission then it should be 1
        default: 0
    },
    google_calendar_token: { // it is code which is got from google auth...
        type: Object,
        default: ''
    },
    skip_counter : {
        type : Number
    }
}, { versionKey: false });


userModel.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userModel.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('admin_users', userModel, 'admin_users')