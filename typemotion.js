$(function(){
	//setup
	var $collection = $('p');
	
	var commonStyles = {
		position: 'absolute',
		background: '#242424',
		border: '2px solid #c7c7c7',
		'border-radius': '10px',
		padding: '10px 15px',
		'text-align': 'center',
		color: '#fff',
		'font-size': '18px'
	};
	var $tooltip = $('<div>');
	$tooltip.css(commonStyles);
	$tooltip.hide();
	
	
	var $exitButton = $('<div>');
	$exitButton.css($.extend({}, commonStyles, {top: 10, right: 10, cursor: 'pointer'}));
	$exitButton.html('Exit TypeMotion');
	
	$('body').append($tooltip).append($exitButton);
	
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
		alert('cleaning');
	};
	
	$exitButton.click(cleanup);
	$(document).keyup(function(event){
		if (event.which == 27) cleanup();
	});
});