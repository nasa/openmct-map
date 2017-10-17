define([], function () {
    function Heatmap() {
        this.minX = Number.MAX_VALUE;
        this.maxX = Number.MIN_VALUE;

        this.minY = Number.MAX_VALUE;
        this.maxY = Number.MIN_VALUE;

    }

    Heatmap.prototype.add = function (x, y, counts) {
        x = Math.floor(x);
        y = Math.floor(y);

        this.minX = Math.min(x, this.minX);
        this.minY = Math.min(y, this.minY);

        this.maxX = Math.max(x, this.maxX);
        this.maxY = Math.max(y, this.maxY);
    };

    return Heatmap;
});
