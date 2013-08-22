$(function(){
	//setup
	var $collection = $('p'),
		adjusterActive = false,
		adjusterElement = null,
		dragOffset = {top: 0, left: 0};
	
	var commonStyles = {
		'position': 'absolute',
		'margin': 0,
		padding: '10px',
		'background': '#242424',
		'border': '2px solid #c7c7c7',
		'border-radius': '10px',
		'padding': '10px 15px',
		'color': '#fff',
		'font-size': '18px',
		'font-family': 'tahoma'
	};
	var h1Styles = {
		'font-weight': 'normal',
		'font-size': '26px',
		'margin': '0 0 10px',
		'cursor': 'move',
		'display': 'inline-block'
	};
	var h2Styles = {
		'font-size': '18px',
		'font-weight': 'normal',
		'padding': 0,
		'margin-top': '25px',
		'margin-bottom': '5px'
	};
	var listStyles = {
		'padding': 0,
		'margin': 0,
		'list-style': 'none',
		'font-size': '15px'
	};
	var inputStyles = {
		'width': '70px',
		'text-align': 'right',
		'margin-left': '20px',
		'margin-right': '5px',
		'padding': '6px 4px',
		'color': '#fff',
		'background': 'rgba(0,0,0,.8)',
		'border': '1px solid #222',
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
	var $measureTitle = $('<h2>').html('Measure').css($.extend({}, h2Styles, {'margin-top': 0}));
	var $rythmTitle = $('<h2>').html('Vertical Rythm').css(h2Styles);
	$adjuster.append($h1).append($measureTitle);
	
	var $liBase = $('<li>').css({'margin-bottom': '3px'});
	
	var $measureList = $('<ul>').css(listStyles);
	$measureList.append($liBase.clone().html('<label>Average :</label> <span class="tm-average"></span>'));
	$measureList.append($liBase.clone().html('<label>Minimum :</label> <span class="tm-min"></span>'));
	$measureList.append($liBase.clone().html('<label>Maximum :</label> <span class="tm-max"></span>'));
	$measureList.append($liBase.clone().html('<label>Total signs :</label> <span class="tm-signs"></span>'));
	$adjuster.append($measureList);
	
	var $rythmList = $('<ul>').css(listStyles);
	$rythmList.append($liBase.clone().html('<label for="tm-fontsize">Font size :</label><input id="tm-fontsize" data-prop="font-size" type="text" />'));
	$rythmList.append($liBase.clone().html('<label for="tm-lineheight">Line height :</label><input id="tm-lineheight" data-prop="line-height" type="text" />'));
	$adjuster.append($rythmTitle);
	$adjuster.append($rythmList);
	
	$adjuster.find('label').css({'min-width': '100px', 'display': 'inline-block'});
	
	$adjuster.hide();
	
	var $exitButton = $('<div>');
	$exitButton.css($.extend({}, commonStyles, {'position': 'fixed', top: 10, right: 10, cursor: 'pointer', 'text-align': 'center'}));
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
		var totalSigns = 0;
		for (var i = 0, l = lines.length; i < l; i++){
			measures.push(lines[i].length);
			totalSigns += lines[i].length;
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
			sum: sum,
			signs: totalSigns
		};
	};
	
	var getMatchedStyle = function(elem, property){
		// element property has highest priority
		var val = elem.style.getPropertyValue(property);
	
		// if it's important, we are done
		if(elem.style.getPropertyPriority(property))
			return val;
	
		// get matched rules
		var rules = getMatchedCSSRules(elem);
	
		// iterate the rules backwards
		// rules are ordered by priority, highest last
		for(var i = rules.length; i --> 0;){
			var r = rules[i];
	
			var important = r.style.getPropertyPriority(property);
	
			// if set, only reset if important
			if(val == null || important){
				val = r.style.getPropertyValue(property);
	
				// done if important
				if(important)
					break;
			}
		}
	
		return val || $(elem).css(property);
	};
	
	//populating adjuster with informations
	var populateAdjuster = function(element){
		var measures = getMeasures.apply(element);
		$adjuster.find('span.tm-average').html(measures.average);
		$adjuster.find('span.tm-min').html(measures.min);
		$adjuster.find('span.tm-max').html(measures.max);
		$adjuster.find('span.tm-signs').html(measures.signs);
		
		$('#tm-fontsize').val(getMatchedStyle(element, 'font-size'));
		$('#tm-lineheight').val(getMatchedStyle(element, 'line-height'));
	};
	
	//event handlers that need to be unregistered at some point
	var tooltipFollow = function(event){
		$tooltip.css({top: event.pageY+5, left: event.pageX+5});
	};
	
	var adjusterDrag = function(event){
		$adjuster.css({top: event.pageY-dragOffset.top, left: event.pageX-dragOffset.left});
	}
	
	//tooltip handling
	var collectionOver = function(event){
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
	};
	
	var collectionOut = function(event){
		$tooltip.hide();
		$(this).off('mousemove', tooltipFollow);
	};
	
	//firing up the adjutment tool
	var collectionClick = function(event){
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
			
			event.stopPropagation();
		}
	};
	
	//Adjuster behavior
	$h1.mousedown(function(event){
		var adjusterOffset = $adjuster.offset();
		dragOffset.top = event.pageY-adjusterOffset.top;
		dragOffset.left = event.pageX-adjusterOffset.left;
		$(document).on('mousemove', adjusterDrag);
	}).mouseup(function(){
		$(document).off('mousemove', adjusterDrag);
	});
	
	//changes to properties
	$inputs.on('blur', function(){
		var match = this.value.match(/(\d(\.)?)+/g);
		if (match && this.value.substring(0, match[0].length).match(/\.$/)) return;
		
		$(adjusterElement).css(this.getAttribute('data-prop'), this.value);
		populateAdjuster(adjusterElement);
	}).on('keydown', function(event){
		if ((event.which === 40 || event.which === 38) && this.value.match(/\d+/g)){
			var match = this.value.match(/(\d(\.)?)+/g)[0],
				num = this.value.substring(0, match.length),
				unit = this.value.substring(match.length),
				precision = num.indexOf('.'),
				isFloat = (precision >= 0),
				dif = (isFloat) ? .1 : 1;
			num = (isFloat) ? parseFloat(num) : parseInt(num);
			
			num = (event.which === 40) ? num-dif : num+dif;
			if (isFloat) num = num.toPrecision(match.length-precision);//adjust for computed rounding errors
			
			var prop = this.getAttribute('data-prop');
			$(adjusterElement).css(prop, num.toString()+unit);
			populateAdjuster(adjusterElement);
		}
	});
	
	//document events
	var docEscape = function(event){
		if (event.which == 27) cleanup();
	};
	
	var docClick = function(event){
		if (adjusterActive && (!$collection.has(event.target).length && !$collection.is(event.target)) && (!$adjuster.has(event.target).length && !$adjuster.is(event.target))){
			adjusterElement = null;
			adjusterActive = false;
			$adjuster.hide();
		}
	};
	
	//shutting down
	var cleanup = function(){
		//removing all created spans
		$('span.tm').each(function(){
			$(this.childNodes).unwrap();
		});
		
		//cleaning event listeners
		$collection.off('mouseenter', collectionOver).off('mouseleave', collectionOut).off('click', collectionClick);
		$(document).off('keyup', docEscape).off('click', docClick);
		
		//deleting UI
		$tooltip.remove();
		$adjuster.remove();
		$exitButton.remove();
	};
	
	$collection.hover(collectionOver, collectionOut);
	$collection.click(collectionClick);
	
	$(document).on('keyup', docEscape).on('click', docClick);
	
	$exitButton.on('click', cleanup);
	
	// polyfill window.getMatchedCSSRules() in FireFox 6+
	if ( typeof window.getMatchedCSSRules !== 'function' ) {
		var ELEMENT_RE = /[\w-]+/g,
				ID_RE = /#[\w-]+/g,
				CLASS_RE = /\.[\w-]+/g,
				ATTR_RE = /\[[^\]]+\]/g,
				// :not() pseudo-class does not add to specificity, but its content does as if it was outside it
				PSEUDO_CLASSES_RE = /\:(?!not)[\w-]+(\(.*\))?/g,
				PSEUDO_ELEMENTS_RE = /\:\:?(after|before|first-letter|first-line|selection)/g;
		// convert an array-like object to array
		function toArray (list) {
			return [].slice.call(list);
		}

		// handles extraction of `cssRules` as an `Array` from a stylesheet or something that behaves the same
		function getSheetRules (stylesheet) {
			var sheet_media = stylesheet.media && stylesheet.media.mediaText;
			// if this sheet is disabled skip it
			if ( stylesheet.disabled ) return [];
			// if this sheet's media is specified and doesn't match the viewport then skip it
			if ( sheet_media && sheet_media.length && ! window.matchMedia(sheet_media).matches ) return [];
			// get the style rules of this sheet
			return toArray(stylesheet.cssRules);
		}

		function _find (string, re) {
			var matches = string.match(re);
			return re ? re.length : 0;
		}

		// calculates the specificity of a given `selector`
		function calculateScore (selector) {
			var score = [0,0,0],
				parts = selector.split(' '),
				part, match;
			//TODO: clean the ':not' part since the last ELEMENT_RE will pick it up
			while ( part = parts.shift(), typeof part == 'string' ) {
				// find all pseudo-elements
				match = _find(part, PSEUDO_ELEMENTS_RE);
				score[2] = match;
				// and remove them
				match && (part = part.replace(PSEUDO_ELEMENTS_RE, ''));
				// find all pseudo-classes
				match = _find(part, PSEUDO_CLASSES_RE);
				score[1] = match;
				// and remove them
				match && (part = part.replace(PSEUDO_CLASSES_RE, ''));
				// find all attributes
				match = _find(part, ATTR_RE);
				score[1] += match;
				// and remove them
				match && (part = part.replace(ATTR_RE, ''));
				// find all IDs
				match = _find(part, ID_RE);
				score[0] = match;
				// and remove them
				match && (part = part.replace(ID_RE, ''));
				// find all classes
				match = _find(part, CLASS_RE);
				score[1] += match;
				// and remove them
				match && (part = part.replace(CLASS_RE, ''));
				// find all elements
				score[2] += _find(part, ELEMENT_RE);
			}
			return parseInt(score.join(''), 10);
		}

		// returns the heights possible specificity score an element can get from a give rule's selectorText
		function getSpecificityScore (element, selector_text) {
			var selectors = selector_text.split(','),
				selector, score, result = 0;
			while ( selector = selectors.shift() ) {
				if ( element.mozMatchesSelector(selector) ) {
					score = calculateScore(selector);
					result = score > result ? score : result;
				}
			}
			return result;
		}

		function sortBySpecificity (element, rules) {
			// comparing function that sorts CSSStyleRules according to specificity of their `selectorText`
			function compareSpecificity (a, b) {
				return getSpecificityScore(element, b.selectorText) - getSpecificityScore(element, a.selectorText);
			}

			return rules.sort(compareSpecificity);
		}

		//TODO: not supporting 2nd argument for selecting pseudo elements
		//TODO: not supporting 3rd argument for checking author style sheets only
		window.getMatchedCSSRules = function (element /*, pseudo, author_only*/) {
			var style_sheets, sheet, sheet_media,
				rules, rule,
				result = [];
			// get stylesheets and convert to a regular Array
			style_sheets = toArray(window.document.styleSheets);

			// assuming the browser hands us stylesheets in order of appearance
			// we iterate them from the beginning to follow proper cascade order
			while ( sheet = style_sheets.shift() ) {
				// get the style rules of this sheet
				rules = getSheetRules(sheet);
				// loop the rules in order of appearance
				while ( rule = rules.shift() ) {
					// if this is an @import rule
					if ( rule.styleSheet ) {
						// insert the imported stylesheet's rules at the beginning of this stylesheet's rules
						rules = getSheetRules(rule.styleSheet).concat(rules);
						// and skip this rule
						continue;
					}
					// if there's no stylesheet attribute BUT there IS a media attribute it's a media rule
					else if ( rule.media ) {
						// insert the contained rules of this media rule to the beginning of this stylesheet's rules
						rules = getSheetRules(rule).concat(rules);
						// and skip it
						continue
					}
					//TODO: for now only polyfilling Gecko
					// check if this element matches this rule's selector
					if ( element.mozMatchesSelector(rule.selectorText) ) {
						// push the rule to the results set
						result.push(rule);
					}
				}
			}
			// sort according to specificity
			return sortBySpecificity(element, result);
		};
	}
});