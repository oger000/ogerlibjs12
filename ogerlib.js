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



