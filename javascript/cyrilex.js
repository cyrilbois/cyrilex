
class Cyrilex {
	constructor() {
		this.highlight = new RegexHighlight();
		this.start = '/';
		this.end = '/g';
		this.engineArray = ['js'/*, 'pcre', 'python', 'ruby', 'java'*/];
		this.extensionByEngine = [];
		this.extensionByEngine['js'] = '';
		/*this.extensionByEngine['pcre'] = myDomain + "/pcre.php";
		this.extensionByEngine['python'] = myDomain + "/pcre.cgi";
		this.extensionByEngine['ruby'] = myDomain + "/pcre.ruby.php";
		this.extensionByEngine['java'] = myDomainAPI + '/regex-tester/pcre.java';*/
		this.flags = ['g', 'i', 'm', 'u', 'y', 's', 'x', 'A', 'D', 'S', 'U', 'X', 'J', 'l', 'c', 'L', 'C'];
		this.flagsByEngine = [];
		this.flagsByEngine['js'] = ['g', 'i', 'm', 'u', 'y', 's'];
		/*this.flagsByEngine['pcre'] = ['g', 'i', 'm', 'u', 's', 'x', 'A', 'D', 'S', 'U', 'X', 'J'];
		this.flagsByEngine['python'] = ['g' /* findall ... * /, 'i' /* IGNORECASE, I * /, 'm' /* MULTILINE, M * /, 'u' /* UNICODE, U * /, 's' /* DOTALL, S * /, 'x' /* VERBOSE, X * /]; /*, 'l'  LOCALE, L * /
		this.flagsByEngine['ruby'] = ['g', 'i', 'm', 'x'];
		this.flagsByEngine['java'] = ['g', 'i', 'x', 's', 'm', 'u', 'l', 'c', 'L', 'C'];*/	
		this.markersString = [];
		this.myCodeMirrorString = null;
		this.myCodeMirrorRegEx = null;
		this.myCodeMirrorSubstitution = null;
		this.myCodeMirrorSubstitutionResult = null;
		this.markLeft = null;
		this.markRight = null;
		
		// regulex
		this.visualize = null;
		this.parse = null;
		this.paper = null;
	}
	displayResultExplanation(result) {
		const container = document.createElement('div');
		container.style.marginLeft = '10px';
		container.appendChild(result.getTitle());
		// container.appendChild(document.createTextNode(result.tag));
		// container.appendChild(document.createTextNode(result.label));
		if (result.regexp) {
			result.regexp.result.forEach(function (result) {
				container.appendChild(this.displayResultExplanation(result));
			});
		}
		if (result.result) {
			result.result.forEach(function (subresult) {
				if (subresult.section) {
					const subcontainer = document.createElement('div');
					subcontainer.style.marginLeft = '10px';
					container.appendChild(subcontainer);
					subcontainer.appendChild(document.createTextNode(subresult.section));
					subcontainer.appendChild(document.createElement('br'));
					subcontainer.appendChild(this.displayResultExplanation(subresult));
				} else {
					container.appendChild(this.displayResultExplanation(subresult));
				}
			});	
		}
		return container;
	}
	displayExplanation(explanation) {
		this.highlight.highlight(this.myCodeMirrorRegEx, explanation, {pos: 1, color: 0});
		return this.visualIt(explanation);
	}
	visualIt(re) {
		const self = this;
		if (!re) return false;
		if (this.parse == null) {
			setTimeout(function () {
				self.visualIt(re);
			}, 10);
			return;
		}
		try {
			const ret = this.parse(re.regExStr)
			this.visualize(ret,re.regExFlags, this.paper);
		}
		catch (e) {
			if (e instanceof this.parse.RegexSyntaxError) {
				return this.logError(re.regExStr, e);
			} else {
				this.setAndDisplay('editor-error', 'Syntax error in your regular expression');
			}
		}
	}
	getEngine() {
		return this.engineArray.reduce(function (result, engine) {
			if (document.getElementById('engine-' + engine).checked) {
				return engine;
			}
			return result;
		});	
	}
	updateFlags() {
		const self = this;
		if (this.markRight) this.markRight.clear();
		if (this.markLeft) this.markLeft.clear();

		let current = this.myCodeMirrorRegEx.getValue();
		current = current.substring(0, current.length - this.end.length);

		this.end = "/";
		const engine = this.getEngine();
		this.flagsByEngine[engine].forEach(function (f) {
			if (document.getElementById('flag_' + f).checked) self.end += f;
		});

		this.myCodeMirrorRegEx.setValue(current + this.end);

		this.markLeft = this.myCodeMirrorRegEx.markText({line: 0, ch: 0}, {line: 0, ch: 1}, {readOnly: true, atomic: true, inclusiveLeft: true});		
		this.markRight = this.myCodeMirrorRegEx.markText({line: 0, ch: this.myCodeMirrorRegEx.getValue().length - this.end.length}, {line: 0, ch: this.myCodeMirrorRegEx.getValue().length + 1}, {readOnly: true, atomic: true, inclusiveRight: true});	
		this.checkRegEx();
	}
	analyzeMatch(matchArray, infinity) {			
		const self = this;
		if (infinity) {
			this.setAndDisplay('editor-valid', 'infinity of matchs');
		} else if (matchArray == null || matchArray.length == 0) {
			this.setAndDisplay('editor-error', 'No match');
		} else {
			this.setAndDisplay('editor-valid', matchArray.length+' matchs');
			matchArray.forEach(function (match, indexMark) {
				var before = self.myCodeMirrorString.getValue("\n").substring(0, match.index).split("\n");
				var find = match.m.split("\n");
				self.markersString.push(self.myCodeMirrorString.markText(
						{line: before.length - 1, ch: before[before.length-1].length}, 
						{line: before.length - 1 + find.length - 1, ch: (find.length == 1 ? before[before.length-1].length + find[0].length: find[find.length-1].length) }, 
						{className: "regExMatch" + (indexMark % 2)}
					)
				);	
			});
		}
	}
	checkRegExJS(pattern, subject) {
		this.emptyAndHide(['editor-error', 'editor-valid']);
		var regex = new RegExp( pattern , this.end.substring(1));
		var m = null;
		var previous = -1;
		var matchArray = [];
		var infinity = false;
		while ((m = regex.exec(subject)) !== null) {
			matchArray.push({index: m.index, m: m[0]});
			if (this.end.indexOf('g') === -1) {
				break;
			}
			if (previous == m.index) {
				infinity = true;
				break;
			}
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			previous = m.index;
		}
		this.analyzeMatch(matchArray, infinity);

		this.myCodeMirrorSubstitutionResult.setValue(this.myCodeMirrorString.getValue("\n").replace(regex, this.myCodeMirrorSubstitution.getValue("\n")));
	}
	checkRegEx() {
		const engine = this.getEngine();
		try {
			var editor = this.myCodeMirrorRegEx.getValue("\n");

			this.markersString.forEach(function(marker) { marker.clear(); });
			this.markersString.splice(0, this.markersString.length)

			if (editor.substring(this.start.length, editor.length - this.end.length) == '') {
				this.emptyAndHide(['editor-error', 'editor-valid']);
				this.setAndDisplay('editor-valid', 'Enter your regular expression.');
			} else {
				let explanation = (new RegexExplanation()).explain(editor.substring(this.start.length, editor.length - this.end.length));
				explanation.regExStr = editor.substring(this.start.length, editor.length - this.end.length);
				explanation.regExFlags = this.end.substring(1);
				const errorMsg = this.displayExplanation(explanation);
				//if (engine == 'js') {
					this.checkRegExJS(editor.substring(this.start.length, editor.length - this.end.length), this.myCodeMirrorString.getValue("\n"));
				/*} else {
					checkRegExPRE(editor.substring(start.length, editor.length - end.length), this.myCodeMirrorString.getValue("\n"), this.start, this.end, errorMsg);
				}*/
			}
		} catch(e) {
			if (e.message) {
				this.setAndDisplay('editor-error', e.message);
			} else {
				this.setAndDisplay('editor-error', 'Invalid regular expression');	
			}
		}
	}
	manageFlags() {
		const engine = this.getEngine();
		this.flags.forEach(function (f) {
			document.getElementById('flag_' + f).parentNode.parentNode.style.display = 'none';
		});
		this.flagsByEngine[engine].forEach(function (f) {
			document.getElementById('flag_' + f).parentNode.parentNode.style.display = '';
		});	
	}
	clearSelect() {
	  if (window.getSelection) {
		if (window.getSelection().empty) {  // Chrome
		  window.getSelection().empty();
		} else if (window.getSelection().removeAllRanges) {  // Firefox
		  window.getSelection().removeAllRanges();
		}
	  } else if (document.selection) {  // IE
		document.selection.empty();
	  }
	}
	openTabber (tabber, className, selector) {
		if (!className) {
			className = 'w3-dark-grey';
		}
		var i;
		var x;
		if (!selector) {
			x = document.getElementsByClassName("tabber");
		} else {
			x = document.querySelectorAll(selector);
		}
		
		for (i = 0; i < x.length; i++) {
			x[i].style.display = "none"; 
			if (document.getElementById('button-'+x[i].id)) document.getElementById('button-'+x[i].id).classList.remove(className);
		}
		document.getElementById(tabber).style.display = "block"; 
		if (document.getElementById('button-'+tabber)) document.getElementById('button-'+tabber).classList.add(className);
	}
	logError(re, err) {
	  var msg=["Error:"+err.message,""];
	  if (typeof err.lastIndex==='number') {
		msg.push(re);
		msg.push(new Array(err.lastIndex).join('-')+"^");
	  }
	  return "Syntax error in your regular expression\n"+msg.join("\n");
	}
	emptyAndHide (containerId) {
		const self = this;
		if (containerId instanceof Array) {
			containerId.forEach(function(id) {
				self.emptyAndHide(id);
			});
		} else {
			var containerError = (typeof containerId === 'string' ? document.getElementById(containerId) : containerId);
			if (containerError) {
				containerError.innerText = '';
				containerError.style.display = 'none';
			}
		}
	}
	setAndDisplay (containerId, messageText) {
		var containerError = (typeof containerId === 'string' ? document.getElementById(containerId) : containerId);
		if (containerError && messageText) {
			containerError.innerText = messageText;
			containerError.style.display = '';
		}
	}
	initRegEx() {
		this.myCodeMirrorSubstitution.setValue('Regular expression');
		this.myCodeMirrorString.setValue('Online XPath tester');
		this.myCodeMirrorRegEx.setValue('/(XP[a-z]th)|(JSONPath)/g');	
	}
	generateString() {
		try {
			const pattern = this.myCodeMirrorRegEx.getValue("\n").substring(this.start.length, this.myCodeMirrorRegEx.getValue("\n").length - this.end.length);
			this.myCodeMirrorString.setValue(new RandExp(new RegExp( pattern , this.end.substring(1))).gen());
		} catch(e) {
			this.setAndDisplay('editor-error', 'An error has occured: ' + e.message);
		}
	}
	init() {
		const self = this;

		require(['external/regulex/src/libs/raphael','external/regulex/src/visualize','external/regulex/src/parse'],function (R,_visualize,_parse) {
			self.visualize = _visualize;
			self.parse = _parse;
			self.paper = R('graphCt', 10, 10);
		});

		this.myCodeMirrorSubstitution = CodeMirror.fromTextArea(document.getElementById('editor-container-substitution'), { lineNumbers: true, viewportMargin: Infinity});
		this.myCodeMirrorSubstitution.setSize(null, 42);
		this.myCodeMirrorSubstitution.on( "change", this.checkRegEx.bind(this));
		
		this.myCodeMirrorSubstitutionResult = CodeMirror.fromTextArea(document.getElementById('editor-container-substitution-result'), { lineNumbers: true, readOnly: true, lineWrapping: true, viewportMargin: Infinity});
		this.myCodeMirrorSubstitutionResult.setSize(null, 160);

		this.myCodeMirrorString = CodeMirror.fromTextArea(document.getElementById('editor-container'), { lineNumbers: true, lineWrapping: true,viewportMargin: Infinity});
		this.myCodeMirrorString.setSize(null, 160);
		this.myCodeMirrorString.on( "change", this.checkRegEx.bind(this));
		
		this.myCodeMirrorRegEx = CodeMirror.fromTextArea(document.getElementById('editor-container-regexp'), { lineNumbers: false, viewportMargin: Infinity});
		this.myCodeMirrorRegEx.on( "change", this.checkRegEx.bind(this));
		this.myCodeMirrorRegEx.setSize(null, 42);
		
		this.myCodeMirrorRegEx.on( "beforeChange", function(cm, change) { 
			if (change.text && change.text.length > 1) 
			{ 
				change.update(change.from, change.to, [ change.text.join("") ]); 
			} 
		}, this); 			
		
		this.flags.forEach(function (f) {
			document.getElementById('flag_' + f).addEventListener('change', function(e) { 
				 self.updateFlags();
			}, false); 			
		});

		this.engineArray.forEach(function (engine) {
			const self = this;
			document.getElementById('engine-' + engine).addEventListener('change', function(e) { 
				self.manageFlags();
				self.updateFlags();
				self.checkRegEx();
				if (document.URL.split('#').length == 1 || self.engineArray.indexOf(document.URL.split('#')[1]) !== -1) {
					if (document.URL.indexOf('/regex/') === -1) {
						history.pushState({}, "", window.location.pathname + "#"+self.getEngine());
					}
				}
			}, false);
		});
		
		this.emptyAndHide(['editor-error', 'editor-valid']);

		this.markLeft = this.myCodeMirrorRegEx.markText({line: 0, ch: 0}, {line: 0, ch: 1}, {atomic: true, inclusiveLeft: true});
		this.markRight = this.myCodeMirrorRegEx.markText({line: 0, ch: this.myCodeMirrorRegEx.getValue().length - this.end.length }, {line: 0, ch: this.myCodeMirrorRegEx.getValue().length + 1 }, {readOnly: true, atomic: true, inclusiveRight: true});
		
		this.manageFlags();
		this.updateFlags();

		this.highlight.init();
		this.initRegEx(); 
				
		const  coll = document.getElementsByClassName("collapsible");
		for (let i = 0; i < coll.length; i++) {
		  coll[i].addEventListener("click", function() {
			this.classList.toggle("active");
			var content = this.nextElementSibling;
			if (content.style.display === "block") {
			  content.style.display = "none";
			} else {
			  content.style.display = "block";
			}
		  });
		}
	}
}
