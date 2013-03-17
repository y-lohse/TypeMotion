$(function(){
	//setup
	//wrapping every word inside paragraphs inside spans
	$('p').each(function(){
		$(this).html('<span>'+$(this).text().split(' ').join('</span> <span>')+'</span>');
	});
	
	var tooltipFollow = function(event){
		$('#tm-tooltip').css({top: event.pageY+5, left: event.pageX+5});
	};
	
	//calculating teh measure
	$('p').hover(function(event){
		$('#tm-tooltip').show();
		$(this).on('mousemove', tooltipFollow);
		
		//finding out where the line break
		var text = $(this).text(),
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
				lines.push(lineText);
				lineText = this.textContent+' ';
				currentBreak++;
			}
		});
		
		//computing measures
		var measures = [];
		for (var i = 0, l = lines.length; i < l; i++){
			measures.push(lines[i].length);
		}
		
		console.log(measures);
	}, function(){
		$('#tm-tooltip').hide();
		$(this).off('mousemove', tooltipFollow);
	});
});