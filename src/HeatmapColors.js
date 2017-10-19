define([], function () {
    function HeatmapColors(minimum, maximum) {
        this.minimum = minimum;
        this.maximum = maximum;
    }

    HeatmapColors.prototype.color = function (value) {
        if (value === undefined) {
            return "rgb(127,127,127)";
        }

        var v = (value - this.minimum) / this.maximum;
        var r = (Math.max(v - 0.5, 0) * 2);
        var g = 1 - 2 * Math.abs(v - 0.5);
        var b = Math.max(0.5 - v, 0) * 2;

        console.log(r, g, b, v);

        return "rgb(" + [r, g, b].map(function (c) {
            return Math.min(Math.max(Math.floor(c * 255), 0), 255);
        }).join(',') + ")";
    };

    return HeatmapColors;
});
