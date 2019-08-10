const userModel = require('./../models/userModel');
const Way2LeadsModel = require('./../models/Way2LeadsModel');
const leadAllocateConfig = require('./../models/leadAllocationConfigModel');
const leadAllocateCounts = require('./../models/leadAllocationCountsModel');
const representationUtils = require("./../utils/representationUtils");
const leadTrackModel = require('./../models/leadTrackModel')
const async = require('async');
const config = require('config');
const LogPrinter = require('../utils/LogPrinter');
var logPrinter = new LogPrinter("PA ALLOCATION PROCESS");
const mongoose = require('mongoose');
const PriorityQueue = require('../utils/PriorityQueue');

module.exports = {
    /**
     * [this process main function will used serve the leads to all active user for processing]
     */
    main: function() {
        async.waterfall([
            module.exports.checkProcessStatus,
            module.exports.getUnallotedNewLeads,
            module.exports.getRosterLeads,
            module.exports.processCampaignLeads,
            module.exports.processRosteredLeads
        ], function(err, result) {
            if (err) {
                logPrinter.log("Error :: ", err);
            } else {

                logPrinter.log("Completions of Procress ", result);
            }
        });
    },
    /**
     * [method for checking current process allocation status]
     * @param { Function } next will return (err, status, message ,config) 
     */
    checkProcessStatus: function(next) {
        logPrinter.log("in process status")
        leadAllocateConfig.find({}, function(err, data) {
            if (err) {
                logPrinter.log(err)
                next(Error(err), 0, "MONGO ERROR AT", null)
            } else if (data.length == 0) {
                logPrinter.log("no data")
                next(null, 0, "NO CONFIG", null);
            } else {
                if (data[0].lead_allocation_status) {
                    logPrinter.log("active")
                    next(null, 1, "ACTIVE", data[0].toObject());
                } else {
                    logPrinter.log("inactive")
                    next(null, 0, "INACTIVE", data[0].toObject());
                }
            }
        })
    },

    /**
     * [method for getting which leads we should serve]
     * @param { Number } allocationStatus // from prev fn
     * @param { String} allocationMessage // from prev fn
     * @param { Object} config // from prev fn
     * @param { Function} next will return (err,leadsData)
     */

    getUnallotedNewLeads: function(allocationStatus, allocationMessage, config, next) {
        Way2LeadsModel.find({
            lead_status: 1,
            allocated_to: { $exists: false },
            allocated_time: { $exists: false },
            project_name: { $exists: false }
        }, function(err, leadsData) {
            if (err) {
                next(Error("Mongo Error @ getUnallotedNewLeads" + err), [])
            } else if (leadsData && leadsData.length) {
                next(null, leadsData, `New leads Got ==> ${leadsData.length}`);
            } else {
                next("No new Leads found", leadsData, `New leads Got ==> ${leadsData.length}`);
            }
        });
    },
    /**
     * 
     * [This function divide all leads into Roster leads and Campaigned Leads based on UTM_SOURCE
     * Roster leads allocated to USERS in Roster , Campained leads will allocate to user depends
     * on allowing campaigns of them .
     * ]
     * @param {[Object]} newLeads 
     * @param { Function } next will return (err,campaignedLeads,rosteredLeads)
     */

    getRosterLeads: function(newLeads, next) {
        // this is utm_campaign name that used to allocate specific users
        var specificCampaignNames = config.specific_campaigns ? config.specific_campaigns.map(e => e.toLowerCase()) : [];

        var campaignedLeads = [];
        var rosteredLeads = newLeads.filter((lead) => {
            if (lead && lead.utm_campaign && lead.utm_campaign.length) {
                if (
                    specificCampaignNames.indexOf(lead.utm_campaign.toLowerCase()) > -1
                ) {
                    campaignedLeads.push(lead);
                    return false;
                } else {
                    return true;
                }
            } else { // if no campaing exist we have to send to Roster
                return true;
            }
        });

        logPrinter.log("leads Not For Roster ....................", campaignedLeads.length);
        logPrinter.log("leads For Roster ....................", rosteredLeads.length);

        next(null, campaignedLeads, rosteredLeads);
    },
    /**
     *
     * @param {[Object]} campaignedLeads 
     * @param {*} next will return (err,rosteredLeads,message)
     */
    processCampaignLeads: function(campaignedLeads, rosteredLeads, next) {
        if (campaignedLeads.length) {
            next(null, rosteredLeads, "No campaignedLeads to serve");
        } else {
            module.exports.checkActivePropertyAdvisor(function(status, activeUsers) {
                if (status == 1) {
                    const priorityQueue = new PriorityQueue(activeUsers);
                    async.eachSeries(campaignedLeads, function(lead, series_callback) {
                        let currentPA = priorityQueue.getSuitableCampaignUser(lead.utm_campaign);
                        if (currentPA) {
                            module.exports.assignToPA([lead], currentPA, function(status, result, allocatedCount) {
                                series_callback(null)
                            });
                        } else {
                            series_callback(null)
                        }
                    }, function(err) {
                        if (err) {
                            logPrinter.log("Error at Series Process");
                            next(null, rosteredLeads, "Error at Series Process @ processCampaignLeads");
                        } else {
                            logPrinter.log("All leads Allocated...", countttt);
                            next(null, rosteredLeads, "All leads Allocated  @ processCampaignLeads");
                        }
                    });
                } else if (status == -1) {
                    next(Error("Mongo Error at Activusers" + activeUsers), null, null)
                } else {
                    next(Error("No Active Users "), null, null)
                }
            });
        }
    },
    /**
     * 
     * @param {[Object]} rosteredLeads  // from prev
     * @param {String} message  // from prev
     * @param {Function} next // (err,message)
     */
    processRosteredLeads: function(rosteredLeads, message, next) {
        logPrinter.log("@ processRosteredLeads    ---- > ");
        logPrinter.log("rosteredLeads == ", rosteredLeads.length);
        logPrinter.log("message == ", message);
        if (rosteredLeads.length) {
            next(null, "No rosteredLeads to serve");
        } else {
            module.exports.checkActivePropertyAdvisor(function(status, activeUsers) {
                if (status == 1) {
                    const priorityQueue = new PriorityQueue(activeUsers);
                    async.eachSeries(rosteredLeads, function(lead, series_callback) {
                        let currentPA = priorityQueue.getUserWithLessAssignedCount();
                        if (currentPA) {
                            module.exports.assignToPA([lead], currentPA, function(status, result, allocatedCount) {
                                series_callback(null)
                            });
                        } else {
                            series_callback(null)
                        }
                    }, function(err) {
                        if (err) {
                            logPrinter.log("Error at Series Process");
                            next(null, "Error at Series Process @ processCampaignLeads");
                        } else {
                            logPrinter.log("All leads Allocated...", countttt);
                            next(null, "All leads Allocated  @ processCampaignLeads");
                        }
                    });

                } else if (status == -1) {
                    next(Error("Mongo Error at Activusers" + `${activeUsers}`), null, null)
                } else {
                    next(Error("No Active Users "), null, null)
                }
            });
        }
    },
    /**
     *  [method for getting data of users which are active for roaster and 
     *  to maitain equal distribution of leads we are getting allocation counts also]
     * @param {Function } callback 
     */
    checkActivePropertyAdvisor: function(callback) {

        let today = Math.floor(new Date.setHours(0, 0, 0, 0) / 1000);

        userModel.aggregate([{
                $match: { "role.role_name": { $in: ["Property Advisor", "Senior Property Advisor"] }, "lead_allocation_status": 1 }
            },
            {
                $project: { "emp_id": 1, "name": 1, "lead_allocation_status": 1 }
            },
            {
                $lookup: {
                    from: "lead_allot_counts",
                    let: { "emp_id": "$emp_id" },
                    pipeline: [{
                        $match: {
                            $expr: { "$eq": ["$emp_id", "$$emp_id"] },
                            date: today
                        }
                    }],
                    as: "emp_matched_counts"
                }
            },
            {
                $project: {
                    emp_id: "$emp_id",
                    name: "$name",
                    date: "$emp_matched_counts.date",
                    total_allocated: "$emp_matched_counts.total_allocated"
                }
            }
        ], (err, data) => {
            if (err) {
                callback(-1, err)
            } else if (data && data.length) {

                let dataWithAllocatedCounts = data.map(e => {
                    return {
                        emp_id: e.emp_id,
                        name: e.name,
                        total_allocated: (e.date && e.data.length && e.total_allocated && e.total_allocated.length) ? e.total_allocated[0] : 0,
                        allowed_campaigns: (e.allowed_campaigns && e.allowed_campaigns.length) ? e.allowed_campaigns.map(c => c.value) : []
                    }
                });
                callback(1, dataWithAllocatedCounts)
            } else {
                callback(0, [])
            }
        });
    },
    /**
     * [method for allocating leads to specific propertyAdviser and increments counts
     * and inserting lead track]
     * @param {[Objects]} leads 
     * @param {Object} propertyAdviser 
     * @param {Function} callback 
     */

    assignToPA: function(leads, propertyAdviser, callback) {

        var leadPhoneNumbers = leads.map(e => e.toObject().phone_number);
        var leadIds = leads.map(e => mongoose.Types.ObjectId(e._id));

        logPrinter.log("leadPhoneNumbers", leadPhoneNumbers);
        logPrinter.log("leadIds", leadIds);

        Way2LeadsModel.update({ _id: { $in: leadIds } }, {
            $set: {
                allocated_to: propertyAdviser,
                allocated_time: Math.floor(new Date().getTime() / 1000)
            }
        }, { multi: true }, function(err, result) {
            if (err) {
                callback(-1, err, null)
            } else {
                logPrinter.log("Updated result", result);
                if (result.nModified >= 1) { // Count of Modified Results
                    logPrinter.log("Result n modifined>>>>>>>>> ", result.nModified)
                        // we need to update counts by emp id and date..
                    let indexedFilter = {
                        emp_id: propertyAdviser.emp_id,
                        emp_name: propertyAdviser.name,
                        date: Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
                    }

                    let updateQuery = {
                        $inc: {}
                    }
                    updateQuery["$inc"]["total_allocated"] = result.nModified; // for increment 

                    leadAllocateCounts.update(indexedFilter, updateQuery, { upsert: true }, function(err, result) {
                        if (err) {
                            callback(-1, "Error at leadAllocateCounts " + err, null);
                        } else {
                            if (leads && leads.length > 0) {
                                module.exports.addLeadTrackForAllocatedLeads(leads, propertyAdviser, (status) => {
                                    callback(1, "Counts updated && Track inserted .. ", result.nModified);
                                })
                            }
                        }
                    });
                } else {
                    callback(1, "Count No Needd....", null);
                }
            }
        });
    },
    /**
     * [method for insert lead tracks]
     * @param {[Objects]} leads 
     * @param {Object} propertyAdviser 
     * @param {Function} callback 
     */
    addLeadTrackForAllocatedLeads: function(leads, propertyAdviser, callback) {
        async.forEach(leads, function(lead, async_callback) {
            leadTrackLog = new leadTrackModel();
            leadTrackLog.lead_id = lead._id;
            leadTrackLog.emp_id = "Roaster-1111";
            leadTrackLog.emp_name = "ROASTER";
            leadTrackLog.source = "PROCESS";
            leadTrackLog.lead_status = 14;
            leadTrackLog.comment = "Allocated to " + propertyAdviser.name + " - " + propertyAdviser.emp_id;
            leadTrackLog.time = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
            leadTrackLog.save((err) => {
                if (err) {
                    async_callback(null)
                    logPrinter.log("Error in lead tracking inserting");
                } else {
                    async_callback(null)
                    logPrinter.log("inserted log")
                }
            });
        }, function(async_callback) {
            callback(1);
        });
    },
    /**
     * [method for stopping lead allocation proces]
     * @param {Function} callback 
     */
    stopAllocationProcess: function(callback) {
        leadAllocateConfig.update({}, { $set: { lead_allocation_status: 0 } }, function(err, result) {
            if (err) {
                logPrinter.log("Error at stopAllocationProcess", err);
                callback(0)
            } else {

                logPrinter.log("-------------------------- Process Stopped For Today --------------------");
                logPrinter.log("************************************ Good Bye ***************************");
                callback(1)
            }
        })
    },
    /**
     * [method for removing allocted user from the leads]
     * @param {Function} callback 
     */
    unsetLeads: function(callback) {
        Way2LeadsModel.update({
                lead_status: 1,
                allocated_to: { $exists: true },
            }, { $unset: { allocated_time: "", allocated_to: "" } }, { multi: true },
            function(err, updated) {
                if (err) {
                    logPrinter.log('error while unset leads', err);
                    callback(0);
                } else {
                    callback(1);
                }
            });
    },
    /**
     * [method for checking current time is unsetting time]
     */

    isLeadUnsettingTime: function() {
        let date = representationUtils.getCurrentTimeNow();
        var currentTime = (date.getHours() * 60) + date.getMinutes();
        var unsettingTime = (config.daily_rule.unsetting_time.hour * 60) + config.daily_rule.unsetting_time.minute;
        return (currentTime == unsettingTime);
    },
    /**
     * [method for checking current time is allocation time]
     */
    isAllocationTime: function() {
        let date = representationUtils.getCurrentTimeNow();
        var currentTime = (date.getHours() * 60) + date.getMinutes();
        var startTime = (config.daily_rule.start_time.hour * 60) + config.daily_rule.start_time.minute;
        var endTime = (config.daily_rule.end_time.hour * 60) + config.daily_rule.end_time.minute;

        return (currentTime >= startTime && currentTime <= endTime);
    }

}
