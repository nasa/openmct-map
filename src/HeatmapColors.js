define([], function () {
    function HeatmapColors(minimum, maximum) {
        this.minimum = minimum;
        this.maximum = maximum;
    }

    HeatmapColors.prototype.color = function (value) {
        if (value === undefined) {
            return "rgb(127,127,127)";
        }

        var v = ((value - this.minimum) / this.maximum) * 255;
        return "rgb(" + [v, 0, 255 - v].join(',') + ")";
    };

    return HeatmapColors;
});
