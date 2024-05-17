#!/usr/local/bin/ruby

require 'json'
require 'ostruct'

response = JSON.parse('{"infinity": false, "matchArray": [], "substitution": ""}')

inputs_file = File.open(ARGV[0], "r:UTF-8")

inputs_data = inputs_file.read

json = JSON.parse(inputs_data)

flags = 0

if json["flags"].include? "i"
	flags = flags | Regexp::IGNORECASE
end

if json["flags"].include? "m"
	flags = flags | Regexp::MULTILINE
end

if json["flags"].include? "x"
	flags = flags | Regexp::EXTENDED
end

regex = Regexp.new(json["pattern"], flags)

res = []

if not json["flags"].include? "g"
	match = regex.match(json["subject"])
	if not match.nil?
		m = JSON.parse('{"index": 0, "m": ""}')
		m["index"] = match.begin(0);
		m["m"] = match[0];
		response["matchArray"].push(m);
	end
	response["substitution"] = json["subject"].sub(regex, json["substitution"])
else
	index = 0
	match = regex.match(json["subject"], index)
	while not match.nil? do
		m = JSON.parse('{"index": 0, "m": ""}')
		m["index"] = match.begin(0);
		m["m"] = match[0];
		response["matchArray"].push(m);
		index = match.begin(0) + 1
		match = regex.match(json["subject"], index)
	end
 	response["substitution"] = json["subject"].gsub(regex, json["substitution"])
end

print JSON.generate(response) 

=begin
json["subject"].scan(regex) do |c|
  res << [c, $~.offset(0)[0]]
end

if not json["flags"].include? "g"
	if res.length() > 0
		res = res[0]
	end
	response["substitution"] = json["subject"].sub(regex, json["substitution"])
else
 	response["substitution"] = json["subject"].gsub(regex, json["substitution"])
end 

for match in res
	m = JSON.parse('{"index": 0, "m": ""}')
	m["index"] = match[1];
	m["m"] = match[0];
	response["matchArray"].push(m);
end

print JSON.generate(response) 
=end