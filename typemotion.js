(function($){
	$(function(){
		//setup
		var $collection = $('p'),
			adjusterActive = false,
			adjusterElement = null,
			dragOffset = {top: 0, left: 0};
		
		var commonStyles = {
			'position': 'absolute',
			'margin': 0,
			'padding': '10px',
			'background': '#242424',
			'border': '1px solid rgba(255,255,255,.3)',
			'border-radius': '10px',
			'padding': '10px 15px',
			'color': '#fff',
			'font-size': '18px',
			'font-family': 'tahoma',
			'z-index:': 15000
		};
		var h1Styles = {
			'font-weight': 'normal',
			'font-size': '26px',
			'margin': '0 0 10px',
			'cursor': 'move',
			'color': '#fff',
			'display': 'inline-block'
		};
		var h2Styles = {
			'font-size': '18px',
			'font-weight': 'normal',
			'padding': 0,
			'margin-top': '25px',
			'color': '#fff',
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
		
		var $liBase = $('<li>').css({'margin-bottom': '3px', 'list-style': 'none'});
		
		var $measureList = $('<ul>').css(listStyles);
		$measureList.append($liBase.clone().html('<label>Average :</label> <span class="tm-average"></span>'));
		$measureList.append($liBase.clone().html('<label>Minimum :</label> <span class="tm-min"></span>'));
		$measureList.append($liBase.clone().html('<label>Maximum :</label> <span class="tm-max"></span>'));
		$measureList.append($liBase.clone().html('<label>Total signs :</label> <span class="tm-signs"></span>'));
		$adjuster.append($measureList);
		
		var $rythmList = $('<ul>').css(listStyles);
		$rythmList.append($liBase.clone().html('<label for="tm-fontsize">Font size :</label><input id="tm-fontsize" data-prop="font-size" type="text" />'));
		$rythmList.append($liBase.clone().html('<label for="tm-lineheight">Line height :</label><input id="tm-lineheight" data-prop="line-height" type="text" />'));
		$rythmList.append($liBase.clone().html('<label for="tm-wordspacing">Word spacing :</label><input id="tm-wordspacing" data-prop="word-spacing" type="text" />'));
		$rythmList.append($liBase.clone().html('<label for="tm-letterspacing">Letter spacing :</label><input id="tm-letterspacing" data-prop="letter-spacing" type="text" />'));
		$adjuster.append($rythmTitle);
		$adjuster.append($rythmList);
		
		$adjuster.find('label').css({'min-width': '100px', 'display': 'inline-block', 'color': '#fff'});
		
		$adjuster.hide();
		
		var $exitButton = $('<div>');
		$exitButton.css($.extend({}, commonStyles, {'position': 'fixed', top: 10, right: 10, cursor: 'pointer', 'text-align': 'center'}));
		$exitButton.html('Exit TypeMotion');
		
		$('body').append($tooltip).append($exitButton).append($adjuster);
		
		//live editinginputs
		var $inputs = $('#tm-fontsize, #tm-lineheight, #tm-wordspacing, #tm-letterspacing');
		$inputs.css(inputStyles);
		
		//wrapping every word inside paragraphs inside spans
		$.fn.spanify = function(wrapper){
			this.each(function(){
				if (this.nodeType === 3){
					var $div = $('<div>');
					
					$.each(this.data.split(/\s/), function(index, value){
						if (!value.length) return;
						
						//technically this isn't exact, as \s migth catch some other kind of spaces
						$div.append($(wrapper).clone().text(value+' '));
					});
					$(this).after($div.html()).remove();
				}
				else{
					$(this.childNodes).spanify(wrapper);
				}
			});
		}
		
		var spanClass = 'tm'+(new Date()).getTime();
		$collection.spanify($('<span>').addClass(spanClass));
		
		//core function for measure calculation
		var getMeasures = function(){
			var $this = $(this);
			
			//this keyword refers to the html element
			//finding out where the lines break
			var text = escape($this.text()),
				$spans = $this.find('span.'+spanClass),
				prevOffset = $spans.first().offset().top,
				lineBreaks = [];
			
			$spans.each(function(index){
				var currentOffset = $(this).offset().top;
				if (currentOffset > prevOffset){
					prevOffset = currentOffset;
					lineBreaks.push(index);
				}
			});
			if (lineBreaks.length === 0) lineBreaks.push($spans.length-1);//in case of one-liner
			
			//retrieving the actual lines of text
			var lines = [];
			var currentBreak = 0;
			var lineText = '';
			
			$spans.each(function(index){
				if (index < lineBreaks[currentBreak]){
					lineText += this.textContent+' ';
				}
				else if (currentBreak > 0 && currentBreak >= lineBreaks.length){
					//the last line is ignored as it will probably be way shorter
					//than the rest and thus screw up the stats
					return false;
				}
				else {
					//removing trailing space and any tabs or new lines
					console.log(lineText);
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
			if (!window.getMatchedCSSRules){
				return $(elem).css(property);
			}
			
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
				$('#tm-fontsize').val(getMatchedStyle(this, 'font-size'));
				$('#tm-lineheight').val(getMatchedStyle(this, 'line-height'));
				$('#tm-wordspacing').val(getMatchedStyle(this, 'word-spacing'));
				$('#tm-letterspacing').val(getMatchedStyle(this, 'letter-spacing'));
				
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
		$inputs.on('input', function(){
			var match = this.value.match(/(\d(\.)?)+/g);
			if (match && this.value.substring(0, match[0].length).match(/\.$/)) return;
			
			$(adjusterElement).css(this.getAttribute('data-prop'), this.value);
			populateAdjuster(adjusterElement);
		}).on('keydown', function(event){
			if ((event.which === 40 || event.which === 38) && this.value.match(/-?(\d+)?\.?\d+.?/)){
				
				var match = this.value.split(/[^0-9]+$/)[0],
					precision = match.indexOf('.'),
					isFloat = (precision >= 0),
					unit = this.value.substring(match.length),
					num = (isFloat) ? parseFloat(match) : parseInt(match),
					step;
					
				step = (event.which === 38) ? 1 : -1;
				if (isFloat) step *= .1;
				
				num = (isFloat) ? (num+step).toFixed(match.length-precision-1) : num+step;
				
				var prop = this.getAttribute('data-prop');
				$(adjusterElement).css(prop, num.toString()+unit);
				$(this).val(num.toString()+unit);
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
			$('span.'+spanClass).each(function(){
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
	});
})(jQuery);