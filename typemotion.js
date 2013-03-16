$(function(){
	//setup
	//wrapping every word inside paragraphs inside spans
	$('p').each(function(){
		$(this).html('<span>'+$(this).text().split(' ').join('</span> <span>')+'</span>');
	});
});