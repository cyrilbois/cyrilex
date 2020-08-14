
class RegexHighlight {
	constructor() {
		this.colors = ['#4298B5','#ADC4CC','#9B539C','#92B06A','#E19D29','#EB65A0','#DD5F32'];
		this.markers = [];
	}
	init() {
		const style = document.createElement('style');
		let styleData = '';
		this.colors.forEach(function(color, i) {
			styleData += '.regExTesterColor'+i+' { background-color: '+color+'; }';
		});
		style.type = 'text/css';
		style.innerHTML = styleData;
		document.getElementsByTagName('head')[0].appendChild(style);
	}
	highlight(myCodeMirrorRegEx, explanation, pos) {
		const self = this;
		if (pos.pos === 1) {
			this.markers.forEach(function(marker) { marker.clear(); });
			this.markers.splice(0, this.markers.length)
		}
		if (pos.color >= this.colors.length) {
			pos.color = 0;
		}
		var currentColor = pos.color;
		
		if (explanation.from) { 
			this.markers.push(myCodeMirrorRegEx.markText({line: 0, ch: pos.pos}, {line: 0, ch: pos.pos + explanation.from.length}, {className: "regExTesterColor"+currentColor}));
			pos.color++;
			pos.pos += explanation.from.length;
		}
		if (explanation.type == 'expression') {
			pos.color++;
			explanation.result.forEach(function (reg, resultPos) {
				self.highlight(myCodeMirrorRegEx, reg, pos);
				if (resultPos !== explanation.result.length - 1) {
					self.markers.push(myCodeMirrorRegEx.markText({line: 0, ch: pos.pos}, {line: 0, ch: pos.pos+1}, {className: "regExTesterColor"+currentColor}));
					pos.pos += 1;
				}

			});
		} else if (explanation.type == 'altern' || explanation.type == null  || explanation.result.length > 0) {
			
			explanation.result.forEach(function (reg, resultPos) {
				self.highlight(myCodeMirrorRegEx, reg, pos);
			});
			
		} else if (explanation.tag) {
			if (explanation.type != 'string') {
				this.markers.push(myCodeMirrorRegEx.markText({line: 0, ch: pos.pos}, {line: 0, ch: pos.pos + explanation.tag.length}, {className: "regExTesterColor"+currentColor}));
				pos.color++;
			}
			pos.pos += explanation.tag.length;
		}
		
		if (explanation.to) { 
			this.markers.push(myCodeMirrorRegEx.markText({line: 0, ch: pos.pos}, {line: 0, ch: pos.pos + explanation.to.length}, {className: "regExTesterColor"+currentColor}));
			pos.pos += explanation.to.length;
		}
	}
}