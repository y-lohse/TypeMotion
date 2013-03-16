$(function(){
	//setup
	//wrapping every word inside paragraphs inside spans
	$('p').each(function(){
		$(this).html('<span>'+$(this).text().split(' ').join('</span> <span>')+'</span>');
	});
	
	//calculating teh measure
	$('p').click(function(){
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
			if (index < lineBreaks[currentBreak] || currentBreak >= lineBreaks.length){
				lineText += this.textContent+' ';
			}
			else {
				lines.push(lineText);
				lineText = this.textContent+' ';
				currentBreak++;
			}
		});
		lines.push(lineText);
		
		console.log(lines);
	});
});