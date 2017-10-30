define([], function () {
    function HeatmapColors(minimum, maximum) {
        this.minimum = minimum;
        this.maximum = maximum;
    }

    HeatmapColors.prototype.color = function (value) {
        if (value === undefined) {
            return "rgb(33,33,33)";
        }

        var v = (value - this.minimum) / (this.maximum - this.minimum);
        return this.colorForIntensity(v);
    };

    HeatmapColors.prototype.colorForIntensity = function (v) {
        var r = (Math.max(v - 0.5, 0) * 2);
        var g = 1 - 2 * Math.abs(v - 0.5);
        var b = Math.max(0.5 - v, 0) * 2;

        return "rgb(" + [r, g, b].map(function (c) {
            return Math.min(Math.max(Math.floor(c * 255), 0), 255);
        }).join(',') + ")";
    };

    return HeatmapColors;
});
