/**
 * StarExec namespace
 * Let's try to put global vars here going forward
 */
var star = star || {};

/**
 * Contains javascript relevant to all pages within starexec
 */

// When the document is ready to be executed on
$(document).ready(function() {
	"use strict";

	// If the JSP contains a single message to display to the user...
	if ($(".message").length == 1) {

		// Extract the text from the message element
		var messageText = $(".message").text();

		// Determine which class it is (error, warn, info, success)
		// This class MUST come first in the class list if specified in HTML
		var messageClass = $('.message').attr('class').split(' ')[0];

		// Remove the old message element from the DOM
		$(".message").remove();

		// Show the message to the user (we do this programatically so we can re-use code)
		showMessage(messageClass, messageText, 10000);
	}

	// Setup navigation submenus
	$("#pageHeader nav ul li").hover(function() {
		// When we hover over a menu item...
		// Find their submenu and slide it down
		$(this).find("ul.subnav").stop(true, true);
		$(this).find("ul.subnav").slideDown('fast').show();
	}, function() {
		// When I'm hovered out of, slide up my submenu
		$(this).find("ul.subnav").slideUp('fast');
	});

	// Extend jquery functions here
	$.fn.extend({
		toHTMLString: function() {
			return this.prop('outerHTML');
		},
		expandable: function(closed) {
			// Makes a fieldset expandable
			$(this).each(function() {
				var isOpen = !closed;
				var $this = $(this);
				var $legend = $this.children('legend:first');

				$legend.siblings().wrapAll('<div class="expdContainer" />');
				$legend.css('cursor', 'pointer');
				$legend.data('open', isOpen);

				if (closed) {
					$legend.append('<span> (+)</span>');
					$legend.siblings().hide();
				} else {
					$legend.append('<span> (-)</span>');
				}

				$legend.click(function() {
					isOpen = !isOpen;
					$this.trigger(isOpen ? 'open.expandable' : 'close.expandable');
					$legend.children('span:last-child')
					.text(isOpen ? ' (-)' : ' (+)');
					$legend.siblings().slideToggle('fast');
					$legend.data('open', isOpen);
				});
			});
			return $(this);
		}
	});

	if (!isLocalJobPage) {
		checkForHelpFile();
	}

	$(".hiddenDialog").hide();

	var defaultDialogConfig = {
		modal: true,
		width: 380,
		height: 165,
		appendTo: "body",
		autoOpen: true,
	};
	var removeThis = function() { $(this).remove(); };
	star.openDialog = function(config, text, icon) {
		icon = icon || "alert";
		var d = $("<div>");
		d.append("<span class='ui-icon ui-icon-" + icon + "'>");
		d.append(text);
		d.dialog($.extend({}, defaultDialogConfig, config));
		d.on("dialogclose", removeThis);
	};
});

/**
 * Special configuration for DataTables
 * https://datatables.net/reference/event/
 */
jQuery(function($) {
	"use strict";
	/* Everything in here depends on DataTables
	 * If DataTables are not used on this page, we can just return
	 *
	 * It would be ideal if we could put this in a seperate file that was
	 * only called when DataTables are used, but that would invlove some
	 * refactoring.
	 */
	var extpager;
	var ext;
	try {
		extpager = $.fn.dataTable.ext.pager;
		ext = $.fn.dataTable.ext;
	} catch (e) {
		return;
	}

	/**
	 * Custom pager for DataTables
	 * Only displays page numbers when there is more than one page
	 *   otherwise, hide pagination
	 */
	$.extend(extpager, {
		"only_when_necessary": function(page, pages) {
			if (pages <= 1) {
				return [];
			} else {
				return extpager["full_numbers"](page, pages);
			}
		}
	});

	ext.errMode = function(settings, techNote, message) {
		showMessage("error", "Internal error populating table", 5000);
		log(message + "\nhttps://datatables.net/tn/" + techNote + "\nSettings: " + settings);
	};

	/**
	 * Event listener called each time a table is drawn/redrawn
	 * We want to hide certain UI elements if they are unnecessary
	 *
	 * It would be better if we could bind this specifically to each DataTable,
	 * but they haven't been created yet, so I guess we need an overly broad
	 * event listener.
	 *
	 * DataTables Api is documented at https://datatables.net/reference/api/
	 */
	$(document).on("draw.dt", function(e, settings) {
		var that = $(e.target);
		var info = new $.fn.dataTable.Api(settings).page.info();

		/* This is a somewhat conservative approach to traversing the DOM
		 * We might be able to get away with `.next()` instead, but this is
		 *   more robust of the order of elements ever changes in the future
		 */
		var container = that.parents(".expdContainer");
		var footer = container.find(".dataTables_length, .dataTables_filter");
		var searchTerm = container.find(".dataTables_filter input").val();
		var selectAll = container.find(".selectWrap");

		// Hide "Show 10 items" and search box if there are fewer than 10 items
		if (info.recordsTotal <= defaultPageSize && !searchTerm) {
			footer.hide();
		} else {
			footer.show();
		}

		// Hide "Select all/none" if there are not multiple records
		if (info.recordsTotal <= 1) {
			selectAll.hide();
		} else {
			selectAll.show();
		}

		/* Update the `list-count` of the container, if one exists */
		$(settings.oInstance) // The DataTable being drawn
			.parents('fieldset').find('.list-count') // Find the label
			.text(info.recordsTotal); // Set the current count
	});

	/**
	 * DataTables configuration
	 * @constructor
	 * @dict
	 * @param {object} overrides to default configuration
	 */
	star.DataTableConfig = function(overrides) {
		var config = {
			"sDom": 'rt<"bottom"flpi><"clear">',
			"iDisplayStart": 0,
			"iDisplayLength": defaultPageSize,
			"pagingType": "only_when_necessary",
			"sServerMethod": "POST",
			"language": {"sProcessing": "processing request"},
		};
		$.extend(true, this, config, overrides);
	};
});

function checkForHelpFile() {
	reference = window.location.pathname;

	if (reference.length < 5
		|| $("#uniqueLoginTag").length > 0
		|| reference.indexOf("j_security_check") >= 0) {
		return;
	}

	argIndex = reference.indexOf("?");
	if (argIndex >= 0) {
		reference = reference.substring(0, argIndex);
	}

	reference = reference.substring(0, reference.length - 4) + ".help";

	$.ajax({
		url: reference,
		type: 'HEAD',
		error: function() {

		},
		success: function() {
			$("#helpTag").addClass("pageFound");
		}
	});
}

/**
 * Enable logging if debugMode is enabled
 * Otherwise, create a dummy function to silently drop log messages
 */
var log = debugMode ? console.log.bind(console) : function() {};

/**
 * Function to display a message to the user. We can call this from other javascript
 * functions or we can place special message divs in HTML to be picked out on page load
 * @param type The type of the message (the class name: error, warn, info or success)
 * @param message The message to display
 * @param duration How long (in milliseconds) before the notification auto-closes itself. Anything <= 0 disables auto-hide
 */
function showMessage(type, message, duration) {
	// Create the element that will allow the user to close the message
	var closeMessage = $("<span class='exit'>X</span>");
	var messageSpan = $("<div></div>").html(message);

	// Create a new DOM element to insert to display the message, and inject its classes and message
	var tmp = "<div><img src='" + starexecRoot + "images/icons/exclaim.png' /></div>";
	log(starexecRoot);
	var msg = $(tmp).attr('class', type + " message");
	$(msg).append(messageSpan);
	$(msg).append(closeMessage);

	// When the close element is clicked, close the message and remove it from the DOM
	$(closeMessage).click(function() {
		// If the X is clicked before the message's duration runs out,
		// stop the duration timer and close the element immediately
		clearTimeout($(msg).stop().data('timer'));
		$(msg).slideUp(500, function() {
			$(msg).remove();
		});
	});

	// Hide the message, then put it at the top of the page and slide it down, ya dig?
	$(msg).hide().prependTo($('body')).slideDown(500, function() {
		if (duration > 0) {
			// After the specified duration, slide it up and remove it from the DOM
			$.data(this, 'timer', setTimeout(function() {
				$(msg).slideUp(500, function() {
					$(msg).remove();
				});
			}, duration));
		}
	});
}

/**
 * Invalidates the user's session on the server and refreshes
 * the current page to send the user back to the login page.
 */
function logout() {
	$.post(
		starexecRoot + "services/session/logout",
		function(returnData) {
			window.location.href = starexecRoot + "secure/index.jsp";
		},
		"json"
	).error(function() {
		showMessage(
			"There was an error logging you out. Please try refreshing this page or restarting your browser");
	});
}

/**
 * Extracts parameters from the URL by name
 *
 * @param name the name of the variable to extract from the URL
 */
function getParameterByName(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

/**
 * Converts text to html encoded text
 * @param s - text to encode
 * @author Vivek Sardeshmukh
 */
function HtmlEncode(s) {
	var el = document.createElement("div");
	el.innerText = el.textContent = s;
	s = el.innerHTML;
	return s;
}

function addValidators() {
	$.validator.addMethod(
		"regex",
		function(value, element, str) {
			var re = new RegExp(str);
			return this.optional(element) || re.test(value);
		});
	$.validator.addMethod(
		"jspregex",
		function(value, element, str) {
			return !element.validity.patternMismatch;
		});
	$.validator.addMethod(
		"interval",
		function(value, element, str) {
			return value == 0 || value >= 10;
		}
	);
}

/**
 * Returns the regular expression used to validate primitive names
 */
function getPrimNameRegex() {
	return "^[\\w\\-\\.\\+\\^\\s]+$";
}

/**
 * Returns the regular expression used to validate primitive descriptions
 */
function getPrimDescRegex() {
	return "^[^<>\"\'%;)(&\\+-]+$";
}

/**
 * Returns the regular expression used to validate user names
 */
function getUserNameRegex() {
	return "^[a-zA-Z\\-'\\s]+$";
}

/**
 * Returns the regexp for validating names of GridEngine queues.
 */
function getQueueNameRegex() {
	return "^[\\w]+$";
}

/**
 * Returns true if the string is "true" and false otherwise
 * @param string
 * @returns {Boolean}
 */
function parseBoolean(string) {
	if (typeof string === 'undefined') {
		return false;
	}
	return string.trim().toLowerCase() == "true";
}

/**
 * Returns true if the given string is not undefined, null, or empty
 * @param string
 * @returns {Boolean}
 */
function stringExists(string) {
	return (typeof string != 'undefined' && string != null && string.length > 0);
}

function getStatusCode(code) {
	sc = code.statusCode;
	if (typeof sc == 'undefined') {
		return null;
	}
	return parseInt(sc);
}

function setInputToValue(inputSelector, value) {
	$(inputSelector).val(value);
}

/**
 * Reads a status code encoded as a json object, prints its message if it has one, and returns
 * true or false depending on whether it was a success status.
 * If the "code" object is not actually a status code, returns true
 */
function parseReturnCode(code, printMessage) {
	if (typeof printMessage == 'undefined') {
		printMessage = true;
	}

	s = code.success;

	//we didn't get back a status code
	if (typeof s == 'undefined' || s == null) {
		return true;
	}

	m = code.message;

	if (code.devMessage) {
		log(code.devMessage);
	}

	if (printMessage && stringExists(m)) {
		if (s) {
			showMessage("success", m, 5000);
		} else {
			showMessage("error", m, 5000);
		}
	}

	return s;
}

function setJqueryButtonText(buttonSelector, txt) {
	$(buttonSelector + " .ui-button-text").html(txt);
}

function handleAjaxError(textStatus) {
	if (textStatus != "abort") {
		showMessage('error', "Internal error populating data table", 5000);
	}
}

// returns the string we use throughout Starexec for the DataTables sDom argument,
// which specifies the layout of the tables (pagination, sorting, filtering, and so on).
function getDataTablesDom() {
	return 'rt<"bottom"flpi><"clear">';
}

/**
 * A helper function that will be passed a return code from an AJAX request.
 * If request was sucessful, reload the page.
 * Otherwise, display an error message and close the current dialog.
 * One gotcha: in order for this function to close the current dialog, it must
 * be bound to the current dialog. In most cases, this means passing the
 * function as such:
 *     $.post(
 *         url,
 *         data,
 *         star.reloadOnSucess.bind(this),
 *         "json"
 *     );
 */
star.reloadOnSucess = function(returnCode, printMessage) {
	if (parseReturnCode(returnCode, printMessage)) {
		window.location.reload(true);
	} else if (this !== window) {
		$(this).dialog("close");
	} else {
		log("reloadOnSucess called without .bind(this)");
	}
};
