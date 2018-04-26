var watchFaceConfiguration = [{
    element_id: "canvas_minute",
    name: "minute",
    value: "getMinute",
    color: "blue",
    radius: 0.45,
    thickness: "16"
}, {
    element_id: "canvas_hour",
    name: "hour",
    value: "getHour",
    color: "red",
    radius: 0.395,
    thickness: "14"
}, {
    element_id: "canvas_second",
    name: "second",
    value: "getSecond",
    color: "green",
    radius: 0.35,
    thickness: "12"
}, {
    element_id: "canvas_day_in_week",
    name: "day_in_week",
    value: "getWeek",
    color: "yellow",
    radius: 0.3075,
    thickness: "10"
}, {
    element_id: "canvas_day_in_month",
    name: "day",
    value: "getMonth",
    color: "orange",
    radius: 0.27,
    thickness: "8"
}, {
    element_id: "canvas_day_in_year",
    name: "day",
    value: "getYear",
    color: "orange",
    radius: 0.27,
    thickness: "8"
}];

var isAmbientMode = false;

function drawRadialBar(config) {
    var radius = config.radius,
        value = timePlus[config.value]();
    var progress = value.value / value.max;
    var can = document.getElementById(config.element_id),
        c = can.getContext('2d');

    c.canvas.width = window.innerWidth;
    c.canvas.height = window.innerHeight;

    var posX = can.width / 2,
        posY = can.height / 2;

    c.lineCap = 'round';

    var degrees = progress * 360;
    // c.clearRect(0, 0, can.width, can.height);

    c.beginPath();
    c.strokeStyle = config.color;
    c.lineWidth = config.thickness;
    c.arc(posX, posY, c.canvas.height * radius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + degrees));
    c.stroke();
}

function drawFull() {
    timePlus.update();
    console.log("Draw called!");
    for (var c in watchFaceConfiguration) {
        drawRadialBar(watchFaceConfiguration[c]);
    }
}

Date.prototype.monthDays = function() {
    var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
    return d.getDate();
};

var timePlus = {
    d: new Date(),
    update: function() {
        this.d = new Date();
    },
    getMinute: function() {
        return {
            value: this.d.getMinutes() + (this.d.getSeconds() / 60),
            max: 60
        };
    },
    getHour: function() {
        return {
            value: parseInt(this.d.getHours()) + (this.getMinute().value / 60),
            max: 24
        };
    },
    getSecond: function() {
        return {
            value: this.d.getSeconds(),
            max: 60
        };
    },
    getWeek: function() {
        return {
            value: this.d.getDay() + (this.getHour().value / 24),
            max: 7
        };
    },
    getMonth: function() {
        return {
            value: this.d.getDate() + (this.getHour().value / 24),
            max: this.d.monthDays()
        };
    },
    getYear: function() {
        var isLeap = (this.d.getFullYear() % 100 === 0) ? (this.d.getFullYear() % 400 === 0) : (this.d.getFullYear() % 4 === 0);
        return {
            value: this.d.getDay() + (this.getHour().value / 24),
            max: isLeap ? 366 : 365
        };
    }
};

function init() {
    var watchFace = function() {
    	tizen.power.request('CPU', 'CPU_AWAKE');
        drawFull();
    };

    window.addEventListener('ambientmodechanged', function(e) {
        console.log('ambientmodechanged: ' + e.detail.ambientMode);
        if (e.detail.ambientMode === true) {
            /* Render ambient mode */
            isAmbientMode = true;
            // ambientWatch();
        } else {
            /* Render normal mode */
            isAmbientMode = false;
            window.requestAnimationFrame(watchFace);
        }
    });

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if (e.keyName === "back") {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    });


    setInterval(watchFace, 1000);
    document.addEventListener('timetick', function(ev) {
        watchFace();
    });

    /**
     * Set default event listeners
     * @private
     */
    function setDefaultEvents() {
        // add eventListener to update the screen immediately when the device wakes up
        document.addEventListener("visibilitychange", function() {
            console.log("Visibility change.");
            if (!document.hidden) {
                // Draw the content of the watch
                watchFace();
            }
        });
    }
    setDefaultEvents();
}

window.onload = init;