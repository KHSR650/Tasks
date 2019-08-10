module.exports = {
    getBudgetText: function(val) {
        if (val >= 10000000) {
            val = (val / 10000000).toFixed(2) + ' Cr';
        } else if (val >= 100000) {
            val = (val / 100000).toFixed(2) + ' Lac';
        }
        return val;
    },
    getPropertyText: function(listOfproperties) {
        propTypMap = {
            "1": "House/Villa",
            "2": "Flat/Apartment",
            "3": "Builder/Floor",
            "4": "Plot/Land"
        }
        listOfproperties = listOfproperties.map((value) => propTypMap[value])
        return listOfproperties.join(', ');
    },

    isSalesUser: function(userDetails) {
        if (typeof userDetails.role != "undefined" &&
            typeof userDetails.role.role_name != "undefined") {
            let roleName = userDetails.role.role_name.toLowerCase();
            return ["relationship manager", "senior relationship manager"].indexOf(roleName) > -1;
        } else {
            return false;
        }
    },

    /**
     * This function for normalizing the time at production vs development ... 
     */


    getCurrentTimeNow() {
        if (process.env.NODE_ENV !== "production") {
            return new Date();
        } else {
            return new Date();
            // return new Date(new Date().getTime() + 19800000);
        }
    }
}