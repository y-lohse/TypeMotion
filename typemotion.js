$(function(){
	//setup
	var $collection = $('p');
	
	var commonStyles = {
		position: 'absolute',
		background: '#242424',
		border: '2px solid #c7c7c7',
		'border-radius': '10px',
		padding: '10px 15px',
		color: '#fff',
		'font-size': '18px',
		'font-family': 'tahoma',
	};
	var h1Styles = {
		'font-weight': 'normal',
		'font-size': '26px',
		'margin': '0 0 10px',
		'cursor': 'move'
	};
	var h2Styles = {
		'font-size': '18px',
		'font-weight': 'normal',
		'text-transform': 'uppercase',
		'padding': 0,
		'margin-top': '25px',
		'margin-bottom': '5px'
	};
	
	//creating tooltip
	var $tooltip = $('<div>');
	$tooltip.css($.extend({}, commonStyles, {'text-align': 'center'}));
	$tooltip.hide();
	
	//creating motion adjuster
	var $adjuster = $('<div>');
	$adjuster.css(commonStyles);
	var $h1 = $('<h1>').html('TypeMotion').css(h1Styles);
	var $measureTitle = $('<h2>').html('Measure').css($.extend({}, h2Styles, {'margin-top': 0}));
	var $rythmTitle = $('<h2>').html('Vertical Rythm').css(h2Styles);
	$adjuster.append($h1).append($measureTitle);
	
	var $measureList = $('<ul>');
	var $liBase = $('<li>');
	$measureList.append($liBase.clone().html('Average : <span></span>'));
	$measureList.append($liBase.clone().html('Minimum : <span></span>'));
	$measureList.append($liBase.clone().html('Maximum : <span></span>'));
	$measureList.append($liBase.clone().html('Total signs : <span></span>'));
	$adjuster.append($measureList);
	
	var $rythmList = $('<ul>');
	$rythmList.append($liBase.clone().html('Font size :'));
	$rythmList.append($liBase.clone().html('Line height :'));
	$adjuster.append($rythmTitle);
	$adjuster.append($rythmList);
	
	
	//$adjuster.hide();
	
	
	var $exitButton = $('<div>');
	$exitButton.css($.extend({}, commonStyles, {top: 10, right: 10, cursor: 'pointer', 'text-align': 'center'}));
	$exitButton.html('Exit TypeMotion');
	
	$('body').append($tooltip).append($exitButton).append($adjuster);
	
	//wrapping every word inside paragraphs inside spans
	$collection.each(function(){
		$(this).html('<span class="tm">'+$(this).html().split(' ').join('</span> <span class="tm">')+'</span>');
	});
	
	var tooltipFollow = function(event){
		$tooltip.css({top: event.pageY+5, left: event.pageX+5});
	};
	
	//calculating teh measure
	$collection.hover(function(event){
		//show the toolip
		$tooltip.show();
		$(this).on('mousemove', tooltipFollow);
		
		//finding out where the lines break
		var text = escape($(this).text()),
			$spans = $(this).find('span'),
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
		
		//populating the tooltip
		var sum = 0;
		for (var i = 0, l = measures.length; i < l; i++) sum += measures[i];
		
		var text = 'average: '+(sum/measures.length).toPrecision(4)+
					'<br />'+
					'min: '+Math.min.apply(null, measures)+
					' — '+
					'max: '+Math.max.apply(null, measures);
		$tooltip.html(text);
	}, function(){
		$tooltip.hide();
		$(this).off('mousemove', tooltipFollow);
	});
	
	//shutting down
	var cleanup = function(){
		//removing all created spans
		$('span.tm').each(function(){
			$(this.childNodes).unwrap();
		});
		
		//cleaning event listeners
		$collection.unbind('mouseenter mosueleave');
		$(document).unbind('keyup');
		
		//deleting UI
		$tooltip.remove();
		$exitButton.remove();
	};
	
	$exitButton.click(cleanup);
	$(document).keyup(function(event){
		if (event.which == 27) cleanup();
	});
});