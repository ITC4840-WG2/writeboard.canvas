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
    var canvas = $('#wb-canvas')[0];
    var context = canvas.getContext('2d');

    //mini map
    var map = $('#wb-map')[0];
    var mapContext = map.getContext('2d');
    //drawMap(canvas, mapContext, 1920, 1080);

    //function drawMap(canvas, mapContext, width, height) {
    //    var image = new Image();
    //    image.src = canvas.toDataURL();
    //    mapContext.drawImage(image, 0, 0, width, height);

    //    setTimeout(drawMap, 10, canvas, mapContext, width, height);
    //}

    //drawing events
    var lastEvent;
    var mouseDown = false;
    $('#wb-canvas').mousedown(function (e) {
        lastEvent = e;
        mouseDown = true;
    }).mousemove(function (e) {
        if (mouseDown) {
            context.beginPath();
            context.globalCompositeOperation = tool.globalCompositeOperation;
            context.moveTo(lastEvent.offsetX, lastEvent.offsetY);
            context.lineTo(e.offsetX, e.offsetY);
            context.lineWidth = lineWidth;
            context.strokeStyle = tools[tool].color;
            context.lineCap = 'round';
            context.stroke();

            lastEvent = e;
        }
    }).mouseup(function () {
        mouseDown = false;
    });

    //whiteboard capture
    $('#wb-capture').css('top', $('#wb-cam').position().top);
    $('#wb-capture').css('left', $('#wb-cam').position().left);
    $(window).resize(function () {
        $('#wb-capture').css('top', $('#wb-cam').position().top);
        $('#wb-capture').css('left', $('#wb-cam').position().left);
    });
    var cam = $('#wb-cam')[0];
    $('#wb-capture').click(function () {
        
        $('#wb-cam').data('enabled', 'true');
        $('#wb-map').attr('visibility', 'hidden');
        $('#wb-cam').attr('visibility', 'visible');
        $('#wb-capture').html('<i class="fa fa-close"></i>');

        //$('#wb-cam').data('enabled', 'false');
        //$('#wb-map').attr('visibility', 'visible');
        //$('#wb-cam').attr('visibility', 'hidden');
        //$('#wb-capture').html('<i class="fa fa-camera"></i>');

        var videoURL = window.URL || window.webkitURL;

        navigator.getMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;
        navigator.getMedia({
            video: true,
            audio: false
        }, function (stream) {
            cam.src = videoURL.createObjectURL(stream);
            cam.play();
        }, function (error) {
            alert("WriteBoard Camera Error");
        });
    });
    
    //overlay image on canvas and map live
    cam.addEventListener('play', function () {
        //overlayCapture(this, context, 1920, 1080);
    });

    function overlayCapture(capture, context, width, height) {
        context.drawImage(capture, 0, 0, width, height);

        setTimeout(overlayCapture, 10, cam, context, width, height);
    }

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
        context.clearRect(0, 0, 1920, 1080);
    });

    //marker width
    $("#wb-line-width").change(function () {
        lineWidth = $(this).val();
    });
});