var tools = {};
$(function () {
    //tool init options
    tools = {
        marker: {
            toolName: 'marker',
            strokeStyle: $('#wb-color-picker').val(),
            globalCompositeOperation: 'source-over',
            lineCap: 'round',
            lineWidth: 1
        },
        eraser: {
            toolName: 'eraser',
            strokeStyle: 'rgba(0,0,0,1.0)',
            globalCompositeOperation: 'destination-out',
            lineCap: 'square',
            lineWidth: 10
        },
        scroll: {
            toolName: 'scroll'
        }
    };
    tools.selectedTool = tools.marker;
    disableScrolling();

    //color picker
    $('#wb-color-picker').colorPicker({
        renderCallback: function (e, toggled) {
            tools.marker.strokeStyle = '#' + this.color.colors.HEX;
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

    //load canvas state
    if (wbState) {
        var image = new Image();
        image.onload = function () {
            context.drawImage(image, 0, 0);
            mapContext.drawImage(image, 0, 0);
        };
        image.src = wbState;
    }
   
    //canvas interaction events
    var lastEvent;
    var mouseDown = false;
    var mouseDownY = 0;
    $('#wb-canvas').on({
        mousedown: function (e) {
            mouseDown = true;
            mouseDownY = e.pageY;
            lastEvent = e;
        },
        mousemove: function (e) {
            if (mouseDown && tools.selectedTool.toolName !== 'scroll') {
                context.beginPath();
                context.moveTo(lastEvent.offsetX, lastEvent.offsetY);
                context.lineTo(e.offsetX, e.offsetY);

                //tool specific options
                context.globalCompositeOperation = tools.selectedTool.globalCompositeOperation;
                context.lineWidth = tools.selectedTool.lineWidth;
                context.strokeStyle = tools.selectedTool.strokeStyle;
                context.lineCap = tools.selectedTool.lineCap;

                //execute event
                context.stroke();
                lastEvent = e;
            }
            else if (mouseDown && tools.selectedTool.toolName === 'scroll') {
                $(window).scrollTop($(window).scrollTop() + (mouseDownY - e.pageY));
            }
        },
        mouseup: function (e) {
            mouseDown = false;
        },
        touchstart: function (e) {
            e.preventDefault();
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            canvas.dispatchEvent(new MouseEvent('mousedown', {
                pageY: touch.pageY
            }));
        },
        touchmove: function (e) {
            e.preventDefault();
            var elm = $(this).offset();
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            canvas.dispatchEvent(new MouseEvent('mousemove', {
                offsetX: touch.pageX - elm.left,
                offsetY: touch.pageY - elm.top,
                pageY: touch.pageY
            }));
        },
        touchend: function (e) {
            e.preventDefault();
            canvas.dispatchEvent(new MouseEvent('mouseup'));
        }
    });

    //new writeboard
    $('#wb-new').click(function (e) {
        e.preventDefault();
    });

    //save writeboard state
    $('#wb-save').click(function (e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: '/save',
            data: { 'wb-key': wbKey, 'wb-state': canvas.toDataURL() },
            success: function () {
                alert('WriteBoard State Saved Succesfully!');
            }
        });
    });

    //image capture
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
    $(cam).on({
        play: function (e) {
            overlayCapture(this, context, 1920, 1080);
        }
    });
    function overlayCapture(capture, context, width, height) {
        context.drawImage(capture, 0, 0, width, height);
        setTimeout(overlayCapture, 10, cam, context, width, height);
    }

    //scroll button
    $('#wb-scroll').click(function () {
        tools.selectedTool = tools.scroll;
        $('html, body').css({
            overflow: 'auto',
            height: 'auto'
        });
        $('#wb-canvas').css('cursor', 'move');
    });

    //marker width
    $("#wb-line-width").change(function (e) {
        e.preventDefault();
        tools.marker.lineWidth = $(this).val();
    });

    //eraser button
    $('#wb-eraser').click(function (e) {
        e.preventDefault();
        tools.selectedTool = tools.eraser;
        disableScrolling();
    });

    //marker button
    $('#wb-marker').click(function (e) {
        e.preventDefault();
        tools.selectedTool = tools.marker;
        disableScrolling();
    });
    
    //clear button
    $('#wb-clear').click(function (e) {
        e.preventDefault();
        context.clearRect(0, 0, 1920, 1080);
        disableScrolling();
    });

    //lock canvas scrolling
    function disableScrolling() {
        $('#wb-canvas').css('cursor', 'crosshair');

        $('html, body').css({
            overflow: 'hidden',
            height: '100%'
        });
    }
});