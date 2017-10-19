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
        var x = bounds.x - 1;
        var y = bounds.y - 1;
        var xSize = this.canvas.width / width;
        var ySize = this.canvas.height / height;

        this.context.strokeStyle = '1px #A8A8A8 solid';

        for (x = 0; x < width; x += 1) {
            for (y = 0; y < height; y += 1) {
                this.context.fillStyle = this.colors.color(heatmapModel.at(x, y));
                this.context.fillRect(x * xSize, y * ySize, xSize, ySize);
                this.context.strokeRect(x * xSize, y * ySize, xSize, ySize);
            }
        }
    };

    return HeatmapRenderer;
});
