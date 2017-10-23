define([], function () {
    function HeatmapRenderer(canvas, colors) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.colors = colors;
    }

    HeatmapRenderer.prototype.render = function (heatmapModel) {
        var bounds = heatmapModel.bounds();
        var width = bounds.width + 2;
        var height = bounds.height + 2;
        var xSize = this.canvas.width / width;
        var ySize = this.canvas.height / height;

        this.context.strokeStyle = '#484848';
        for (x = 0; x < width; x += 1) {
            for (y = 0; y < height; y += 1) {
                this.context.fillStyle = this.colors.color(heatmapModel.at(x + bounds.x, y + bounds.y));
                this.context.fillRect(x * xSize, y * ySize, xSize, ySize);
                this.context.strokeRect(x * xSize, y * ySize, xSize, ySize);
            }
        }

        this.context.strokeStyle = '#FFFFFF';
        this.context.beginPath();
        heatmapModel.points().forEach(function (point, index) {
            var x = (point.x - bounds.x) * xSize;
            var y = (point.y - bounds.y) * ySize;
            if (index === 0) {
                this.context.moveTo(x, y);
            } else {
                this.context.lineTo(x, y);
            }
        }.bind(this));
        this.context.stroke();
    };

    return HeatmapRenderer;
});
