/*jshint asi: true, browser: true, curly: true, eqeqeq: true, forin: false, immed: false, newcap: true, noempty: true, strict: true, undef: true */
/*global jQuery: false */
(function($, undefined) {
'use strict';
$.fn.infograph = function(option) {
    console.log(this)
    return this.each(function() {
        //verify options
        var $this = $(this),
            options = option || {},
            square = ($this.width() >= $this.height()) ? $this.width() : $this.height();
            console.log('$this.height() : ' + $this.height() + ' $this.width() : ' + $this.width());

        // set options to defaults
        var opts = $.fn.infograph.opts = $.extend(
            true, {
                width: square,
                height: square,
                itemSelector: '.user',
                keySelector: '.name',
                clickFn: $.noop
        }, options);

        console.log(opts);         
        // initial
        var raw = $this.find(opts.itemSelector).hide(),
            percent = _summarizeData(raw, opts);
        // console.log(percent);

        var $display = $('<div class="display">')
                            .width(opts.width)
                            .height(opts.height)
                            .css({
                                'background-color' : 'grey'
                            })
                            .appendTo(this);
        // end initial

        // Create graphic
        _createChart(opts, percent, $display);
    });
};

var _createChart = function(opts, obj, target) {
    console.log("_createChart");

    // sort and change to array
    obj = _obj2array(obj);

    // initial
    var allArea = opts.width * opts.height,
        group = obj.length,
        zIndex = $.fn.infograph.zIndex = 100 + group,
        i = 0,
        color = $.fn.infograph.color = ['red', 'green', 'blue', 'pink'],
        sumArea = 0;

    $.each(obj, function(k, v) {
        console.log(v[0] + ' : ' + v[1] + '%');
    });

    // check condition and generate elements
    var drawable = [];
    if(_checkEqual(obj)) {
        if(isPerfectSquare(group)) {
            // goto WH type
            drawable = _formulate('WH', obj);
        }
        else {
            // goto W type
            drawable = _formulate('W', obj);
        }
    }
    else {
        // goto SQ type
        drawable = _formulate('SQ', obj);
    }

    // Draw
    $.each(drawable, function(k, v) {
        $.extend(v, { 'clickFn': opts.clickFn });
        // console.log(v);
        _createSquare(v, target);
    });      

    console.log('allArea : ' + allArea);
    console.log('amout of group & max z-index (100): ' + zIndex);
    console.log('check equal : ' + _checkEqual(obj));
};

var _formulate = function(type, obj) {
    console.log('type : ' + type);
    var i = 0,
        result = [],
        elem = {},
        percent = 0, 
        width, height, top, left, row = 0, col = 0, side,
        allArea = $.fn.infograph.opts.width * $.fn.infograph.opts.height;

    if(type === "WH") {
        side = Math.sqrt(obj.length);
    }

    $.each(obj, function(k, v) {
        percent = percent + v[1];
        switch (type) {
            case 'SQ':
                width = height = _calculateSquarePixels((parseInt(percent, 10)*allArea)/100);
            break
            case 'W':
                width = ($.fn.infograph.opts.width * percent)/100;
                height = $.fn.infograph.opts.height;
            break
            case 'WH':
                width = height = _calculateSquarePixels((parseInt(v[1], 10)*allArea)/100);
                top = row * height;
                left = col * width;
                if(++col % side === 0) { row += 1; col = 0; }
            break
        }
        result.push({
            'id': v[0],
            'percent': v[1],
            'width': width,
            'height': height,
            'background-color': $.fn.infograph.color[(i++) % $.fn.infograph.color.length],
            'position': 'absolute',
            'z-index': $.fn.infograph.zIndex--,
            'margin-top': top !== "" ? top : "",
            'margin-left': left !== "" ? left : ""
        });
    });
    // console.log(result);
    return result;
};

var isPerfectSquare = function(n) {
    var h = n & 0xF; // h is the last hex "digit"
    if (h > 9)
        return false;
    // Use lazy evaluation to jump out of the if statement as soon as possible
    if (h != 2 && h != 3 && h != 5 && h != 6 && h != 7 && h != 8) {
        var t = Math.floor( Math.sqrt(n) + 0.5 );
        return t*t == n;
    }
    return false;
};

var _checkEqual = function(obj) {
    var buffer = 0, equal = true;
    $.each(obj, function(k, v) {
        if(buffer === 0) { buffer = v[1]; }
        else if(buffer !== v[1]) { equal = false; }
    });
    return equal;
};

var _createSquare = function(square, target) {
    $('<div id="' + square.id + '"><span class="percent">'+ square.percent +'%</span></div>')
        .css(square)
        .on('click', square.clickFn )
        .attr('title', 'Value ' + square.id + ' is ' + square.percent + '% of 100%')
        .appendTo(target);
};

var _calculateSquarePixels = function(area) {
    if(typeof area === 'number') { return Math.sqrt(area); }
    if(typeof area === 'string') { return Math.sqrt(parseFloat(area, 10)); }
    return -1;
};

var _obj2array = function(obj) {
    var sortable = [];
    $.each(obj, function(k, v){
        sortable.push([k, v]);
    });
    return sortable.sort(function(a, b) { return a[1] - b[1]; });
};

var _summarizeData = function (dataArray, opts){
    var result = {}, all = dataArray.length;

    $.each(dataArray, function(k, v) {
        v = $(v).find(opts.keySelector)[0].innerHTML;
        if(typeof result[v] === 'undefined') { result[v] = 0; }
        result[v] = result[v] + 1;
    });

    // return in percent
    $.each(result, function(k, v){
        result[k] = Math.round((v * 100)/all);
    });

    return result;
};

}(jQuery));