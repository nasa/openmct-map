define([], function () {
    function HeatmapColors(minimum, maximum) {
        this.minimum = minimum;
        this.maximum = maximum;
    }

    HeatmapColors.prototype.color = function (value) {
        if (value === undefined) {
            return "rgb(127,127,127)";
        }

        var v = Math.floor(((value - this.minimum) / this.maximum) * 255);
        return "rgb(" + [v, 255, 255].join(',') + ")";
    };

    return HeatmapColors;
});
