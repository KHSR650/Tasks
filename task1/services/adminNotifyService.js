const pushSmsModel = require('../Models/PushSmsModel');
const userEventsModel = require('../Models/CalendarEventsModel');
const templateModel = require('../Models/TemplateModel');
const config = require('../config');
const async = require('async');

const mongoose = require('mongoose');

Date.prototype.getMillisBeforeOneHour = function() {
    let hours = this.getHours();
    let minutes = this.getMinutes()
    return new Date().setHours(hours - 1, minutes, 0, 0);
}
Date.prototype.getReadableHours = function() {
    let hours = this.getHours();
    let minutes = this.getMinutes()
    if (hours > 12) {
        return (hours - 12) + ":" + minutes + "PM";
    } else if (hours == 12) {
        return hours + ":" + minutes + "PM";
    } else {
        return hours + ":" + minutes + "AM";
    }
}


module.exports = {

    noticeTemplate: {},
    /**
     * [method for sening sms to admin about events which are inactive though event end time has passed]
     */
    main: function() {
        async.waterfall([
            module.exports.getUnActionedCompletedEvents, // FUNCTION 1;
            module.exports.getSMSTemplate, // function 2
            module.exports.sendNotifictionsToAdmin, //function 3
            module.exports.updateNoticeCounts
        ], function(error, success) {
            console.log(error, success);
        });
    },
    /**
     * 
     * @param { err, eventsData, message } next 
     */
    getUnActionedCompletedEvents: function(next) {
        console.log("@  getUnActionedCompletedEvents >>  ");
        const lastOneHourTime = new Date().getMillisBeforeOneHour();
        console.log("lastOneHourTime ==> ", lastOneHourTime);
        const findQuery = {
            "notice_counter": { $exists: false },
            "event_data.end": { $lte: lastOneHourTime },
            "event_status": 0
        }

        userEventsModel.find(findQuery).sort({ "event_data.start": 1 }).limit(10).exec((mongoErr, eventsData) => {
            if (mongoErr) {
                next(mongoErr, [], "MONGO ERROR @ getUnActionedCompletedEvents" + mongoErr)
            } else if (eventsData.length == 0) {
                next(true, [], "No events data found");
            } else {
                eventsData = JSON.parse(JSON.stringify(eventsData));
                next(null, eventsData, "Events data found")
            }
        });
    },
    /**
     * this function for getting template  
     * @param {eventsData} //from prev function 
     * @param { err,eventsData,template} next 
     * */

    getSMSTemplate: function(eventsData, message, next) {
        console.log("@ getSMSTemplate");
        console.log("eventsData Count ==>", eventsData.length);
        if (module.exports.noticeTemplate && Object.keys(module.exports.noticeTemplate).length > 2) {
            //console.log("a")
            next(null, eventsData, module.exports.noticeTemplate);
        } else {
            module.exports.getNoticeTemplate((template) => {
                if (template && Object.keys(template).length > 2) {
                    module.exports.noticeTemplate = template;
                    console.log("b")
                    next(null, eventsData, template);
                } else {
                    //console.log("c")
                    next(Error("No template found in db"), eventsData, null);
                }
            });
        }
    },
    /**
     * 
     * @param {Array} eventsData  // from prev function 
     * @param {String} message // from prev fuction 
     * @param { err,eventsData,message} next 
     */
    sendNotifictionsToAdmin: function(eventsData, template, next) {
        console.log("@ sendNotifictionsToAdmin");
        console.log("eventsData Count ==>", eventsData.length);
        if (eventsData.length) {
            const smsNotices = eventsData.map(event => module.exports.prepareSmsObjectFromEventData(event, template));
            pushSmsModel.create(smsNotices, (err) => {
                if (err) {
                    next(err, eventsData, null);
                } else {
                    next(null, eventsData, "Successfully Inserted in pushsms");
                }
            });
        } else {
            next(null, null, "No events to send notices to Admin");
        }
    },
    /**
     * 
     * @param { User event} event  // local sync function 
     */
    prepareSmsObjectFromEventData: function(event, template) {


        return {
            sender_id: module.exports.noticeTemplate.sender_id,
            sms_body: setSmsBodyAcToEvent(event),
            sender_mobile: config.admin_user_details.mobile,
            sms_type: "TRANS",
            send_date: Math.floor(new Date().getTime() / 1000),
            lead_id: event.lead_id,
            usage_activity: module.exports.noticeTemplate.usage_activity,
            user_type: 3
        };


        function setSmsBodyAcToEvent(event) {
            var smsBody = template.sms_body;
            if (event && event.event_data) {
                if (event.event_data.title) {
                    smsBody = smsBody.replace('##EVENTDATA##', event.event_data.title);
                } else {
                    smsBody = smsBody.replace('##EVENTDATA##', 'NA');
                }

                if (event.event_data.start || event.event_data.end) {
                    let time = new Date(event.event_data.start).getReadableHours() + '-' + new Date(event.event_data.end).getReadableHours();
                    smsBody = smsBody.replace('##TIME##', time);
                } else {
                    smsBody = smsBody.replace('##TIME##', 'NA');
                }
            } else {
                smsBody = smsBody.replace('##EVENTDATA##', 'NA');
                smsBody = smsBody.replace('##TIME##', 'NA');
            }

            if (event && event.emp_name) {
                smsBody = smsBody.replace('##EMPNAME##', event.emp_name);
            } else {
                smsBody = smsBody.replace('##EMPNAME##', 'NA');
            }

            return smsBody;
        }
    },
    /**
     * 
     * @param {Array} noticedEvents // from prev function
     *  @param {err,message} next
     */
    updateNoticeCounts: function(noticedEvents, message, next) {
        console.log("@ updateNoticeCounts");
        console.log("noticedEvents Count ==>", noticedEvents.length);
        const eventIds = noticedEvents.map((e) => mongoose.Types.ObjectId(e._id));


        userEventsModel.update({ _id: { $in: eventIds } }, { $inc: { notice_counter: 1 } }, { multi: true }, (updateErr, updateResult) => {
            if (updateErr) {
                next(err, "Mongo Error at updating counts");
            } else {
                next(null, updateResult);
            }
        });
    },
    /**
     * [method for getting suitable template to send SMS to Admin]
     * @param {Function} callback 
     */
    getNoticeTemplate: function(callback) {
        templateModel.findOne({ 'usage_activity': "event_notice_admin", "sms_status": 1 }, (err, template) => {
            if (err) {
                console.log("Error at getting notice template", err)
                callback({});
            } else if (template) {
                callback(template.toObject());
            } else {
                return callback({});
            }
        });
    },
}
