$(document).ready(function() {
	// Hide loading images by default
	$('legend img').hide();

	$('.popoutLink').button({
		icons: {
			secondary: "ui-icon-newwin"
		}
	});

	$('#downLink').button({
		icons: {
			secondary: "ui-icon-arrowthick-1-s"
		}
	});

	$('#anonymousLink').button({
		icons: {
			secondary: "ui-icon-link"
		}
	});

	$('#editLink').button({
		icons: {
			secondary: "ui-icon-pencil"
		}
	});

	$('#returnLink, #returnLinkMargin').button({
		icons: {
			secondary: "ui-icon-arrowreturnthick-1-w"
		}
	});

	$('img').click(function(event) {
		PopUp($(this).attr('enlarge'));
	});

});

function PopUp(uri) {
	imageDialog = $("#popDialog");
	imageTag = $("#popImage");

	imageTag.attr('src', uri);

	imageTag.load(function() {
		$('#popDialog').dialog({
			dialogClass: "popup",
			modal: true,
			resizable: false,
			draggable: false,
			height: 'auto',
			width: 'auto'
		});
	});
}

function makeAnonymousLinkPost(
	primitiveType, primitiveId, primitivesToAnonymize) {
	'use strict';
	var isAnonymizedJobPage = (primitiveType === "job") && (primitivesToAnonymize === "allButBench" || primitivesToAnonymize === "all");

	log("Should create spinner: " + isAnonymizedJobPage);
	if (isAnonymizedJobPage) {
		createDialog(
			"Generating anonymized job page. Please wait. (May take a minute or two for large jobs.)");
	}
	$.post(
		starexecRoot + 'services/anonymousLink/' + primitiveType + '/' + primitiveId + '/' + primitivesToAnonymize,
		'',
		function(returnCode) {
			log('Anonymous Link Return Code: ' + returnCode);
			if (isAnonymizedJobPage) {
				destroyDialog();
			}
			if (returnCode.success) {
				$('#dialog-show-anonymous-link')
				.html('<a href="' + returnCode.message + '">' + returnCode.message + '</a>');

				$('#dialog-show-anonymous-link').dialog({
					width: 750,
					height: 200,
				});
			} else {
				parseReturnCode(returnCode);
			}
		},
		'json'
	);
}
