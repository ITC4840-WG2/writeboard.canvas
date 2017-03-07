var lineWidth = 1;
var tool = 'marker';
var tools = {};
$(function () {
    //tool init options
    tools = {
        marker: {
            color: 'rgba(0, 0, 0, 1)',
            globalCompositeOperation: 'source-over'
        },
        eraser: {
            color: 'rgba(255,255,255,0)',
            globalCompositeOperation: 'destination-out'
        }
    };

    //color picker
    $('#wb-color-picker').colorPicker({
        renderCallback: function (e, toggled) {
            tools.marker.color = '#' + this.color.colors.HEX;
            e.val('#' + this.color.colors.HEX);
        }
    });

    //canvas
    var canvas = $('#wb-canvas')[0].getContext('2d');

    var lastEvent;
    var mouseDown = false;
    $('#wb-canvas').mousedown(function (e) {
        lastEvent = e;
        mouseDown = true;
    }).mousemove(function (e) {
        if (mouseDown) {
            canvas.beginPath();
            canvas.globalCompositeOperation = tool.globalCompositeOperation;
            canvas.moveTo(lastEvent.offsetX, lastEvent.offsetY);
            canvas.lineTo(e.offsetX, e.offsetY);
            canvas.lineWidth = lineWidth;
            canvas.strokeStyle = tools[tool].color;
            canvas.lineCap = 'round';
            canvas.stroke();

            lastEvent = e;
        }
    }).mouseup(function () {
        mouseDown = false;
    });

    //eraser button
    $('#wb-eraser').click(function () {
        tool = tools.eraser;
    });

    //marker button
    $('#wb-marker').click(function () {
        tool = tools.marker;
    });

    //clear button
    $('#wb-clear').click(function () {
        canvas.clearRect(0, 0, 800, 400);
    });

    //marker width
    $("#wb-line-width").change(function () {
        lineWidth = $(this).val();
    });
});