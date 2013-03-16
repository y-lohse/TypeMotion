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
		
		console.log(lineBreaks);
	});
});