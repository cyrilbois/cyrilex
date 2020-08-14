
class RegexExplanation {
	constructor() {
	
	}
	readSubstitution(regex) {
		if (regex.regex.length == 1) {
			result = new RegexPart({type:'anchor', label: "The match must occur at the end of the string (or before new line)", tag: '$'});
			regex.regex = regex.regex.substring(1);
			regex.result.push(result);
			return true;
		}
		switch(regex.regex.substring(0, 2)) {
			case '$_':
					result = new RegexPart({type:'substitution', label: "Substitutes the entire input string", tag: regex.regex.substring(0, 2)});
					regex.regex = regex.regex.substring(2);
					regex.result.push(result);
				break;
			case '$\'':
					result = new RegexPart({type:'substitution', label: "Substitutes all the text of the input string after the match", tag: regex.regex.substring(0, 2)});
					regex.regex = regex.regex.substring(2);
					regex.result.push(result);
				break;
			case '$+':
					result = new RegexPart( {type:'substitution', label: "Substitutes the last group that was captured", tag: regex.regex.substring(0, 2)});
					regex.regex = regex.regex.substring(2);
					regex.result.push(result);
				break;
			case '$`':
					result = new RegexPart( {type:'substitution', label: "Substitutes all the text of the input string before the match", tag: regex.regex.substring(0, 2)});
					regex.regex = regex.regex.substring(2);
					regex.result.push(result);
				break;
			case '$&':
					result = new RegexPart( {type:'substitution', label: "Substitutes a copy of the whole match", tag: regex.regex.substring(0, 2)});
					regex.regex = regex.regex.substring(2);
					regex.result.push(result);
				break;
			case '$$':
					result = new RegexPart( {type:'substitution', label: "Substitutes a literal", tag: regex.regex.substring(0, 2)});
					regex.regex = regex.regex.substring(2);
					regex.result.push(result);
				break;
			case '$0':case '$1':case '$2':case '$3':case '$4':case '$5':case '$6':case '$7':case '$8':case '$9': //TODO: > 9 ??
					result = new RegexPart( {type:'substitution', label: "Substitutes the substring matched by group number", tag: regex.regex.substring(0, 2)});
					regex.regex = regex.regex.substring(2);
					regex.result.push(result);
				break;
			case '${':
					if (regex.regex.indexOf('}') != -1) {
						result = new RegexPart( {type:'substitution', label: "Substitutes the substring matched by the named group name", tag: regex.regex.substring(0, regex.regex.indexOf('}') + 1)});
						regex.regex = regex.regex.substring(regex.regex.indexOf('}') + 1);
						regex.result.push(result);
					} else {
						result = new RegexPart({type:'n/a', label: "Substitution is not closed", tag: regex.regex.substring(0, 2), hasError: true});
						regex.regex = regex.regex.substring(2);
						regex.result.push(result);
					}
				break;
			default:
					result = new RegexPart({type:'anchor', label: "Matches the end of the input", tag: '$'});
					regex.regex = regex.regex.substring(1);
					regex.result.push(result);	
		}
	}
	readEscape(regex) {
		const self = this;
		let result = new RegexPart({type:'escape'});
		regex.result.push(result);
		const c = regex.regex.substring(1, 2);
		switch(c){
			case 'a':
					result.label = "Alarm character (\\u0007)";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'b':
					if (regex.result.length > 0 && regex.result[regex.result.length-1].type == 'class') {
						result.label = "Backspace (\\u0008)"; // si dans []
					} else {
						result.label = "Anchor that matches a word boundary";
					}
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 't':
					result.label = "Tabulation(\\u0009)";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'r':
					result.label = "Carriage return (\\u000D)";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'v':
					result.label = "Vertical tab \\u000B)";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'f':
					result.label = "Form feed (\\u000C)";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'n':
					result.label = "New line (\\u000A)";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'e':
					result.label = "Escape (\\u001B)";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				if (regex.regex.length < 3 || "0123456789".indexOf(regex.regex.substring(2, 3)) === -1) {
					result.label = "Backreference, matches the same text as most recently matched by the "+self.getTextPos(regex.regex.substring(1, 2))+" subexpression";
					regex.regex = regex.regex.substring(2);
					result.tag = "\\" + c;
					regex.tag += result.tag;
				} else if (regex.regex.length >= 4 && "0123456789".indexOf(regex.regex.substring(3, 4)) !== -1) {
					result.label = "ASCII character";
					result.tag = regex.regex.substring(0, 4);
					regex.regex = regex.regex.substring(4);
					regex.tag += result.tag;
				} else {
					result.label = "ASCII character";
					result.tag = regex.regex.substring(0, 3);
					regex.regex = regex.regex.substring(3);
					regex.tag += result.tag;
				}
				break;
			case 'x':
				if (regex.regex.length >= 4 && "0123456789".indexOf(regex.regex.substring(2, 3)) !== -1 && "0123456789".indexOf(regex.regex.substring(3, 4)) !== -1) {
					result.label = "ASCII character (hexadecimal character code)";
					result.tag = regex.regex.substring(0, 4);
					regex.regex = regex.regex.substring(4);
					regex.tag += result.tag;
				} else {
					result.label = "x character";
					result.tag = regex.regex.substring(0, 2);
					regex.regex = regex.regex.substring(2);
					regex.tag += result.tag;
				}
				break;
			case 'c':
				if (regex.regex.length >= 3) {
					result.label = "ASCII character (hexadecimal character code)";
					result.tag = regex.regex.substring(0, 4);
					regex.regex = regex.regex.substring(4);
					regex.tag += result.tag;
				} else {
					result.label = "c character";
					result.tag = regex.regex.substring(0, 2);
					regex.regex = regex.regex.substring(2);
					regex.tag += result.tag;
				}
				break;
			case 'u':
				if (regex.regex.length >= 6 
					&& "0123456789".indexOf(regex.regex.substring(2, 3)) !== -1 && "0123456789".indexOf(regex.regex.substring(3, 4)) !== -1
					&& "0123456789".indexOf(regex.regex.substring(4, 5)) !== -1 && "0123456789".indexOf(regex.regex.substring(5, 6)) !== -1) {
					result.label = "ASCII character (hexadecimal character code)";
					result.tag = regex.regex.substring(0, 6);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(6);
				} else {
					result.label = "u character";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				}
				break;
			case 'w':
					result.label = "Matches any word character";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'W':
					result.label = "Matches any non-word character";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 's':
					result.label = "Matches any white-space character";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'S':
					result.label = "Matches any non-white-space character";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'd':
					result.label = "Matches any decimal digit";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'D':
					result.label = "Matches any character other than a decimal digit";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'p':
					if (regex.regex.length >= 5 && regex.regex.substring(2, 3) == '{' && regex.regex.indexOf('}') !== -1) {
						result.label = "Matches any single character in named block specified or in the unicode general category";
						result.tag = regex.regex.substring(0, regex.regex.indexOf('}')+1);
						regex.tag += result.tag;
						regex.regex = regex.regex.substring(regex.regex.indexOf('}')+1);
						
					} else {
						result.label = "p character";
						result.tag = regex.regex.substring(0, 2);
						regex.tag += result.tag;
						regex.regex = regex.regex.substring(2);
					}
				break;
			case 'P':
					if (regex.regex.length >= 5 && regex.regex.substring(2, 3) == '{' && regex.regex.indexOf('}') !== -1) {
						result.label = "Matches any single character that is not in named block specified or the unicode general category";
						result.tag = regex.regex.substring(0, regex.regex.indexOf('}')+1);
						regex.tag += result.tag;
						regex.regex = regex.regex.substring(regex.regex.indexOf('}')+1);
						
					} else {
						result.label = "p character";
						result.tag = regex.regex.substring(0, 2);
						regex.tag += result.tag;
						regex.regex = regex.regex.substring(2);
					}
				break;		
			case 'A':
					result.label = "The match must occur at the start of the string";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;
			case 'Z':
					result.label = "The match must occur at the end of the string (or before \n)";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break
			case 'z':
					result.label = "The match must occur at the end of the string.";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;	
			case 'G':
					result.label = "The match must occur at the point where the previous match ended";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;	
			case 'b':
					result.label = "The match must occur on a boundary between a alphanumeric and a nonalphanumeric character";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;		
			case 'B':
					result.label = "The match must not occur on a boundary";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				break;	
			case 'k': 
					if (regex.regex.length >= 3 && regex.regex.substring(2, 3) == '<' && regex.regex.indexOf('>') != -1) {
						result.label = "Named backreference";
						result.tag = regex.regex.substring(0, regex.regex.indexOf('>')+1);
						regex.tag += result.tag;
						regex.regex = regex.regex.substring(regex.regex.indexOf('>')+1);
					} else {
						result.label = "k character";
						result.tag = regex.regex.substring(0, 2);
						regex.tag += result.tag;
						regex.regex = regex.regex.substring(2);
					}
				break;
			default:
				if (regex.regex.length >= 2) {
					result.label = "Escaped character";
					result.tag = regex.regex.substring(0, 2);
					regex.tag += result.tag;
					regex.regex = regex.regex.substring(2);
				} else {
					result.label = "n/a";
					result.tag = regex.regex.substring(0, 1);
					regex.regex = regex.regex.substring(1);
					regex.tag += result.tag;
					regex.hasError = true;
				}
				break;
		}
	}
	
	readTimeQuantifier(regex) {
		var result = new RegexPart({type:'class', label: "Quantifier:"});
		regex.result.push(result);
		if (regex.regex.indexOf('}') === -1) {
			result.type = 'n/a';
			result.label = 'Quantifier is not closed';
			regex.hasError = true;
			regex.regex = regex.regex.substring(1);
			return;
		}
		result.tag = regex.regex.substring(0, regex.regex.indexOf('}') + 1);
		regex.regex = regex.regex.substring(regex.regex.indexOf('}') + 1);
		var query = regex.regex.length > 0 && regex.regex.substring(0, 1) == '?';
		if (result.tag.indexOf(',') === -1 || result.tag.indexOf(',') === result.tag.length - 2) {
			if (result.tag.substring(1, result.tag.length - 1).replace(',', '').split('').some(function(c) {
				return "0123456789".indexOf(c) === -1;
			})) {
				result.type = 'n/a';
				result.label = 'Quantifier is inconsistent, must have a number of times';
				regex.hasError = true;
				return;
			} else {
				if (result.tag.indexOf(',') !== -1) {
					result.label = (query ? 'Matches the previous element at least n times, but as few times as possible' : 'Matches the previous element at least n times');	
				} else {
					result.label = (query ? 'Matches the preceding element exactly n times' : 'Matches the previous element exactly n times');
				}
			}
		} else {
			if (result.tag.substring(1, result.tag.length - 1).replace(',', '').split('').some(function(c) {
				return "0123456789".indexOf(c) === -1;
			})) {
				result.type = 'n/a';
				result.label = 'Quantifier is inconsistent, must have a number of times';
				regex.hasError = true;
				return;
			} else {
				result.label = (query ? 'Matches the previous element between n and m times, but as few times as possible' : 'Matches the previous element at least n times, but no more than m times');
			}
		}
	}
		
	readCharacterClass(regex) {
		var result = new RegexPart({type:'class', label: "Matches any single character in list"});
		regex.result.push(result);
		result.tag = '[';
		regex.regex = regex.regex.substring(1);
		var c, previous;
		while (true) { // todo: a-z ...
			if (regex.regex.length == 0) {
				result.type = 'n/a';
				result.label = 'Character class is not finished';
				regex.hasError = true;
				break;
			}
			c = regex.regex.substring(0, 1);
			if (c == '^' && result.tag == '[') {
				result.tag += '^';
				result.label = "Negation, matches any single character that is not in list";
			} else if (c == ']' && previous != '\\') {
				result.tag += ']';
				regex.regex = regex.regex.substring(1);
				break;
			} else {
				result.tag += c;
			}
			regex.regex = regex.regex.substring(1);
		}
		regex.tag += result.tag;
	}
	readRegEx(regex) {
		const self = this;
		var result = null;
		var exit = false;
		// var alterProcess = true;
		while (!exit) {
			if (regex.regex == '') {
				break;
			}
			var c = regex.regex.substring(0, 1);
			switch(c){
				case '\\':
						this.readEscape(regex);
					break;
				case '[':
						this.readCharacterClass(regex);
					break;
				case '.':
						result = new RegexPart( {type:'class', label: "Matches any single character except new line (\\n)", tag: '.'});
						regex.regex = regex.regex.substring(1);
						regex.result.push(result);
						regex.tag += result.tag;
					break;
				case '^':
						result = new RegexPart( {type:'anchor', label: "Matches the beginning of the input", tag: '^'});
						regex.regex = regex.regex.substring(1);
						regex.result.push(result);
						regex.tag += result.tag;
					break;
				case '$':
						this.readSubstitution(regex);
					break;
				case '#':
						prefix.label = 'Comment';
						if (regex.regex.indexOf("\n") !== -1 ) {
							result =new RegexPart( {type:'miscellaneous ', label: "Comment", tag: regex.regex.substring(0, regex.regex.indexOf("\n") + 1)});
							regex.regex = regex.regex.substring(regex.regex.indexOf("\n")+1);
							regex.result.push(result);
							regex.tag += result.tag;
						} else {
							result =new RegexPart( {type:'miscellaneous ', label: "Comment", tag: regex.regex.substring(0, regex.regex.length + 1)});
							regex.regex = '';
							regex.result.push(result);
							regex.tag += result.tag;
						}
					break;
				case '(':
						var result =new RegexPart( {type:'class'});
						regex.result.push(result);
						var prefixArray = [{tag: '(?:', label: 'Defines a noncapturing group'},
							{tag: '(?=', label: 'Zero-width positive lookahead assertion'},
							{tag: '(?!', label: 'Zero-width negative lookahead assertion'},
							{tag: '(?>', label: 'Nonbacktracking (or "greedy") subexpression'},
							{tag: '(?imnsx-imnsx:', label: 'Applies the specified options within subexpression'},
							{tag: '(?<=', label: 'Zero-width positive lookbehind assertion'},
							{tag: '(?<!', label: 'Zero-width negative lookbehind assertion'},
							{tag: '(?<'},
							{tag: '(?('},
							{tag: '(?#', label: 'Comment'},
							{tag: '(', label: 'Captures the matched subexpression and assigns it a one-based ordinal number'},
						];
						// alterProcess = false;
						prefixArray.some(function(prefix) {
							if (regex.regex.length >= prefix.tag.length && regex.regex.substring(0, prefix.tag.length) == prefix.tag) {
								if (prefix.tag == '(?<') {
									if (regex.regex.indexOf('>') !== -1) {
										prefix.tag = regex.regex.substring(0, regex.regex.indexOf('>') + 1);
										if (prefix.tag.indexOf('-') !== -1) {
											prefix.label = ' Defines a balancing group definition';
										} else {
											prefix.label = 'Captures the matched subexpression into a named group';
										}
									} else {
										regex.regex = regex.regex.substring(prefix.tag.length);
										result.type = 'n/a';
										result.tag = prefix.tag;
										result.label = 'named group is not closed';
										regex.hasError = true;
										return true;
									}
								} else if (prefix.tag == '(?(') {
									if (regex.regex.indexOf(')') !== -1 && regex.regex.indexOf(')', regex.regex.indexOf(')')+1) !== -1) {
										prefix.tag = regex.regex.substring(0, regex.regex.indexOf(')', regex.regex.indexOf(')')+1) + 1);
										prefix.label = 'Matches yes if the regular expression pattern designated by expression matches or named group; otherwise, matches the optional no part. expression is interpreted as a zero-width assertion';
										regex.tag = regex.regex.substring(0, prefix.tag.length);
										regex.regex = regex.regex.substring(prefix.tag.length);
										return true; // ok
									} else {
										regex.regex = regex.regex.substring(prefix.tag.length);
										result.tag = prefix.tag;
										result.type = 'n/a';
										result.label = 'alternation is not closed';
										regex.hasError = true;
										return true;
									}				
								} else if (prefix.tag == '(?#') {
									if (regex.regex.indexOf(')') !== -1 ) {
										result.tag = regex.regex.substring(0, regex.regex.indexOf(')') + 1);
										result.label = 'Inline comment';
										regex.tag = regex.regex.substring(0, prefix.tag.length);
										regex.regex = regex.regex.substring(prefix.tag.length);
										return true; //ok
									} else {
										regex.regex = regex.regex.substring(prefix.tag.length);
										regex.tag = prefix.tag;
										result.type = 'n/a';
										result.label = 'Comment is not closed';
										regex.hasError = true;
										return true;
									}				
								}
								result.label = prefix.label;
								result.tag = regex.regex.substring(0, prefix.tag.length);
								regex.regex = regex.regex.substring(prefix.tag.length);
								result.regex = regex.regex;
								result.result = [];
								self.readRegEx(result);
								if (result.hasError === true) {
									regex.hasError = true;
								}
								regex.regex = result.regex;
								if (regex.regex.substring(0, 1) == ')') {
									result.from = prefix.tag;
									result.to = ')';
									result.tag += regex.regex.substring(0, 1);
									regex.regex = regex.regex.substring(1);
								} else {
									result.type = 'n/a';
									result.label = 'sub expression is not closed';
									regex.hasError = true;
								}
								return true;
							}
							return false;
						});
						regex.tag += result.tag;
					break;
				case ')':	
						// regex.tag += ')';
						// regex.regex = regex.regex.substring(1);
						exit = true;
						
						break; // end subexpression
					break;
				case '*':
						if (regex.regex.length >= 2 && regex.regex.substring(1, 2) == '?') {
							result = new RegexPart({type:'quantifier', label: "Matches the previous element zero or more times, but as few times as possible", tag: '*?'});
							regex.regex = regex.regex.substring(2);
						} else {
							result = new RegexPart({type:'quantifier', label: "Matches the previous element zero or more times", tag: '*'});
							regex.regex = regex.regex.substring(1);
						}
						
						regex.tag += result.tag;
						regex.result.push(result);
					break;
				case '+':
						if (regex.regex.length >= 2 && regex.regex.substring(1, 2) == '?') {
							result = new RegexPart({type:'quantifier', label: "Matches the previous element one or more times, but as few times as possible.", tag: '+?'});
							regex.regex = regex.regex.substring(2);
						} else {
							result = new RegexPart({type:'quantifier', label: "Matches the previous element one or more times", tag: '+'});
							regex.regex = regex.regex.substring(1);
						}
						
						regex.tag += result.tag;
						regex.result.push(result);
					break;
				case '?':
						if (regex.regex.length >= 2 && regex.regex.substring(1, 2) == '?') {
							result = new RegexPart({type:'quantifier', label: "Matches the previous element zero or one time, but as few times as possible", tag: '??'});
							regex.regex = regex.regex.substring(1);
						} else {
							result = new RegexPart({type:'quantifier', label: "Matches the previous element zero or one time", tag: '?'});
							regex.regex = regex.regex.substring(1);
						}
						regex.tag += result.tag;
						regex.result.push(result);
					break;
				case '{':
						this.readTimeQuantifier(regex);
					break;
				case '|':
						result = new RegexPart({type:'alternation', label: "Matches any one element separated by the vertical bar", tag: '|'});
						regex.regex = regex.regex.substring(1);
						regex.result.push(result);
						regex.tag += result.tag;
					break;	
				default:
					if (regex.result.length > 0 && regex.result[regex.result.length - 1].type == 'string') {
						regex.result[regex.result.length - 1].tag += c;
						regex.tag += c;
					} else {
						result = new RegexPart({type:'string', label: "Matches the characters [tag] ", tag: c});
						regex.tag += c;
						regex.result.push(result);
					}
					regex.regex = regex.regex.substring(1);
			}
		}
		//if (alterProcess) {
			var alternation = null;
			var alter = null;
			regex.result.forEach(function (result, index) {
					if (result.type == 'alternation') {
						if (alternation == null) {
							alternation = result;
							alter = new RegexPart({type:'altern', tag: ''});
							alter.result = regex.result.slice(0, index);
							alter.result.forEach(function (subresult) {
								if (subresult.hasError) {
									alter.hasError = subresult.hasError;
									alternation.hasError = result.hasError;
								}
							});
							alternation.result.push(alter);
							
							alter = new RegexPart({type:'altern', tag: ''});
							alternation.result.push(alter);
						} else {
							alter = new RegexPart({type:'altern', tag: ''});
							alternation.result.push(alter);						
						}
					} else {
						if (alternation !== null) {
							alternation.result[alternation.result.length-1].result.push(result);
							if (result.hasError) {
								alternation.result[alternation.result.length-1].hasError = result.hasError;
								alternation.hasError = result.hasError;
							}
						}
					}
			});
			if (alternation) {
				regex.type = 'expression';
				regex.hasError = alternation.hasError;
				regex.result = alternation.result;
				regex.label = alternation.label;
				
				regex.result.forEach(function (result, index) {
					result.section =  self.getTextPos(index + 1) + " alternative"
				});			
			}	
		//}
	}
	getTextPos(index) {
		return (Number(index) == 1 ? '1st' : (Number(index) == 2 ? '2nd' : (Number(index) == 3 ? '3rd' : Number(index).toString() + "th" ) ) );
	}
	
	explain (regex) {
		var regex = new RegexPart({regex: regex});
		this.readRegEx(regex);
		if (regex.regex.length > 0) {
			var result = new RegexPart({type:'n/a ', label: "regex is not closed", tag: regex.regex});
			regex.regex = '';
			regex.result.push(result);
			regex.hasError = true;
		}
		return regex;
	}
}
