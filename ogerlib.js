/**
#LICENSE BEGIN
#LICENSE END
*/



/**
* Fake Oger namespace. (maybe better use constructor function?)
*/
if (typeof Oger == 'undefined') {
	Oger = {};
}


/**
* Marker for (later) localisation.
*/
Oger.l10nValue = new Object();  // used as associative array
Oger._ = function(text) {
	// var key = text.replace(/[^a-z0-9_]/gi, '_');
	var key = text.replace(/\W/g, '_');
	return (Oger.l10nValue[key] ? Oger.l10nValue[key] : text);
};



/**
* Get object by object name as string (allow namespace)
* see: http://stackoverflow.com/questions/4981671/access-namespaced-javascript-object-by-string-name-without-using-eval
*/
Oger.getObjByName = function (objName) {

	var obj = window;

	var parts = objName.split('.');
	for (var i = 0, len = parts.length; i < len; ++i) {
		obj = obj[parts[i]];
	}

	return obj;
}  // eo get object by name
