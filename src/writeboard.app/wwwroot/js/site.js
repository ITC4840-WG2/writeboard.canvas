var tools = {};
$(function () {
    //show registration when no key is set
    if (wbKey == '') {
        $('#wb-register').css('display', 'block');
        $('#wb-modal-close').hide();
    }
    else {
        $('#wb-capture').prop('disabled', false);
        $('#wb-modal-close').show();
    }

    //tool init options
    tools = {
        text: {
            toolName: 'text',
            font: '14px sans-serif'
        },
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
    mapContext.webkitImageSmoothingEnabled = false;
    mapContext.mozImageSmoothingEnabled = false;
    mapContext.imageSmoothingEnabled = false;
    drawMap(canvas, mapContext, 240, 135);
    function drawMap(canvas, mapContext, width, height) {
        var image = new Image();
        mapContext.clearRect(0, 0, width, height);
        image.onload = function () {
            mapContext.drawImage(image, 0, 0, wbWidth, wbHeight, 0, 0, width, height);
        };
        image.src = canvas.toDataURL();
    }
   
    //canvas interaction events
    var lastEvent;
    var hasInput = false;
    var mouseDown = false;
    var mouseDownY = 0;
    $('#wb-canvas').on({
        mousedown: function (e) {
            mouseDown = true;
            mouseDownY = e.pageY;

            //set tool specific options
            $.extend(context, tools.selectedTool);

            if (tools.selectedTool.toolName === 'text' && !hasInput) {
                //add input
                var input = document.createElement('input');

                input.type = 'text';
                input.style.position = 'fixed';
                input.style.left = (e.clientX - 4) + 'px';
                input.style.top = (e.clientY - 4) + 'px';

                //draw text on enter key
                input.onkeydown = function (e) {
                    var keyCode = e.keyCode;
                    if (keyCode === 13) {
                        drawText(input.value, parseInt(this.style.left, 10), parseInt(this.style.top, 10));

                        document.body.removeChild(this);
                        hasInput = false;
                    }
                }

                function drawText(txt, txtX, txtY) {
                    context.textBaseline = 'top';
                    context.textAlign = 'left';
                    context.font = '14px sans-serif';
                    context.fillText(txt, txtX - 4, txtY - 4);
                }

                document.body.appendChild(input);
                input.focus();

                hasInput = true;
            }

            lastEvent = e;
        },
        mousemove: function (e) {
            if (mouseDown && tools.selectedTool.toolName !== 'scroll' && tools.selectedTool.toolName !== 'text') {
                context.beginPath();
                context.moveTo(lastEvent.offsetX, lastEvent.offsetY);
                context.lineTo(e.offsetX, e.offsetY);

                //execute event
                context.stroke();
                lastEvent = e;
            }
            else if (mouseDown && tools.selectedTool.toolName === 'scroll' && tools.selectedTool.toolName !== 'text') {
                $(window).scrollTop($(window).scrollTop() + (mouseDownY - e.pageY));
            }
        },
        mouseup: function (e) {
            drawMap(canvas, mapContext, 240, 135);
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

    //load canvas state
    wbState = $('#wb-state').val();
    if (wbState) {
        var state = new Image();
        state.src = '';
        state.onload = function () {
            context.drawImage(state, 0, 0, wbWidth, wbHeight);
            mapContext.drawImage(state, 0, 0, 240, 135);
        };
        state.src = wbState;
    }

    //save writeboard state
    $('#wb-save').click(function (e) {
        e.preventDefault();

        //set new writeboard state
        wbState = canvas.toDataURL("image/png");

        //send state to server
        $.ajax({
            type: 'POST',
            cache: false,
            url: '/save',
            data: { 'wb-key': wbKey, 'wb-state': wbState },
            success: function () {
                alert('WriteBoard State Saved Succesfully!');
            }
        });
    });

    //image capture
    $('#wb-capture').hide();
    $('#wb-capture').prop('disabled', true);
    $('#wb-capture').css('top', $('#wb-cam').position().top);
    $('#wb-capture').css('left', $('#wb-cam').position().left - 10);
    $(window).resize(function () {
        $('#wb-capture').css('top', $('#wb-cam').position().top);
        $('#wb-capture').css('left', $('#wb-cam').position().left - 10);
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
            overlayCapture(this, context, wbWidth, wbHeight);
        }
    });
    function overlayCapture(capture, context, width, height) {
        context.drawImage(capture, 0, 0, width, height);
        setTimeout(overlayCapture, 10, cam, context, width, height);
    }

    //scroll button
    $('#wb-scroll').click(function () {
        tools.selectedTool = tools.scroll;
        $('.wb-tool').removeClass('active');
        $(this).addClass('active');
        $('html').css({
            overflow: 'auto',
            height: 'auto',
            width: 'auto'
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
        $('.wb-tool').removeClass('active');
        $(this).addClass('active');
        disableScrolling();
    });

    //text input button
    $('#wb-text').click(function (e) {
        e.preventDefault();
        tools.selectedTool = tools.text;
        $('.wb-tool').removeClass('active');
        $(this).addClass('active');
        disableScrolling();
    });

    //marker button
    $('#wb-marker').click(function (e) {
        e.preventDefault();
        tools.selectedTool = tools.marker;
        $('.wb-tool').removeClass('active');
        $(this).addClass('active');
        disableScrolling();
    });
    
    //clear button
    $('#wb-clear').click(function (e) {
        e.preventDefault();
        context.clearRect(0, 0, wbWidth, wbHeight);
        drawMap(canvas, mapContext, 240, 135);
        disableScrolling();
    });

    //lock canvas scrolling
    function disableScrolling() {
        $('#wb-canvas').css('cursor', 'crosshair');

        $('html').css({
            overflow: 'hidden',
            height: '100%',
            width: '100%'
        });
    }
});