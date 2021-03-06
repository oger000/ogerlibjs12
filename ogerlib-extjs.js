/**
#LICENSE BEGIN
**********************************************************************
* OgerArch - Archaeological Database is released under the GNU General Public License (GPL) <http://www.gnu.org/licenses>
* Copyright (C) Gerhard Öttl <gerhard.oettl@ogersoft.at>
**********************************************************************
#LICENSE END
*/



/**
* Fake Oger namespace. (maybe better use constructor function?)
*/
if (typeof Oger == 'undefined') {
	Oger = {};
}
if (typeof Oger.extjs == 'undefined') {
	Oger.extjs = {};
}




/*
* Force that the upper left corner of an Extjs object to be displayed inside the
* boundery of another Extjs object. The moved object is not resized.
* If you also want the object also to be resized to fit into the outer objet,
* than use Oger.extjs.adjustToFit().
* Compnonent and viewPort must be visible to work.
* @cmp: Any visible Extjs component that is resized and positioned if not fit.
* @viewpoint: Any visible Extjs object that defines the boundery.
*             If not provided the browser windows is taken.
*/
Oger.extjs.moveToFit = function(cmp, viewPort) {

	// see comment block in Oger.extjs.adjustToFit
	// for more posibilities to detect browser size

	var vp = {
		x: 0,
		y: 0,
		width: window.innerWidth,
		height: window.innerHeight,
	}
	if (viewPort) {
		vp.x = viewPort.getPosition()[0];
		vp.y = viewPort.getPosition()[1];
		vp.width = viewPort.getWidth();
		vp.height = viewPort.getHeight();
	}

	var c = {}
	c.x = c.oriX = cmp.getPosition()[0];
	c.y = c.oriY = cmp.getPosition()[1];
	c.width = c.oriWidth = cmp.getWidth();
	c.height = c.oriHeight = cmp.getHeight();


	// test right, bottom, left, top
	// this order forces the left upper corner into the
	// most upper left position inside the viewport
	c.x = Math.min(c.x, vp.x + vp.width - c.width);
	c.y = Math.min(c.y, vp.y + vp.height - c.height);
	c.x = Math.max(c.x, vp.x);
	c.y = Math.max(c.y, vp.y);

	if (c.x != c.oriX || c.y != c.oriY) {
		cmp.setPosition(c.x, c.y);
	}
}  // eo move



/*
* Force an Extjs object to be displayed inside the boundery of another Extjs object.
* Component and viewPort must be visible to work.
* @cmp: Any visible Extjs component that is resized and positioned if not fit.
* @viewpoint: Any visible Extjs object that defines the boundery.
*             If not provided the browser windows is taken.
* @autoScroll: Defines if autoScroll should be set, if the window size is altered (shrinked).
*/
Oger.extjs.adjustToFit = function(cmp, viewPort) {

/*
	// ONLY FOR DOCUMENTATION

	var viewportwidth;
	var viewportheight;

	// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight

	if (window.innerWidth != undefined) {
		viewPortwidth = window.innerWidth,
		viewPortheight = window.innerHeight
	}

	// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)

	else if (document.documentElement != undefined &&
					 document.documentElement.clientWidth != undefined &&
					 document.documentElement.clientWidth != 0) {
		viewPortwidth = document.documentElement.clientWidth,
		viewPortheight = document.documentElement.clientHeight
	}

	// older versions of IE

	else {
		viewPortwidth = document.getElementsByTagName('body')[0].clientWidth,
		viewPortheight = document.getElementsByTagName('body')[0].clientHeight
	}

	// maybe try: document.body.clientHeight
*/

	var vp = {
		x: 0,
		y: 0,
		width: window.innerWidth,
		height: window.innerHeight,
	}
	if (viewPort) {
		vp.x = viewPort.getPosition()[0];
		vp.y = viewPort.getPosition()[1];
		vp.width = viewPort.getWidth();
		vp.height = viewPort.getHeight();
	}

	var c = {}
	c.x = c.oriX = cmp.getPosition()[0];
	c.y = c.oriY = cmp.getPosition()[1];
	c.width = c.oriWidth = cmp.getWidth();
	c.height = c.oriHeight = cmp.getHeight();

	// if size does not fit at all, than resize first.
	// to minimize resize events apply at once
	c.width = Math.min(c.width, vp.width);
	c.height = Math.min(c.height, vp.height);

	if (c.width != c.oriWidth || c.height != c.oriHeight) {
		cmp.setSize(c.width, c.height);
	}

	// now size of window fits, so we can move to final location
	Oger.extjs.moveToFit(cmp, viewPoint);
}  // eo adjust



/*
* General handler for form action errors.
* On "insufficient" handled failures return false to notify
* that subsequent handling is expected.
*
* ux-overwrite in Ext.data.Connection.prototype.createResponse
* preprocess an empty response:
* create an error message and
* change an empty response to '{"success":false}'
* so extjs handles this as error in (i hope so) most cases
*
* form.submit:
* - php-parse error: submit.success
* - uncaught php exception: submit.success
* - empty response: submit.success
* - success=false: submit.failure
* form.load:
* - php-parse error:
* - uncaught php exception:
* - empty response:
* - success=false:
*/
Oger.extjs.showFormActionFailure = function(form, action) {

	switch (action.failureType) {

		case Ext.form.Action.CLIENT_INVALID:
			if (form) {
				Oger.extjs.showInvalidFields(form);
			}
			//Ext.create('Oger.extjs.MessageBox').alert(Oger._('Fehler'), Oger._('Fehler im Formular. Bitte korrekt ausfüllen.'));
			return true;

		case Ext.form.Action.CONNECT_FAILURE:
			Ext.create('Oger.extjs.MessageBox').alert(
				Oger._('Fehler'),
				Oger._('Fehler bei der Datenübertragung. Eventuell nochmal versuchen.'));
			return true;

		case Ext.form.Action.SERVER_INVALID:

			//Ext.create('Oger.extjs.MessageBox').alert(Oger._('Fehler'), Oger._('Serverapplikation meldet successfull=false.'));

			// if response has msg property we show this
			// and hope that this is a failure message
			var isHandled = false;
			if (action.result && action.result.msg) {
				Ext.create('Oger.extjs.MessageBox').alert(
					Oger._('Fehler (App)'),
					action.result.msg);
				isHandled = true;
			}

			// last resor for server failure
			if (!isHandled) {
				var responseText = '';
				if (action && action.response && action.response.responseText) {
					responseText = ' ' + action.response.responseText;
				}
				Ext.create('Oger.extjs.MessageBox').alert(
					Oger._('Fehler (Server)'),
					//Oger._('Antwort des Servers leer oder ohne Erfolgskennung.') + responseText);
					// hide details
					Oger._('Antwort des Servers leer oder ohne Erfolgskennung.'));
			}
			break;

		case Ext.form.Action.LOAD_FAILURE:
			Ext.create('Oger.extjs.MessageBox').alert(
				Oger._('Fehler'),
				Oger._('Fehler beim Laden von Daten oder keine Daten bereitgestellt.'));
			// this can not be (or should not be) handled generaly, so do not return with true
			break;

		default:
			Ext.create('Oger.extjs.MessageBox').alert(
				Oger._('Fehler'),
				Oger._('Unbekannter Submit/Action-Fehlertyp:' + action.failureType + '.'));
			// this can not be (or should not be) handled generaly, so do not return with true
			break;

	}  // eo switch

	return false;
}; // eo form action error handler



/*
* General handler for ajax failures
*/
Oger.extjs.showAjaxFailure = function(response, opts) {

	Ext.create('Oger.extjs.MessageBox').alert(
		Oger._('Fehler'),
		Oger._('Request: ') + opts.url + '.<br>' +
			Oger._('Response: ') + response.status + ' ' + response.statusText + '.'
	);

}; // eo ajax error handler



/**
 * Create info about dirty fields
 */
Oger.extjs.getDirtyFieldsInfo = function(form) {

	// if no form given it cannot be dirty?
	if (!form) {
		return true;
	}

	// if a form panel is given than get the underlaying basic form
	if (typeof form.getForm == 'function') {
		form = form.getForm();
	}

	var dirtyMsg = '';

	var dirtyFlag = form.isDirty();
	if (dirtyFlag) {   // use own dirty flag instead of form.isDirty()

		dirtyMsg = Oger._('Geändert:');
		//dirtyMsg += ' ' + form.getValues(true, true);

		var processField = function(field) {
			if (field.isXType('radiogroup') || field.isXType('checkboxgroup')) {
				// items are separate fields so handling of group is not necessary
			}
			else {
				if (field.isDirty()) {
					dirtyMsg += ' ' + field.fieldLabel + ' (' + field.name + ')';
					if (field.isXType('radiofield') || field.isXType('checkboxfield')) {
						dirtyMsg += '[' + field.inputValue + ']';
					}
					var curValue = field.getValue();
					dirtyMsg +=
					': old=' + (typeof field.originalValue == 'string' ? "'" : '') +
						field.originalValue + (typeof field.originalValue == 'string' ? "'" : '') +
					', new=' + (typeof curValue == 'string' ? "'" : '') +
						curValue + (typeof curValue == 'string' ? "'" : '') + ';';
				};
			}
		};

		form.getFields().each(processField);
	}  // eo show msg

	return dirtyMsg;
}  // eo dirty fields message



/*
 * Memo from: http://stackoverflow.com/questions/6261013/extjs-message-box-with-custom-buttons
 * for confirmDirtyClose and confirmDirtyAction

	Ext.define('App.view.MyDialog', {
		show: function() {
				var dialog = Ext.create('Oger.extjs.MessageBox', {
						buttons: [{
								text: 'baz',
								iconCls: 'icon-add',
								handler: function() {
										dialog.close();
								}
						}]
				});

				dialog.show({
						title: 'foo!',
						msg: '<p>bar?</p>',
						icon: Ext.MessageBox.WARNING
				});

				dialog.setHeight(160);
				dialog.setWidth(420);
		}
});
var dialog = Ext.create('App.view.MyDialog');
dialog.show();
*/

/*
* Ask to continue action even if form dirty
* @args: object with parameters
*        Members are:
*        - form: (mandatory) FormPanel or BasicForm
*        - title: (optional) title for the confirmation window
*        - msg: (mandatory) message for the confirmation window
*        - yesFn: (mandatory) action for yes button
*        - yesText: (optional) alternate text for yes button
*        - yesFnArgs: (optional) arguments for yes function NOT IMPLEMENTED
*        - noFn: (optional) action for no button
*        - noText: (optional) alternate text for no button
*        - noFnArgs: (optional) arguments for no function NOT IMPLEMENTED
*        - cancelText: (optional) alternate text for cancel button
*        (and may be later TODO parameters for the called functions)
* For now no args are passed to yes and no functions. Must be implemented if needed.
*/
Oger.extjs.confirmDirtyAction = function(args) {

	var form = args.form;
	if (typeof form.getForm == 'function') {
		form = form.getForm();
	}

	// only ask if form is dirty
	// (normaly this method should only be called if the form is dirty !!!)
	if (form.isDirty()) {

		var title = (args.title ? args.title : Oger._('Bestätigung erforderlich'));
		var msg = (args.msg ? args.msg : Oger._('Message fehlt!'));

		var yesText = (args.yesText ? args.yesText : Oger._('Ja'));
		var noText = (args.noText ? args.noText : Oger._('Nein'));
		var cancelText = (args.cancelText ? args.cancelText : Oger._('Abbrechen'));

		var confirmWin = Ext.create('Ext.window.Window', {
			title: title,
			width: 400,
			height: 200,
			modal: true,
			autoScroll: true,
			layout: 'fit',
			border: false,

			items: [
				{ xtype: 'form',
					layout: 'fit',
					bodyPadding: 15,
					items: [
						{ xtype: 'textarea', value: msg, fieldStyle: 'text-align:center;border:none;',
							fieldStyle: 'text-align:center;border:none;',
						},
					]

				}
			],

			buttonAlign: 'center',
			buttons: [
				{ text: yesText,
					handler: function(button, event) {
						args.yesFn();
						this.up('window').close();
					},
				},
				{ text: cancelText,
					handler: function(button, event) {
						// do nothing
						this.up('window').close();
					},
				},
				{ text: Oger._('Details'),
					handler: function(button, event) {
						Ext.create('Oger.extjs.MessageBox').alert(
							Oger._('Ungespeicherte Änderungen - Details'),
							Oger.extjs.getDirtyFieldsInfo(form));
					},
				},
			],
		});

		if (noText) {
			var buttonPanel = confirmWin.getDockedItems('toolbar')[0];
			if (buttonPanel) {
				buttonPanel.insert(1, Ext.create('Ext.Button', {
					text: noText,
					handler: function(button, event) {
						if (args.noFn) {
							args.noFn();
						}
						this.up('window').close();
					},
				}));
			}
		}

		confirmWin.show();
		return false;
	}

}  // eo confirm action on dirty form



/*
* Ask to force window close
* @panel: Panel (or window) that should be closed
* @form: FormPanel or BasicForm to test for dirty state
*/
Oger.extjs.confirmDirtyClose = function(win, form) {

	if (!form) {
		form = win.down('form');
	}
	if (typeof form.getForm == 'function') {
		form = form.getForm();
	}

	if (form.isDirty()) {
		Oger.extjs.confirmDirtyAction({
			form: form,
			msg: Oger._('Ungespeicherte Änderungen vorhanden. Fenster trotzdem schliessen?'),
			yesFn: function() { Oger.extjs.resetDirty(form); win.close() },
		});

		return false;
	}
}  // eo confirm force close



/*
* Default on before win close handler
* Checks for dirty form fields and ask for close.
* @panel: Panel (or window) that should be closed
*/
Oger.extjs.defaultOnBeforeWinClose = function(win) {

	return Oger.extjs.confirmDirtyClose(win);
}  // eo default on before win close



/*
* Ask to reset dirty form
* @form: FormPanel or BasicForm to test for dirty state
*/
Oger.extjs.confirmDirtyReset = function(form) {

	if (typeof form.getForm == 'function') {
		form = form.getForm();
	}

	if (form.isDirty()) {
		Oger.extjs.confirmDirtyAction({
			form: form,
			msg: Oger._('Ungespeicherte Änderungen vorhanden. Änderungen zurücksetzen?'),
			yesFn: function() { form.reset() },
		});

		return false;
	}
}  // eo confirm reset form



/**
* Unset the dirty state of a form
* @form: Form which dirty state should be removed
*/
Oger.extjs.resetDirty = function(form) {

	// if a form panel is given than get the underlaying basic form
	if (typeof form.getForm == 'function') {
		form = form.getForm();
	}

	var processField = function(field) {
		if (field.isXType('radiogroup') || field.isXType('checkboxgroup')) {
			// group items are separate fields so handling of group is not necessary
		}
		else {
			field.resetOriginalValue();
		}
	};

	form.getFields().each(processField);
};  // eo reset dirty



/*
* Empty all fields of a form
* @form: Form for which the fields should be set to empty
* Works for date fields too, even if null would be the correct empty value.
*/
Oger.extjs.emptyForm = function(form, opts) {

	if (!form) {
		return;
	}

	// for backward compability where second param was boolan resetDirty param
	var resetDirty = null;
	if (typeof(opts) == 'boolean') {
		opts = { resetDirty: opts };
	}

	opts = opts || {};


	// force single field name to array
	if (opts.exclude && !Array.isArray(opts.exclude)) {
		opts.exclude = [ opts.exclude ];
	}

	// if a form panel is given than get the underlaying basic form
	if (typeof form.getForm == 'function') {
		form = form.getForm();
	}

	var processField = function(field) {
		if (opts.exclude
				&& opts.exclude.indexOf(field.getName()) > -1) {
			return;
		}

		if (field.isXType('radiogroup') || field.isXType('checkboxgroup')) {
			// group items are separate fields so handling of group is not necessary
		}
		else if (field.isXType('radiofield') || field.isXType('checkboxfield')) {
			field.setValue(false);
		}
		else {
			field.setValue('');
		}
	};

	form.getFields().each(processField);

	if (opts.resetDirty) {
		Oger.extjs.resetDirty(form);
	}
};  // eo empty form



/**
* Get invalid fields
* @form: Form to test the fields
*/
Oger.extjs.getInvalidFieldsInfo = function(form) {

	// if a form panel is given than get the underlaying basic form
	if (typeof form.getForm == 'function') {
		form = form.getForm();
	}

	var invalidFields = '';

	var processField = function(field) {
		// include radiogroup and checkbox group
		if (!field.isValid()) {
			invalidFields += (invalidFields ? ', ' : '') + field.fieldLabel + ' (' + field.name + ')';
		}
	};

	form.getFields().each(processField);

	return invalidFields;
};  // eo get fields that do not valid



/**
 * Show windows with invalid field names
*/
Oger.extjs.showInvalidFields = function(form) {

	if (!form) {
		return;
	}
	if (typeof form.getForm == 'function') {
		form = form.getForm();
	}
	if (form.isValid()) {
		return;
	}

	var win = Ext.create('Ext.window.Window', {
		title: Oger._('Fehler'),
		width: 300,
		height: 200,
		modal: true,
		autoScroll: true,
		layout: 'fit',

		items: [
			{ xtype: 'panel',
				html: Oger._('Fehler im Formular. Bitte korrekt ausfüllen.'),
			}
		],

		buttonAlign: 'center',
		buttons: [
			{ text: Oger._('Ok'),
				handler: function(button, event) {
					this.up('window').close();
				},
			},
			{ text: Oger._('Details'),
				handler: function(button, event) {
					Ext.create('Oger.extjs.MessageBox').alert(
						Oger._('Formularfehler - Details'),
						Oger._('Feldnamen: ') + Oger.extjs.getInvalidFieldsInfo(form));
				},
			},
		],
	});
	win.show();

}  // eo invalid fields window


/**
* Repair invalid combo values. (set to null by error)
* Necessary for Extjs 4.1.x to include comboboxes that
* change their content from anything to empty string
* (and the empty string has no key?).
* This change result in an key value of null which
* is not submitted by default.
* @form: Form to test the fields
*/
Oger.extjs.repairComboValues = function(form) {

	// if a form panel is given than get the underlaying basic form
	if (typeof form.getForm == 'function') {
		form = form.getForm();
	}

	var processField = function(field) {
		if (field.isXType('combo')) {
			if (field.getSubmitValue() === null && field.originalValue != null) {
				field.setValue('');
			}
		}
	};

	form.getFields().each(processField);

	return true;
};  // eo repair combo values


/**
* Show a generic form saved message
*
* OBSOLTED becase unused for a long time
*/
/*
Oger.extjs.submitMsg = function(success, addMsg) {
	if (typeof success == 'undefined' || success === null) {
		success = true;
	}
	if (typeof addMsg == 'undefined' || addMsg === null) {
		addMsg = '';
	}
	if (success) {
		Ext.create('Oger.extjs.MessageBox').alert(
			Oger._('Ergebnis'),
			Oger._('Datensatz wurde erfolgreich gespeichert.' + addMsg));
	}
	else {
		Ext.create('Oger.extjs.MessageBox').alert(
			Oger._('Fehler'),
			Oger._('Datensatz konnte nicht gespeichert werden.'));
	}

};  // eo saved ok message
*/


/**
* Show a generic wait window for given millis
 *
 * OBSOLETED because using instances of Oger.extjs.MessageBox
 * instead of Ext.Msg (or Ext.MesageBox) singleton
 * resolves the problem.
 * Remains only for docu to avoid writing again
*/
/*
Oger.showWaitWin = function(milli, modal) {

	//Ext.create('Oger.extjs.MessageBox').wait(Oger._('Das dauert leider etwas ...'), Oger._('Bitte warten'));
	//Ext.Function.defer(function() { Ext.Msg.hide; }, milli);

	// Ext.Message is overwritten by any other error message and overwrites other messages too
	// so use a self designed wait window

	// modal defaults to true
	if (modal == undefined || modal == null) {
		modal = true;
	}

	var waitWin = Ext.create('Ext.window.Window', {
		title: Oger._('Bitte Warten'),
		width: 300,
		height: 250,
		modal: modal,
		autoScroll: true,
		layout: 'fit',
		items: [
			{ xtype: 'form',
				layout: 'fit',
				items: [
					{ xtype: 'textarea', value: Oger._('Das dauert leider etwas länger ...'), disabled: true },
				]
			},
		],
	});
	waitWin.show();
	//waitWin.toFront();
	Ext.Function.defer(function() { waitWin.close(); }, milli);

}  // eo show wait window
*/



/**
 * Reset form
 * form.reset() does not reset null values in hidden fields and
 *              does not reset values of FileField
 * @form: Form which dirty state should be removed
 *
 * OBSOLETED because not better than original extjs form.reset()
 * Remains only for docu to avoid writing again
 */
 /*
Oger.extjs.resetForm = function(form) {

	// if a form panel is given than get the underlaying basic form
	if (typeof form.getForm == 'function') {
		form = form.getForm();
	}

	// I am unable to reset FileField too, so use reset of ext
	form.reset();
	return;

	// OBSOLETE for now
	var processField = function(field) {
		if (field.isXType('radiogroup') || field.isXType('checkboxgroup')) {
			// group items are separate fields so handling of group is not necessary
		}
		else {
			// field.setValue(field.originalValue);
			// fileField has no setValue nor does "field.value = field.originalValue" work
			// nor works field.reset() but something we must use
			field.reset();
		}
	};

	form.getFields().each(processField);
};  // eo reset form
*/



/**
 * Create component once by reusing existing xtype or component class
 * memo: use query controls like '?', '?xtype', '?class'  ???
 */
Oger.extjs.createOnce = function (query, className, classDef) {

	if (!query) {
		var o = Oger.getObjByName(className);
		query = o.xtype;  // or use o.prototype.alias[0] (without widget prefix) ???
	}

	// fallback to class name
	if (!query && className) {
		query = 'component[$className=' + className + ']';
	}

	var cmp = null;
	if (query) {
		cmp = Ext.ComponentQuery.query(query)[0];
	}

	if (!cmp) {
		// if no classname is given, then we expect the query to be a widget alias (xtype)
		if (!className) {
			cmp = Ext.widget(query, classDef);
		}
		else {
			cmp = Ext.create(className, classDef);
		}
	}

	return cmp;
}  // eo create once



/**
 * Get request parameters for store read (load?) action
 * see <http://stackoverflow.com/questions/11241803/how-do-you-get-all-store-parameters-extjs-4-1>
 * This only works for ext version 4.x
 */
Oger.extjs.getStoreActionParams = function (store) {

	if (Ext.getVersion().major > 4) {
		return Oger.extjs.getStoreRequestParams(store);
	}

	var op = new Ext.data.Operation({
		groupers:   store.groupers.items,
		page:       store.currentPage,
		start:      (store.currentPage - 1) * store.pageSize,
		limit:      store.pageSize,
		addRecords: false,
		action:     'read',
		filters:    store.filters.items,
		sorters:    store.getSorters(),
	});

	var req = store.getProxy().buildRequest(op);
	return req.params;
}  // eo get store action params


/**
 * Get request parameters for store read (load?) action
 * For ext version > 4
 */
Oger.extjs.getStoreRequestParams = function (store) {

		/*
		 * THIS DOES NOT WORK, so we have to collect step by step (see below)
		var op = proxy.createOperation('read');
		var req = store.getProxy().buildRequest(op);
		var x = req.params;
		var u = proxy.buildUrl(req);
		*/

		var parms = {};

		if (store.currentPage) {
			parms.page = store.currentPage;
		}
		var limit = store.getPageSize();
		if (limit) {
			parms.limit = limit;
		}
		var start = (store.currentPage - 1) * store.getPageSize();
		if (start && store.getPageSize()) {
			parms.start = start;
		}

		var proxy = store.getProxy();
		var extraParam = proxy.getExtraParams();
		if (extraParam) {
			parms = Ext.Object.merge(parms, extraParam);
		}

		var sorters = store.getSorters();
		var sortArr = [];
		if (sorters && sorters.items.length) {
			// var sx = { sort: proxy.encodeSorters(sorters) };  // buggy
			Ext.Array.each(sorters.items, function(item) {
				sortArr.push({ property: item.getProperty(), direction: item.getDirection() });
			});
			parms.sort = Ext.JSON.encode(sortArr);
		}

		var filters = store.getFilters();
		var filterArr = [];
		if (filters && filters.items.length) {
			// var fx = { filter: proxy.encodeFilters(filters) };  // buggy
			Ext.Array.each(filters.items, function(item) {
				filterArr.push({ property: item.getProperty(), value: item.getValue() });
			});
			parms.filter = Ext.JSON.encode(filterArr);
		}

		// Only add grouping options if grouping is remote
		// UNTESTED !!! maybe need preparation like sorters and filteres ???
		var groupers = store.getGrouper();
		var groupArr = []
		if (store.getRemoteSort() && groupers && groupers.items.length) {
			Ext.Array.each(groupers.items, function(item) {
				groupArr.push({ property: item.getProperty() /*, value: item.getValue() */ });
			});
			parms.grouper = Ext.JSON.encode(groupArr);
		}

	return parms;
}  // eo get store action params (ext > 4.x)


/**
 * Show messagebox that expires after timeout and does autoclose.
 */
Oger.extjs.expireAlert = function (title, msg, fn, scope, timeout) {

	if (timeout == null) {
		timeout = 1000;
	}

	var mbox = Ext.create('Oger.extjs.MessageBox');
	mbox.alert(title, msg, fn, scope);
	Ext.Function.defer(function() { mbox.close(); }, timeout);
}  // eo flash msg




/**
 * Define Extjs Messagebox with close action destroy
 */
// use safety guide to avoid duplicate definition if
// coexisting with extjs4.js from ogerlibjs (pre12)
if (typeof Oger.extjs.MessageBox == 'undefined') {
Ext.define('Oger.extjs.MessageBox', {
	extend: 'Ext.window.MessageBox',
	alias: 'widget.ogerMsgBox',
	//closeAction: 'destroy',

	listeners: {
		hide: function(cmp, opts) {
			cmp.destroy();
		},
	},
});  // eo oger message box
}  // eo safety guide



