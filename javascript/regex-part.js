
class RegexPart {
	constructor(obj) {
		this.label = '';
		this.type = null;
		this.tag = '';
		this.regExStr = null;
		this.regExFlags = null;
		this.regex = null;
		this.result = [];
		this.hasError = false;
		this.section = null;
		if (obj) {
			if (obj.label) {
				this.label = obj.label;
			}
			if (obj.regex) {
				this.regex = obj.regex;
			}
			if (obj.result) {
				this.result = obj.result;
			}
			if (obj.hasError) {
				this.hasError = obj.hasError;
			}
			if (obj.section) {
				this.section = obj.section;
			}
			if (obj.type) {
				this.type = obj.type;
			}
			if (obj.tag) {
				this.tag = obj.tag;
			}
		}
	}
	getTitle() {
		var container = document.createElement('div');
		var tag = document.createElement('b');
		
		HTMLEntities = function (text) {
			var text = String(text), chars = {
			  '<':'&lt;',
			  '>':'&gt;'
			};
			Object.keys(chars).forEach(function(c) {
				text=text.replace(new RegExp(c,'g'), chars[c]);
			});
			return text;
		};

		tag.innerHTML = HTMLEntities(this.tag);
		tag.style.display = 'inline-block';
		tag.style.minWidth = "90px";
		container.appendChild(tag);
		container.appendChild(document.createTextNode(this.label.replace('[tag]', this.tag)));
		return container;
	}
}

