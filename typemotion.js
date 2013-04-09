$(function(){
	//setup
	var $collection = $('p'),
		adjusterActive = false,
		adjusterElement = null,
		dragOffset = {top: 0, left: 0};
	
	var commonStyles = {
		'position': 'absolute',
		'background': '#242424',
		'border': '2px solid #c7c7c7',
		'border-radius': '10px',
		'padding': '10px 15px',
		'color': '#fff',
		'font-size': '18px',
		'font-family': 'tahoma',
	};
	var h1Styles = {
		'font-weight': 'normal',
		'font-size': '26px',
		'margin': '0 0 10px',
		'cursor': 'move',
		'display': 'inline-block'
	};
	var closerStyles = {
		'display': 'inline-block',
		'margin-left': '35px',
		'cursor': 'pointer'	
	};
	var h2Styles = {
		'font-size': '18px',
		'font-weight': 'normal',
		'text-transform': 'uppercase',
		'padding': 0,
		'margin-top': '25px',
		'margin-bottom': '5px'
	};
	var listStyles = {
		'padding': 0,
		'margin': 0,
		'list-style': 'none'
	};
	var inputStyles = {
		'width': '70px',
		'text-align': 'right',
		'margin-left': '20px',
		'margin-right': '5px',
		'padding': '2px 4px',
		'background': 'rgba(255,255,255,.8)',
		'border': '1px solid #ddd',
		'border-radius': '4px'
	};
	
	//creating tooltip
	var $tooltip = $('<div>');
	$tooltip.css($.extend({}, commonStyles, {'text-align': 'center'}));
	$tooltip.hide();
	
	//creating motion adjuster
	var $adjuster = $('<div>');
	$adjuster.css(commonStyles);
	var $h1 = $('<h1>').html('TypeMotion').css(h1Styles);
	var $closer = $('<div>').html('[close]').css(closerStyles);
	var $measureTitle = $('<h2>').html('Measure').css($.extend({}, h2Styles, {'margin-top': 0}));
	var $rythmTitle = $('<h2>').html('Vertical Rythm').css(h2Styles);
	$adjuster.append($h1).append($closer).append($measureTitle);
	
	var $liBase = $('<li>').css({'margin-bottom': '3px'});
	
	var $measureList = $('<ul>').css(listStyles);
	$measureList.append($liBase.clone().html('Average : <span class="tm-average"></span>'));
	$measureList.append($liBase.clone().html('Minimum : <span class="tm-min"></span>'));
	$measureList.append($liBase.clone().html('Maximum : <span class="tm-max"></span>'));
	$measureList.append($liBase.clone().html('Total signs : <span class="tm-signs"></span>'));
	$adjuster.append($measureList);
	
	var $rythmList = $('<ul>').css(listStyles);
	$rythmList.append($liBase.clone().html('Font size : <input id="tm-fontsize" data-prop="font-size" type="number" />px'));
	$rythmList.append($liBase.clone().html('Line height : <input id="tm-lineheight" data-prop="line-height" type="number" />px'));
	$adjuster.append($rythmTitle);
	$adjuster.append($rythmList);
	
	$adjuster.hide();
	
	var $exitButton = $('<div>');
	$exitButton.css($.extend({}, commonStyles, {top: 10, right: 10, cursor: 'pointer', 'text-align': 'center'}));
	$exitButton.html('Exit TypeMotion');
	
	$('body').append($tooltip).append($exitButton).append($adjuster);
	
	//live editinginputs
	var $inputs = $('#tm-fontsize, #tm-lineheight');
	$inputs.css(inputStyles);
	
	//wrapping every word inside paragraphs inside spans
	$collection.each(function(){
		$(this).html('<span class="tm">'+$(this).html().split(' ').join('</span> <span class="tm">')+'</span>');
	});
	
	//core function for measure calculation
	var getMeasures = function(){
		var $this = $(this);
		
		//this keyword refers to the html element
		//finding out where the lines break
		var text = escape($this.text()),
			$spans = $this.find('span'),
			prevOffset = $spans.first().offset().top,
			lineBreaks = [];
		
		$spans.each(function(index){
			var currentOffset = $(this).offset().top;
			if (currentOffset != prevOffset){
				prevOffset = currentOffset;
				lineBreaks.push(index);
			}
		});
		
		//retrieving the actual lines of text
		var lines = [];
		var currentBreak = 0;
		var lineText = '';
		
		$spans.each(function(index){
			if (index < lineBreaks[currentBreak]){
				lineText += this.textContent+' ';
			}
			else if (currentBreak >= lineBreaks.length){
				//the last line is ignored as it will probably be way shorter
				//than the rest and thus screw up the stats
				return false;
			}
			else {
				//removing trailing space and any tabs or new lines
				lines.push(lineText.substring(0, lineText.length-1).replace(/(\t|\n)/g, ''));
				lineText = (this.innerText || this.textContent)+' ';
				currentBreak++;
			}
		});
		
		//computing measures
		var measures = [];
		for (var i = 0, l = lines.length; i < l; i++){
			measures.push(lines[i].length);
		}
		
		//computing the actual usefull informations
		var sum = 0;
		for (var i = 0, l = measures.length; i < l; i++) sum += measures[i];
		var min = Math.min.apply(null, measures);
		var max = Math.max.apply(null, measures);
		
		return {
			measures: measures,
			lines: measures.length,
			average: (sum/measures.length).toPrecision(4),
			min: min,
			max: max,
			sum: sum
		};
	}; 
	
	//event handlers that need to be unregistered at some point
	var tooltipFollow = function(event){
		$tooltip.css({top: event.pageY+5, left: event.pageX+5});
	};
	
	var adjusterDrag = function(event){
		$adjuster.css({top: event.pageY-dragOffset.top, left: event.pageX-dragOffset.left});
	}
	
	//Adjuster behavior
	$h1.mousedown(function(event){
		var adjusterOffset = $adjuster.offset();
		dragOffset.top = event.pageY-adjusterOffset.top;
		dragOffset.left = event.pageX-adjusterOffset.left;
		$(document).on('mousemove', adjusterDrag);
	}).mouseup(function(){
		$(document).off('mousemove', adjusterDrag);
	});
	
	//tooltip handling
	$collection.hover(function(event){
		if (adjusterActive) return;
		
		//show the toolip
		$tooltip.show();
		$(this).on('mousemove', tooltipFollow);
		
		var measures = getMeasures.apply(this);
		
		//populating the tooltip
		var text = 'average: '+measures.average+
					'<br />'+
					'min: '+measures.min+
					' — '+
					'max: '+measures.max;
		$tooltip.html(text);
	}, function(){
		$tooltip.hide();
		$(this).off('mousemove', tooltipFollow);
	});
	
	//firing up the adjutment tool
	$collection.click(function(event){
		if (adjusterElement != this){
			var $this = $(this);
			
			//move adjuster next to the focused element
			$adjuster.show();
			$adjuster.css({top: $this.offset().top, left: $this.offset().left+$this.width()});
			
			//activating adjuster and hiding tooltip
			adjusterActive = true;
			adjusterElement = this;
			$tooltip.hide();
			$(this).off('mousemove', tooltipFollow);
			
			populateAdjuster(this);
		}
	});
	
	//changes to properties
	$inputs.on('input', function(){
		var prop = this.getAttribute('data-prop');
		$(adjusterElement).css(prop, parseInt(this.value)+'px');
		
		populateAdjuster(adjusterElement);
	});
	
	//closing adjuster
	$closer.click(function(){
		adjusterElement = null;
		adjusterActive = false;
		$adjuster.hide();
	});
	
	//populating adjuster with informations
	var populateAdjuster = function(element){
		var measures = getMeasures.apply(element);
		$adjuster.find('span.tm-average').html(measures.average);
		$adjuster.find('span.tm-min').html(measures.min);
		$adjuster.find('span.tm-max').html(measures.max);
		
		$inputs.each(function(){
			this.value = parseInt($(element).css(this.getAttribute('data-prop')));
		});
	};
	
	//shutting down
	var cleanup = function(){
		//removing all created spans
		$('span.tm').each(function(){
			$(this.childNodes).unwrap();
		});
		
		//cleaning event listeners
		$collection.unbind('mouseenter mouseleave click');
		$(document).unbind('keyup');
		
		//deleting UI
		$tooltip.remove();
		$adjuster.remove();
		$exitButton.remove();
	};
	
	$exitButton.click(cleanup);
	$(document).keyup(function(event){
		if (event.which == 27) cleanup();
	});
});