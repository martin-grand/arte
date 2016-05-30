;(function (engine) {
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = engine;
	} else {
		this.arte = engine;
	}

})(function () {
	var exports = {},
		dictionary = {},
		defaultLanguage = false,
		hasDictionary = false,
		partials = {},
		helpers = {
			'each': function (object, contentBlock) {
				var content = '';

				for (var key in object) {
					if (object.hasOwnProperty(key)) {
						content += contentBlock(object[key], {key: key, index: key});
					}
				}
				return content;
				
			}
		},

		fnBegin = 'function(meta,root,parent,helpers,partials){meta=meta||{};' +
			'meta.context=this;meta.parent=parent;var out="',

		regexp = [
			// handle new lines :
			[/\n/g, '\\n'],
			// remove comments {{!-- xy --}} or {{! xy}} :
			[/({{!--.+?--}}|{{!.+?}})/g, ''],
			// handle double quotes :
			[/(")(?![^{]*}})/g, '\\"'],
			// if :
			[/{{#if (.+?)}}/g, '";if($1){out+="'],
			// else if :
			[/{{#elseif (.+?)}}/g, '"}else if($1){out+="'],
			// else :
			[/{{#else}}/g, '"}else{out+="'],
			// end if :
			[/{{\/if}}/g, '"}out+="'],
			// singe helper without arguments :
			[/{{#(.+?)\/}}/g, '"+helpers.$1.call(this)+"'],
			// singe helper :
			[/{{#(.+?) (.+?)\/}}/g, '"+helpers.$1.call(this,($2))+"'],
			// open block helper without arguments :
			[/{{#(.+?)}}/g, '"+helpers.$1(function(c,m){return(' + fnBegin],
			// open block helper :
			[/{{#(.+?) (.+?)}}/g, '"+helpers.$1.call(this,($2),function(c,m){return(' + fnBegin],
			// end block helper :
			[/{{\/(.+?)}}/g, '";return out}).call(c,m,root,meta,helpers,partials)})+"'],
			// partial :
			[/{{>(.+?) (.+?)}}/g, '"+partials.$1($2)+"'],
			// partial without arguments :
			[/{{>(.+?)}}/g, '"+partials.$1()+"'],
			// default :
			[/{{(.+?)}}/g, '"+($1)+"']
		],

		getFnStringFromTemplateString = function (_templateString) {
			var i;
			
			for (i = 0; i < regexp.length; i++) {
				_templateString = _templateString.replace(regexp[i][0], regexp[i][1]);
			}
			return '(' + fnBegin + _templateString + '";return out})';
			
		},

		processBem = function(html) {
			var isBemRegexp = /[.(]/g,
				whiteSpaceRegexp = /\s+/g,
				multipleWhiteSpaceRegexp = /\s\s+/g,
				classRegexp = /<[^>]*class\s*=\s*['"]\s*([^"']*)\s*['"]/g,
				getParenthesisRegexp = /(\([^)]+\))/g,
				getParenthesisValueRegexpString = '\\(([^)]+)\\)';

			function processHtml(html) {
				return html.replace(classRegexp, function (whole, match) {
					if (match.match(isBemRegexp)) {
						return whole.replace(match, processClassValue(match));
					}
					return whole;

				});

			}

			function processClassValue(classValue) {
				var classNames,
					i;

				classValue = classValue.replace(whiteSpaceRegexp, ' ');
				classValue = classValue.replace(multipleWhiteSpaceRegexp, ' ');
				classValue = classValue.replace(getParenthesisRegexp, function (match) {
					return match.replace(whiteSpaceRegexp, '')
				});
				classNames = classValue.split(' ');
				for (i = 0; i < classNames.length; i++) {
					if (classNames[i].match(isBemRegexp)) {
						classNames[i] = processClassName(classNames[i]);
					}
				}

				return classNames.join(' ');

			}

			function processClassName(className) {
				var dotSplit = className.split('.'),
					block = dotSplit[0].replace(getParenthesisRegexp, ''),
					element = dotSplit.length > 1 ? dotSplit.join('__').replace(getParenthesisRegexp, '') : false,
					parenthesisValues = (new RegExp(getParenthesisValueRegexpString, 'g')).exec(className),
					modifier = parenthesisValues ? parenthesisValues[1].split(',') : false,
					base = element ? element : block,
					result = [base],
					i;

				if (modifier) {
					for (i = 0; i < modifier.length; i++) {
						result.push(base + '--' + modifier[i]);
					}
				}

				return result.join(' ');

			}
			
			return processHtml(html);

		},

		processDictionary = function(html, language) {
			if(!hasDictionary) {
				return html;
			}

			language = language || defaultLanguage;

			return html.replace(/\[\[(.+?) (.+?)\]\]/g, function(match, id, default){
				return dictionary[language][id] || default;
			});

		};

	exports.template = function(_templateString, language) {
		var fn;
		
		try {
			_templateString = processDictionary(_templateString, language);
			fn = eval(getFnStringFromTemplateString(_templateString));
			return function (context) {
				context = context || {};
				return processBem(fn.call(context, {}, context, false, helpers, partials));
			}
			
		} catch (e) {
			console.error(e, getFnStringFromTemplateString(_templateString));
			
		}
		
	};

	exports.addHelper = function (_helperName, _function) {
		helpers[_helperName] = _function;
		
	};

	exports.addPartial = function (_partialName, _templateString) {
		partials[_partialName] = exports.template(_templateString);
		
	};

	exports.addDictionary = function (_language, _dictionary) {
		defaultLanguage = defaultLanguage || _language;
		hasDictionary = true;
		dictionary[_language] = _dictionary;		
	};

	return exports;
	
});
