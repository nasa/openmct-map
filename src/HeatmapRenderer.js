define([], function () {
    function HeatmapRenderer(canvas, legend, colors) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.colors = colors;
        this.renderLegend(legend);

    }

    HeatmapRenderer.prototype.renderLegend = function (legend) {
        var legendContext = legend.getContext('2d');

        for (var y = 0; y < legend.height; y += 1) {
            legendContext.fillStyle =
                this.colors.colorForIntensity(1.0 - y / legend.height);
            legendContext.fillRect(0, y, legend.width, 2);
        }
    };

    HeatmapRenderer.prototype.render = function (heatmapModel) {
        var bounds = heatmapModel.bounds();
        var width = Math.max(bounds.width, bounds.height) + 3;
        var height = width;
        var xSize = this.canvas.width / width;
        var ySize = this.canvas.height / height;
        var points = heatmapModel.points();

        this.context.lineWidth = 1.5;
        this.context.strokeStyle = '#484848';
        for (var x = 0; x < width; x += 1) {
            for (var y = 0; y < height; y += 1) {
                this.context.fillStyle =
                    this.colors.color(heatmapModel.at(x + bounds.x - 1, y + bounds.y - 1));
                this.context.fillRect(x * xSize, y * ySize, xSize, ySize);
                this.context.strokeRect(x * xSize, y * ySize, xSize, ySize);
            }
        }

        if (points.length > 0) {
            this.context.lineWidth = 3.0;
            this.context.strokeStyle = '#FFFFFF';
            this.context.beginPath();
            this.context.moveTo(
                (points[0].x - bounds.x + 1) * xSize,
                (points[0].y - bounds.y + 1) * ySize
            );
            points.forEach(function (point, index) {
                this.context.lineTo(
                    (point.x - bounds.x + 1) * xSize,
                    (point.y - bounds.y + 1) * ySize
                );
            }.bind(this));
            this.context.stroke();

            this.context.fillStyle = '#FFFFFF';
            this.context.beginPath();
            this.context.arc(
                (points[points.length - 1].x - bounds.x + 1) * xSize,
                (points[points.length - 1].y - bounds.y + 1) * ySize,
                9.0,
                0,
                Math.PI * 2
            );
            this.context.fill();
        }
    };

    return HeatmapRenderer;
});
