"use strict";

var summaryTable;
var pairTable;
var curSpaceId; //stores the ID of the job space that is currently selected from the space viewer
var jobId; //the ID of the job being viewed
var lastValidSelectOption;
var panelArray = [];
var useWallclock = true;
var syncResults = false;
var DETAILS_JOB = {};
var selectedJobSpaceId = null;
var getPanelTableInitializer;
// contains requests that have been sent to the server to update pairs, stats, or graphs that
// have not yet returned. If the user clicks on a new job space, these requests will all
// be aborted, as they will no longer be useful.
var openAjaxRequests = [];

$(document).ready(function() {
    initializeGlobalPageVariables();
	initUI();
	initSpaceExplorer();
	initDataTables();

	if (!isLocalJobPage) {
		//update the tables every 30 seconds
		setInterval(function() {
			pairTable.fnDraw(false);
		}, 30000);
	}

	//puts data into the data tables
	reloadTables($("#spaceId").attr("value"));
});

// Initializes the fields of the global DETAILS_JOB object.
function initializeGlobalPageVariables() {
	// Set these first since get functions may depend no them
	DETAILS_JOB.isAnonymousPage = $('#isAnonymousPage')
	.attr('value') === 'true';
	jobId = $('#jobId').attr('value');
	DETAILS_JOB.starexecUrl = $('#starexecUrl').attr('value');
	DETAILS_JOB.rootJobSpaceId = $('#spaceId').attr('value');
	DETAILS_JOB.primitivesToAnonymize = $('#primitivesToAnonymize')
	.attr('value');
	DETAILS_JOB.anonymousLinkUuid = getParameterByName('anonId');
	DETAILS_JOB.spaceExplorerJsonData = getSpaceExplorerJsonData();		

	log("starexecUrl: " + DETAILS_JOB.starexecUrl);
	log("isLocalJobPage: " + isLocalJobPage);
	log("starexecRoot: " + starexecRoot);
	log("isAnonymousPage: " + DETAILS_JOB.isAnonymousPage);
	log("primitivesToAnonymize: " + DETAILS_JOB.primitivesToAnonymize);
}

// Gets the JSON representation of the space explorer from the hidden <span> containing it.
function getSpaceExplorerJsonData() {
	var spaceExplorerJsonData;
	if (isLocalJobPage) {
		var jobSpaceTreeJsonText = $('#jobSpaceTreeJson').attr('value');
		try {
			spaceExplorerJsonData = {
				"data": JSON.parse(jobSpaceTreeJsonText)
			};
		} catch (syntaxError) {
			log("Caught syntax error when trying to call JSON.parse on: " + jobSpaceTreeJsonText);
			return {};
		}
	} else {
		var url;
		if (DETAILS_JOB.isAnonymousPage) {
			url = starexecRoot + "services/space/anonymousLink/" + DETAILS_JOB.anonymousLinkUuid + "/jobspaces/true/" + DETAILS_JOB.primitivesToAnonymize;
		} else {
			url = starexecRoot + "services/space/" + jobId + "/jobspaces/true";
		}
		spaceExplorerJsonData = {
			"ajax": {
				"url": url, // Where we will be getting json data from
				"data": function(n) {
					return {
						id: (n.attr ? n.attr("id") : 0)
					}; // What the default space id should be
				}
			}
		};
	}
	return spaceExplorerJsonData;
}

function setSyncResultsText() {
	if (syncResults) {
		$("#syncResults .ui-button-text").html("un-synchronize results");
	} else {
		$("#syncResults .ui-button-text").html("synchronize results");
	}
}

function refreshPanels() {
	for (var i = 0; i < panelArray.length; i++) {
		panelArray[i].api().ajax.reload(null, true);
	}
}

function refreshStats(id) {
	var updateGraphs = function() {
		if (summaryTable.fnSettings().fnRecordsTotal() == 0) {
			$("#graphField").hide();
		} else {
			/* This is can be one of the most intense loops on this page,
			 * so we are waving goodbye to jQuery and dropping down to
			 * manipulating the DOM directly. I am sorry if this makes the
			 * code more difficult to read.
			 */
			var $spaceOverviewSelections = $("#spaceOverviewSelections"),
				solverOptions = document.createDocumentFragment(),
				rows = summaryTable.fnGetData();
			for (var i = 0; i < rows.length; ++i) {
				var row = rows[i],
					solverName = row[2],
					configName = row[3],
					configId = row[1];

				var option = document.createElement("option");
				option.value = configId;
				option.text = solverName + "/" + configName;

				solverOptions.appendChild(option);
			}
			/* We need to make a deep clone of `solverOptions` if we want to add
			 * this fragment to multiple places in our document. So, we will clone
			 * when we append to `solverChoice`` and `solverChoice2`, and we will
			 * just append the original to `$spaceOverviewSelections` since we will
			 * not need it anymore
			 */
			document.getElementById("solverChoice1")
			.appendChild(solverOptions.cloneNode(true));

			document.getElementById("solverChoice2")
			.appendChild(solverOptions.cloneNode(true));

			$spaceOverviewSelections.empty().append(solverOptions);
			$("#graphField").show();

			//select first five solver/ configuration pairs
			$spaceOverviewSelections.children("option:lt(5)")
			.prop("selected", true);
			lastValidSelectOption = $spaceOverviewSelections.val();
			updateSpaceOverviewGraph();
			updatePairJobTimeGraph();
			if (summaryTable.fnSettings().fnRecordsTotal() > 1) {
				$("#solverComparison").show();
				$("#solverChoice1")
				.children("option:first")
				.prop("selected", true);
				$("#solverChoice2")
				.children("option:nth-child(2)")
				.prop("selected", true);
				updateSolverComparison(300, "white");
			} else {
				$("#solverComparison").hide();
				$("#solverComparisonOptionField").hide();
			}
		}
	};
	summaryTable.api().ajax.reload(updateGraphs, true);
}

function createDownloadRequest(item, type, returnIds, getCompleted) {
	createDialog(
		"Processing your download request, please wait. This will take some time for large jobs.");
	var token = Math.floor(Math.random() * 100000000);
	var href = DETAILS_JOB.starexecUrl + "secure/download?token=" + token + "&type=" + type + "&id=" + $(
		"#jobId").attr("value");
	if (typeof returnIds != 'undefined') {
		href = href + "&returnids=" + returnIds;
	}
	if (typeof getCompleted != 'undefined') {
		href = href + "&getcompleted=" + getCompleted;
	}
	$(item).attr('href', href);
	destroyOnReturn(token);		//when we see the download token as a cookie, destroy the dialog box
	window.location.href = href;
}

function initSpaceExplorer() {
	// Set the path to the css theme for the jstree plugin

	$.jstree._themes = starexecRoot + "css/jstree/";
	var id;

	$("#exploreList").jstree({
		"json_data": DETAILS_JOB.spaceExplorerJsonData,
		"themes": {
			"theme": "default",
			"dots": true,
			"icons": true
		},
		"types": {
			"max_depth": -2,
			"max_children": -2,
			"valid_children": ["space"],
			"types": {
				"space": {
					"valid_children": ["space"],
					"icon": {
						"image": starexecRoot + "images/jstree/db.png"
					}
				}
			}
		},
		"ui": {
			"select_limit": 1,
			"selected_parent_close": "select_parent",
			"initially_select": ["#" + DETAILS_JOB.rootJobSpaceId]
		},
		"plugins": ["types", "themes", "json_data", "ui", "cookies"],
		"core": {animation: 200}
	}).bind("select_node.jstree", function(event, data) {
		// When a node is clicked, get its ID and display the info in the details pane
		id = data.rslt.obj.attr("id");
		if (selectedJobSpaceId == null) {
			selectedJobSpaceId = id;
		}
		if (selectedJobSpaceId != id) {
			killAjaxRequests();
			// Only reload if a different space was clicked.
			selectedJobSpaceId = id;
			name = data.rslt.obj.attr("name");
			var maxStages = data.rslt.obj.attr("maxStages");
			setMaxStagesDropdown(parseInt(maxStages));
			$(".spaceName").text($('.jstree-clicked').text());
			$("#displayJobSpaceID").text("job space id  = " + id);
			//no solvers will be selected when a space changes, so hide this button
			$("#compareSolvers").hide();
			reloadTables(id);
		}
	}).on("click", "a", function(event, data) {
		event.preventDefault();  // This just disable's links in the node title
	});
	log("Initialized exploreList tree.");
}

function killAjaxRequests() {
	log('killing ajax requests');
	for (var i = 0; i < openAjaxRequests.length; i++) {
		openAjaxRequests[i].abort();
	}
	openAjaxRequests = [];
}

function clearPanels() {
	for (var i = 0; i < panelArray.length; ++i) {
		var panel = panelArray[i];
		if (panel.data("panelRefreshInterval") !== undefined) {
			window.clearInterval(panel.data("panelRefreshInterval"));
		}
		panel.fnDestroy();
		panel.remove();
	}
	$(".panelField").remove();
	panelArray = [];
}

function reloadTables(id) {
	//we only need to update if we've actually selected a new space
	if (curSpaceId != id) {
		curSpaceId = id;
		clearPanels();
		if (!isLocalJobPage) {
			// summaryTable.fnClearTable();	//immediately get rid of the current data, which makes it look more responsive
			pairTable.fnClearTable();

			//clear out the graphs
			$("#solverChoice1").empty();
			$("#solverChoice2").empty();
			$("#spaceOverviewSelections").empty();
			$("#spaceOverview")
			.attr("src", starexecRoot + "/images/loadingGraph.png");
			$("#solverComparison")
			.attr("src", starexecRoot + "/images/loadingGraph.png");

			//tell the tables to display a "loading" indicator
			summaryTable.fnProcessingIndicator(true);
			pairTable.fnProcessingIndicator(true);

			refreshStats(id);

		} else {
			$('[id$=pairTbl_wrapper]').hide();
			$('#pairTblField').show();
			$('#' + id + 'pairTbl_wrapper').show();
			$('[id$=solveTbl_wrapper]').hide();
			$('#' + id + 'solveTbl_wrapper').show();
			log('showing id: ' + id);
		}
		initializePanels();
	}
}

function makeJobNameUneditable() {
	// Gets rid of the '(click to edit)' part of the text.
	$('#jobNameTitle').text('name');
	$('#editJobNameWrapper').hide();
}

function makeJobDescriptionUneditable() {
	$('#jobDescriptionTitle').text('description');
	$('#editJobDescriptionWrapper').hide();
}

//
//  Initializes the user-interface
//
function initUI() {
	$("#errorField").hide();
	$("#statsErrorField").hide();
	$(".cpuTime").hide();

	$("#spaceOverview").show();
	$("#solverComparison300").hide();
	$("#pairTimeGraph").hide();	
	$("#spaceOverviewOptionField").show();
	$("#solverComparisonOptionField").hide();
	$("#pairTimeOptionField").hide();

	$("#addJobPairs")
	.button({
		icons: {
			primary: "ui-icon-arrowthick-1-n"
		}
	});

	$("#rerunPairs")
	.button({
		icons: {
			primary: "ui-icon-arrowreturnthick-1-e"
		}
	});

	$("#compareSolvers")
	.button({
		icons: {
			primary: "ui-icon-arrowthick-1-s"
		}
	}).hide().click(function() {
		var c1 = $(".first_selected").find(".configLink").attr("id");
		var c2 = $(".second_selected").find(".configLink").attr("id");
		window.open(DETAILS_JOB.starexecUrl + "secure/details/solverComparison.jsp?sid=" + curSpaceId + "&c1=" + c1 + "&c2=" + c2);
	});

	$('#clearCache')
	.button({
		icons: {
			secondary: "ui-icon-arrowrefresh-1-e"
		}
	}).click(function() {
		$("#dialog-warning-txt")
		.text('Are you sure you want to clear the cache for this primitive?');
		$("#dialog-warning").dialog({
			modal: true,
			width: 380,
			height: 165,
			buttons: {
				'clear cache': function() {
					$(this).dialog("close");
					$.post(
						starexecRoot + "services/cache/clear/stats/" + jobId + "/",
						parseReturnCode
					);
				},
				"cancel": function() {
					$(this).dialog("close");
				}
			}
		});
	});

	$('#recompileSpaces')
	.button({
		icons: {
			secondary: "ui-icon-arrowrefresh-1-e"
		}
	}).click(function() {
		$.get(
			starexecRoot + "services/recompile/" + jobId,
			parseReturnCode
		);
	});

	$("#downloadJobPageButton")
	.button({
		icons: {
			primary: "ui-icon-arrowthick-1-s"
		}
	}).click(function() {
		createDownloadRequest("#downloadJobPageButton", "job_page");
	});

	// I think this code can be removed
	$('#setLowPriority')
	.button({
		icons: {
			primary: "ui-icon-gear"
		}
	});

	$("#matrixViewButton")
	.button({
		icons: {
			primary: "ui-icon-newwin"
		}
	}).click(function() {
		var url = DETAILS_JOB.starexecUrl + 'secure/details/jobMatrixView.jsp?stage=1&jobSpaceId=' + curSpaceId;
		if (isLocalJobPage) {
			window.location.href = url;
		} else {
			popup(url);
		}
	});

	$("#jobPairAttributes")
	.button({
		icons: {
			primary: "ui-icon-newwin"
		}
	}).click(function() {
		var url = DETAILS_JOB.starexecUrl + 'secure/details/jobAttributes.jsp?id=' + curSpaceId;
		if (isLocalJobPage) {
			window.location.href = url;
		} else {
			popup(url);
		}
	});

	$("#solverNameKeyButton")
	.button({
		icons: {
			primary: "ui-icon-newwin"
		}
	}).click(function() {
		var url = DETAILS_JOB.starexecUrl + 'secure/details/anonymousJobPageKey.jsp?anonId=' + DETAILS_JOB.anonymousLinkUuid;
		popup(url);
	});

	$("#syncResults")
	.button({
		icons: {
			primary: "ui-icon-gear"
		}
	}).click(function() {
		//just change the sync results boolean and update the button text.
		syncResults = !syncResults;
		setSyncResultsText();
		pairTable.fnDraw(false);
	});

	$("#popoutPanels")
	.button({
		icons: {
			primary: "ui-icon-extlink"
		}
	}).click(function() {
		// default to primary stage
		window.open(DETAILS_JOB.starexecUrl + "secure/details/jobPanelView.jsp?spaceid=" + curSpaceId + "&stage=1");
	});

	$("#collapsePanels")
	.button({
		icons: {
			primary: "ui-icon-folder-collapsed"
		}
	}).click(function() {
		$(".panelField").each(function() {
			var legend = $(this).children('legend:first');
			var isOpen = $(legend).data('open');
			if (isOpen) {
				$(legend).trigger("click");
			}
		});
	});

	$("#openPanels")
	.button({
		icons: {
			primary: "ui-icon-folder-open"
		}
	}).click(function() {
		$(".panelField").each(function() {
			var legend = $(this).children('legend:first');
			var isOpen = $(legend).data('open');

			if (!isOpen) {
				$(legend).trigger("click");
			}
		});
	});

	$(".changeTime")
	.button({
		icons: {
			primary: "ui-icon-refresh"
		}
	}).click(function() {
		useWallclock = !useWallclock;
		if (useWallclock) {
			$('.cpuTime').hide();
			$('.wallclockTime').show();
		} else {
			$('.cpuTime').show();
			$('.wallclockTime').hide();
		}
		setTimeButtonText();
		if (!isLocalJobPage) {
			refreshPanels();
			refreshStats(curSpaceId);
			pairTable.fnDraw(false);
		}
	});

	$("#jobDownload")
	.button({
		icons: {
			primary: "ui-icon-arrowthick-1-s"
		}
	}).unbind("click").click(function(e) {
		e.preventDefault();
		$('#dialog-return-ids-txt')
		.text(
			'do you want ids for job pairs, solvers, and benchmarks to be included in the CSV?');

		$('#dialog-return-ids').dialog({
			modal: true,
			width: 380,
			height: 200,
			buttons: {
				'download': function() {
					$('#dialog-return-ids').dialog('close');
					createDownloadRequest("#jobDownload",
						"job",
						$("#includeids").prop("checked"),
						$("#getcompleted").prop("checked"));
				},
				"cancel": function() {
					$(this).dialog("close");
				}
			}
		});
	});

	$("#jobXMLDownload")
	.button({
		icons: {
			primary: "ui-icon-arrowthick-1-s"
		}
	}).unbind("click").click(function(e) {
		e.preventDefault();
		createDownloadRequest("#jobXMLDownload", "jobXML");
	});

	$("#jobOutputDownload")
	.button({
		icons: {
			primary: "ui-icon-arrowthick-1-s"
		}
	}).unbind("click").click(function(e) {
		e.preventDefault();
		createDownloadRequest("#jobOutputDownload", "j_outputs");
	});

	if (isLocalJobPage) {
		$('#actionField').hide();
		$('#advancedActionField').hide();
		$('#matrixViewButton').hide();
		$('#jobPairAttributes').hide();
		$('#downloadJobPageButton').hide();
		$('#anonymousLink').hide();
		makeJobNameUneditable();
		makeJobDescriptionUneditable();
	} else {
		setupJobNameAndDescriptionEditing('#jobNameText',
			'#editJobName',
			'#editJobNameButton',
			'#editJobNameWrapper',
			'name');
		setupJobNameAndDescriptionEditing('#jobDescriptionText',
			'#editJobDescription',
			'#editJobDescriptionButton',
			'#editJobDescriptionWrapper',
			'description');
		registerAnonymousLinkButtonEventHandler();
		$(".stageSelector")
		.change(function() {
			//set the value of all .stageSelectors to this one to sync them.
			//this does not trigger the change event, which is good because it would loop forever
			$(".stageSelector").val($(this).val());
			pairTable.fnDraw(false);
			refreshPanels();
			refreshStats(curSpaceId);
		});
		$("#selectSpaceOverview")
		.button({
			icons: {
				primary: "ui-icon-arrowrefresh-1-e"
			}
		}).click(function() {
			$("#solverComparison300").hide();
			$("#pairTimeGraph").hide();
			$("#spaceOverview").show();
			$("#solverComparisonOptionField").hide();
			$("#pairTimeOptionField").hide();
			$("#spaceOverviewOptionField").show();
		});
                $("#selectSolverComparison")
                .button({
                        icons: {
                                primary: "ui-icon-arrowrefresh-1-e"
                        }
                }).click(function() {
                        $("#spaceOverview").hide();
                        $("#pairTimeGraph").hide();
                        $("#solverComparison300").show();
			$("#spaceOverviewOptionField").hide();
                        $("#pairTimeOptionField").hide();
                        $("#solverComparisonOptionField").show();
                });
                $("#selectPairTimeGraph")
                .button({
                        icons: {
                                primary: "ui-icon-arrowrefresh-1-e"
                        }
                }).click(function() {
                        $("#spaceOverview").hide();
                        $("#solverComparison300").hide();
                        $("#pairTimeGraph").show();
			$("#spaceOverviewOptionField").hide();
			$("#solverComparisonOptionField").hide();
                        $("#pairTimeOptionField").show();
                });

		$("#spaceOverviewUpdate")
		.button({
			icons: {
				primary: "ui-icon-arrowrefresh-1-e"
			}
		}).click(function() {
			updateSpaceOverviewGraph();
		});
		$("#solverComparisonUpdate")
		.button({
			icons: {
				primary: "ui-icon-arrowrefresh-1-e"
			}
		}).click(function() {
			updateSolverComparison(300, "white");
		});
		$("#pairTimeUpdate")
		.button({
			icons: {
				primary: "ui-icon-arrowrefresh-1-e"
			}
		}).click(function() {
			updatePairJobTimeGraph();
		});

		if (star.isUserSubscribedToJob !== undefined) {
			(function() {
				var $notificationButton = $("<a href='#'>")
					.button({
						icons: {primary: "ui-icon-mail-closed"},
					})
				;
				var toggleSubscribe = function() {
					var url = starexecRoot + (
						star.isUserSubscribedToJob ?
						"services/jobs/notifications/unsubscribe" :
						"services/jobs/notifications/subscribe"
					);
					var status = !star.isUserSubscribedToJob;
					$.ajax({
						type: "POST",
						url: url,
						data: {"id": jobId},
						dataType: "json",
						success: function() {
							window.star.isUserSubscribedToJob = status;
							updateLabel();
							$notificationButton.button("enable");
						},
						error: function() {
							var message = "Unable to " +
								$notificationButton.button("option", "label");
							showMessage("error", message, 5000);
						}
					});
				};
				var updateLabel = function() {
					var label = star.isUserSubscribedToJob ?
					            "unsubscribe from email updates" :
					            "subscribe to email updates";
					$notificationButton.button("option", "label", label);
				};
				var notificationClick = function(e) {
					e.preventDefault();
					$notificationButton.button("disable");
					toggleSubscribe();
				};

				updateLabel();
				$notificationButton
				.click(notificationClick)
				.wrapAll("<li>")
				.parent()
				.appendTo("#actionList")
				;
			})();
		}
	}

	setupSetHighPriorityButton();
	setupSetLowPriorityButton();
	setupDeleteJobButton();
	setupPauseJobButton();
	setupResumeJobButton();
	setupChangeQueueButton();
	setupPostProcessButton();
	attachSortButtonFunctions();

	//set the two default solvers to compare
	var defaultSolver1 = $('#solverChoice1').attr('default');
	$('#solverChoice1 option[value=' + defaultSolver1 + ']')
	.prop('selected', true);

	var defaultSolver2 = $('#solverChoice2').attr('default');
	$('#solverChoice2 option[value=' + defaultSolver2 + ']')
	.prop('selected', true);

	//set all fieldsets as expandable
	$('#solverSummaryField').expandable(false);
	$("#pairTblField").expandable(false);
	$("#graphField").expandable(false);
	$("#errorField").expandable(false);
	$("#statsErrorField").expandable(false);
	$("#optionField").expandable(true);
	$("#detailField").expandable(true);

	var advancedJobActionsCollapsed = $.cookie('advancedJobActions') != 'false';
	$('#advancedActionField')
	.expandable(advancedJobActionsCollapsed)
	.children('legend:first')
	.click(function() {
		var advancedJobActionsCollapsed = !$(this).data('open');
		$.cookie('advancedJobActions',
			advancedJobActionsCollapsed,
			{expires: 10000, path: '/'});
	});

	$("#subspaceSummaryField").expandable(false);

	lastValidSelectOption = $("#spaceOverviewSelections").val();

	$("#spaceOverviewSelections").change(function() {
		if ($(this).val().length > 5) {
			showMessage('error',
				"You may only choose a maximum of 5 solver / configuration pairs to display at one time",
				5000);
			$(this).val(lastValidSelectOption);
		} else {
			lastValidSelectOption = $(this).val();
		}
	});

	$("#solverComparison300").click(function() {
		$('#dialog-solverComparison').dialog({
			modal: true,
			width: 850,
			height: 850
		});
	});

	$("#spaceOverview").click(function() {
		$('#dialog-spaceOverview').dialog({
			modal: true,
			width: 850,
			height: 850
		});
	});

	$("#pairTimeGraph").click(function() {
		$('#dialog-pairTimeGraph').dialog({
			modal: true,
			width: 850,
			height: 850
		});
	});

	setTimeButtonText();
}

function setupDeleteJobButton() {
	$('#deleteJob').button({
		icons: {
			secondary: "ui-icon-minus"
		}
	}).click(function() {
		$('#dialog-confirm-delete-txt')
		.text('are you sure you want to delete this job?');

		$('#dialog-confirm-delete').dialog({
			modal: true,
			width: 380,
			height: 165,
			buttons: {
				'OK': function() {
					log('user confirmed job deletion.');
					$('#dialog-confirm-delete').dialog('close');

					killAjaxRequests();
					window.stop();
					$.post(
						starexecRoot + "services/delete/job",
						{selectedIds: [getParameterByName("id")]},
						function(returnCode) {
							var s = parseReturnCode(returnCode);
							if (s) {
								window.location = starexecRoot + 'secure/explore/spaces.jsp';
							}
						},
						"json"
					);
				},
				"cancel": function() {
					log('user canceled job deletion');
					$(this).dialog("close");
				}
			}
		});
	});
}

function setupSetHighPriorityButton() {
	var setHighPrioritySelector = '#setHighPriority';
	log('setting up high priority button.');
	$(setHighPrioritySelector).button({
		icons: {
			primary: "ui-icon-gear"
		}
	});
	$(setHighPrioritySelector).click(function() {
		log('set high priority button clicked.');
		$.post(
			starexecRoot + 'services/jobs/setHighPriority/' + jobId,
			'',
			function(statusCode) {
				log('got something back.');
				log(statusCode);
				if (statusCode.success) {
					log('reloading page');
					document.location.reload(true);
				} else {
					parseReturnCode(statusCode);
				}
			},
			'json'
		);
	});
}

function setupSetLowPriorityButton() {
	var setLowPrioritySelector = '#setLowPriority';
	$(setLowPrioritySelector).button({
		icons: {
			primary: "ui-icon-gear"
		}
	});
	$(setLowPrioritySelector).click(function() {
		log('set low priority button clicked.');
		$.post(
			starexecRoot + 'services/jobs/setLowPriority/' + jobId,
			'',
			function(statusCode) {
				if (statusCode.success) {
					log('reloading page');
					document.location.reload(true);
				} else {
					parseReturnCode(statusCode);
				}
			},
			'json'
		);
	});
}

function setupPauseJobButton() {
	$('#pauseJob').button({
		icons: {
			secondary: "ui-icon-pause"
		}
	}).click(function() {
		createDialog("Pausing Job");
		killAjaxRequests(); // Since we are reloading the page anyway...
		window.stop();
		$.post(
			starexecRoot + "services/pause/job/" + getParameterByName("id"),
			function(returnCode) {
				var s = parseReturnCode(returnCode);
				if (s) {
					document.location.reload(true);
				}
			},
			"json"
		);
	});
}

function setupResumeJobButton() {
	$('#resumeJob').button({
		icons: {
			secondary: "ui-icon-play"
		}
	}).click(function() {
		createDialog("Resuming Job");
		killAjaxRequests(); // Since we are reloading the page anyway...
		window.stop();
		$.post(
			starexecRoot + "services/resume/job/" + getParameterByName("id"),
			function(returnCode) {
				var s = parseReturnCode(returnCode);
				if (s) {
					document.location.reload(true);
				}
			},
			"json"
		);
	});
}

function setupChangeQueueButton() {
	$('#changeQueue').button({
		icons: {
			secondary: "ui-icon-transferthick-e-w"
		}
	}).click(function() {
		$('#dialog-changeQueue-txt')
		.text('Please select a new queue to use for this job.');

		$('#dialog-changeQueue').dialog({
			modal: true,
			width: 380,
			height: 200,
			buttons: {
				'OK': function() {
					$('#dialog-changeQueue').dialog('close');
					killAjaxRequests();
					window.stop();
					$.post(
						starexecRoot + "services/changeQueue/job/" + getParameterByName(
						"id") + "/" + $("#changeQueueSelection").val(),
						function(returnCode) {
							var s = parseReturnCode(returnCode);
							if (s) {
								setTimeout(
									function() {document.location.reload(true)},
									1000
								);
							}
						},
						"json"
					);
				},
				"cancel": function() {
					$(this).dialog("close");
				}
			}
		});
	});
}

function setupPostProcessButton() {
	$("#postProcess").button({
		icons: {
			primary: "ui-icon-arrowthick-1-n"
		}
	}).click(function() {
		$('#dialog-postProcess-txt')
		.text('Please select a post-processor to use for this job.');

		$('#dialog-postProcess').dialog({
			modal: true,
			width: 380,
			height: 200,
			buttons: {
				'OK': function() {
					$('#dialog-postProcess').dialog('close');
					showMessage("info",
						"Beginning job pair processing. ",
						3000);
					$.post(
						starexecRoot + "services/postprocess/job/" + getParameterByName(
						"id") + "/" + $("#postProcessorSelection")
						.val() + "/" + getSelectedStage(),
						parseReturnCode,
						"json"
					);
				},
				"cancel": function() {
					$(this).dialog("close");
				}
			}
		});
	});
}

function updatePairJobTimeGraph() {
	var postUrl = null;

	if(DETAILS_JOB.isAnonymousPage) {
		postUrl = starexecRoot + 'services/jobs/anonymousLink/' + DETAILS_JOB.anonymousLinkUuid + '/' + jobId + '/graphs/pairTime';
	} else {
		postUrl = starexecRoot + 'services/jobs/' + jobId + '/graphs/pairTime';
	}
	log('updatePairJobTimeGraph postUrl: ' + postUrl);

	var xhr = $.post(
			postUrl,
			{},
			function(returnCode) {
				var s = parseReturnCode(returnCode);
				if(s) {
					$("#pairTimeGraph").attr("src", returnCode);
					$("#bigPairTimeGraph").attr("src", returnCode + "800");
				} else {
					$("#pairTimeGraph").attr("src", starexecRoot + "/images/noDisplayGraph.png");
				}
			},
			"text"
		);
		openAjaxRequests.push(xhr);
}


function updateSpaceOverviewGraph() {
	var configs = [];
	var logY = false;
	$("#spaceOverviewSelections option:selected").each(function() {
		configs.push($(this).attr("value"));
	});
	if ($("#logScale").prop("checked")) {
		logY = true;
	}

	var postUrl = null;
	if (DETAILS_JOB.isAnonymousPage) {
		postUrl = starexecRoot + 'services/jobs/anonymousLink/' + DETAILS_JOB.anonymousLinkUuid + '/' + curSpaceId +
			'/graphs/spaceOverview/' + getSelectedStage() + '/' + DETAILS_JOB.primitivesToAnonymize;
	} else {
		postUrl = starexecRoot + 'services/jobs/' + curSpaceId + '/graphs/spaceOverview/' + getSelectedStage();
	}
	log('updateSpaceOverviewGraph postUrl: ' + postUrl);

	var xhr = $.post(
		postUrl,
		{logY: logY, selectedIds: configs},
		function(returnCode) {
			var s = parseReturnCode(returnCode);
			if (s) {
				var currentConfigs = [];
				$("#spaceOverviewSelections option:selected").each(function() {
					currentConfigs.push($(this).attr("value"));
				});
				//we only want to update the graph if the request we made still matches what the user has put in
				//it is possible the user changed their selections and sent out a new request which has returned already
				//also, equality checking doesn't work on arrays, but less than and greater than do
				if (!(currentConfigs > configs) && !(currentConfigs < configs)) {
					$("#spaceOverview").attr("src", returnCode);
					$("#bigSpaceOverview").attr("src", returnCode + "800");
				}
			} else {
				$("#spaceOverview")
				.attr("src", starexecRoot + "/images/noDisplayGraph.png");
			}
		},
		"text"
	);
	openAjaxRequests.push(xhr);
}

//size is in pixels and color is a string
function updateSolverComparison(size, color) {
	var config1 = $("#solverChoice1 option:selected").attr("value");
	var config2 = $("#solverChoice2 option:selected").attr("value");

	var postUrl = '';
	if (DETAILS_JOB.isAnonymousPage) {
		postUrl = starexecRoot + "services/jobs/anonymousLink/" + DETAILS_JOB.anonymousLinkUuid + "/" + curSpaceId + "/graphs/solverComparison/" + config1 +
			"/" + config2 + "/" + size + "/" + color + "/" + getSelectedStage() + "/" + DETAILS_JOB.primitivesToAnonymize;
	} else {
		postUrl = starexecRoot + "services/jobs/" + curSpaceId + "/graphs/solverComparison/" + config1 + "/" + config2 + "/" + size + "/" + color + "/" + getSelectedStage();
	}

	var xhr = $.post(
		postUrl,
		{},
		function(returnCode) {
			var s = parseReturnCode(returnCode);
			if (s) {
				var jsonObject = $.parseJSON(returnCode);
				var src = jsonObject.src;
				var map = jsonObject.map;
				$("#solverComparison" + size).attr("src", src);
				$("#solverComparisonMap" + size).remove();
				if (size == 800) {
					$("#dialog-solverComparison").append(map);
				} else {
					$("#graphField").append(map);
					updateSolverComparison(800, "black");
				}
			} else {
				$("#solverComparison300")
				.attr("src", starexecRoot + "/images/noDisplayGraph.png");
			}
		},
		"text"
	);

	openAjaxRequests.push(xhr);
}

function setupJobNameAndDescriptionEditing(
	textSelector, inputSelector, buttonSelector, wrapperSelector,
	nameOrDescription) {
	// Hide the wrapper when the page loads.
	$(wrapperSelector).hide();
	// Setup the button when the page loads.
	$(buttonSelector).button();

	$(textSelector).click(function() {
		$(textSelector).hide();
		$(wrapperSelector).show();
		$(inputSelector).select();
	});

	// Had to use mousedown here so that it would precede $('editJobName').blur()
	$(buttonSelector).mousedown(function() {
		log('Attempting to change name...');
		var name = $(inputSelector).val();
		// Make sure the name is a valid primitive name.
		var primRegex = null;
		if (nameOrDescription === 'name') {
			primRegex = new RegExp(getPrimNameRegex());
		} else {
			primRegex = new RegExp(getPrimDescRegex());
		}
		if (!primRegex.test(name)) {
			showMessage("error", "The given " + nameOrDescription + " contains illegal characters.",
				5000);
			return;
		}
		$.post(
			starexecRoot + 'services/job/edit/' + nameOrDescription + '/' + jobId + '/' + name,
			{},
			function(returnCode) {
				success = parseReturnCode(returnCode);
				if (success) {
					$(textSelector).text(name);
					$(inputSelector).val(name);
					if (nameOrDescription === 'name') {
						// Change the title of the page to the new name.
						$('#mainTemplateHeader').text(name);
					}
				}
			},
			'json'
		);
		$(wrapperSelector).hide();
		$(textSelector).show();
	});

	$(inputSelector).blur(function() {
		$(wrapperSelector).hide();
		$(textSelector).show();
		$(inputSelector).val($(textSelector).text());
	});
}

function openSpace(childId) {
	$("#exploreList").jstree("open_node", "#" + curSpaceId, function() {
		$.jstree._focused().select_node("#" + childId, true);
	});
}

function getPanelTable(space) {
	var spaceName = space.attr("name");
	var spaceId = parseInt(space.attr("id"));

	return "<fieldset class=\"panelField\">" +
		"<legend class=\"panelHeader\">" + spaceName + "</legend>" +
		"<table id=panel" + spaceId + " spaceId=\"" + spaceId + "\" class=\"panel\"><thead>" +
		"<tr class=\"viewSubspace\"><th colspan=\"4\" >Go To Subspace</th></tr>" +
		"<tr><th class=\"solverHead\">solver</th><th class=\"configHead\">config</th> " +
		"<th class=\"solvedHead\" title=\"Number of job pairs for which the result matched the expected result, or those attributes are undefined, over the number of job pairs that completed without any system errors\">solved</th> " +
		"<th class=\"timeHead\" title=\"total wallclock or cpu time for all job pairs run that were solved correctly\">time</th> </tr>" +
		"</thead>" +
		"<tbody></tbody> </table></fieldset>";
}

function initializePanels() {
	DETAILS_JOB.sentSpaceId = curSpaceId;
	if (isLocalJobPage) {
		var panelJson = $.parseJSON($("#subspacePanelJson" + DETAILS_JOB.sentSpaceId)
		.attr("value"));
		handleSpacesData(panelJson);
		$("#subspacePanelJson" + DETAILS_JOB.sentSpaceId).remove();
	} else if (DETAILS_JOB.isAnonymousPage) {
		$.getJSON(starexecRoot + "services/space/anonymousLink/" + DETAILS_JOB.anonymousLinkUuid + "/jobspaces/false/" + DETAILS_JOB.primitivesToAnonymize + "?id=" + DETAILS_JOB.sentSpaceId,
			handleSpacesData);
	} else {
		$.getJSON(starexecRoot + "services/space/" + jobId + "/jobspaces/false?id=" + DETAILS_JOB.sentSpaceId,
			handleSpacesData);
	}
}

function handleSpacesData(spaces) {
	log("SPACES JSON: " + spaces);
	panelArray = [];
	if (spaces.length == 0) {
		$("#subspaceSummaryField").hide();
	} else {
		$("#subspaceSummaryField").show();
	}

	/* I'm so sorry, but because JavaScript is a Function scoped language, I
	 * need to wrap the body of this loop inside an anonymous function so that
	 * the variables we create are limited to the body of the loop.
	 * Yay for JavaScript!
	 */
	for (var i = 0; i < spaces.length; ++i) {
		(function() {
			var space = $(spaces[i]),
				spaceId = parseInt(space.attr("id")),
				child = getPanelTable(space);

			//if the user has changed spaces since this request was sent, we don't want to continue
			//generating panels for the old space.
			if (DETAILS_JOB.sentSpaceId != curSpaceId) {
				return;
			}
			$("#panelActions").after(child); //put the table after the panelActions fieldset

			var panelTableInitializer = getPanelTableInitializer(jobId,
				spaceId);
			var $panel = $("#panel" + spaceId);

			$panel.parents(".panelField").one("open.expandable", function() {
				var $this = $(this);
				panelArray.push($panel.dataTable(panelTableInitializer));

				/* We want each panel to reload its contents every 30 seconds while
				  * it is open. If it is closed, it should not reload its contents. Upon
				  * being opened, it should immediately refresh its contents because we
				  * don't know how long it has been closed and we do not want to show
				  * stale data for 30 seconds.
				  * We can keep track of the interval handle internally as
				  * `panelRefreshInterval`, but we must also expose it to `clearPanels`.
				  * For this reason, we will let jQuery save the handle also so that we
				  * can clear the interval if the panel is cleared.
				  */
				var panelRefreshInterval;
				var reload = $panel.dataTable().api().ajax.reload;
				$this.on("open.expandable", function() {
					reload();
					panelRefreshInterval = window.setInterval(reload, 30000);
					$panel.data("panelRefreshInterval", panelRefreshInterval);
				}).on("close.expandable", function() {
					window.clearInterval(panelRefreshInterval);
				});
			});
		})();
	}

	$(".viewSubspace").click(function() {
		var spaceId = $(this).parents("table.panel").attr("spaceId");
		openSpace(spaceId);
	});

	$(".panelField").expandable(true);
}

//
//  Initializes the DataTable objects
//
function initDataTables() {
	extendDataTableFunctions();
	//summary table

	var $pairTbl = $('#pairTbl'),
		$solveTbl = $("#solveTbl"),
		$compareSolvers = $("#compareSolvers");

	if (isLocalJobPage) {
		$('[id$=solveTbl]').dataTable(getSolverTableInitializer());
	} else {
		summaryTable = $solveTbl.dataTable(getSolverTableInitializer());
	}

	$solveTbl.on("mousedown", "tr", function() {
		var $this = $(this);

		if (!$this.hasClass("row_selected")) {
			$solveTbl.find(".second_selected")
			.removeClass("second_selected row_selected");
			$solveTbl.find(".first_selected")
			.removeClass("first_selected")
			.addClass("second_selected");
			$this.addClass("first_selected row_selected");
		} else {
			$this.removeClass("row_selected first_selected second_selected");
			$solveTbl.find(".second_selected")
			.removeClass("second_selected")
			.addClass("first_selected");
		}

		if ($solveTbl.find(".second_selected").size() > 0) {
			$compareSolvers.show();
		} else {
			$compareSolvers.hide();
		}
	});

	// Job pairs table
	if (isLocalJobPage) {
		$('[id$=pairTbl]').dataTable(getPairTableInitializer());
	} else {
		pairTable = $("#pairTbl").dataTable(getPairTableInitializer());
	}

	setSortTable(pairTable);

	$pairTbl.find("thead").click(function() {
		resetSortButtons();
	});

	$('#detailTbl').dataTable({
		"dom": 'rt<"bottom"f><"clear">',
		"aaSorting": [],
		"paging": false,
		"bSort": true
	});

	$pairTbl.find("tbody").on("click", "a", function(event) {
		event.stopPropogation();
	});

	//Set up row click to send to pair details page
	if (!DETAILS_JOB.isAnonymousPage) {
		$pairTbl.find("tbody").on("click", "tr", function() {
			var pairId = $(this).find('input').val();
			window.location.assign(DETAILS_JOB.starexecUrl + "secure/details/pair.jsp?id=" + pairId);
		});
	}

	// Change the filter so that it only queries the server when the user stops typing
	$pairTbl.dataTable().fnFilterOnDoneTyping();
}

//
//Adds fnProcessingIndicator and fnFilterOnDoneTyping to dataTables api
//
function extendDataTableFunctions() {
	// Allows manually turning on and off of the processing indicator (used for jobs table)
	addProcessingIndicator();
	addFilterOnDoneTyping();
}

function getPairTableInitializer() {
	var pairTableInitializer = new window.star.DataTableConfig();

	if (!isLocalJobPage) {
		pairTableInitializer["sAjaxSource"] = starexecRoot + "services/jobs/";
		pairTableInitializer["bServerSide"] = true;
		pairTableInitializer["fnServerData"] = fnPaginationHandler;
	}
	return pairTableInitializer;
}

function getSolverTableInitializer() {
	var SOLVER_ID = 0,
		CONFIG_ID = 1,
		SOLVER_NAME = 2,
		CONFIG_NAME = 3,
		SOLVED = 4,
		TIME = 5,
		STAGE = 6,
		WRONG = 7,
		RESOURCED = 8,
		FAILED = 9,
		UNKNOWN = 10,
		INCOMPLETE = 11,
		CONFLICTS = 12,
		CONFIG_DELETED = 13;

	var linkTemplate = document.createElement("a");
	linkTemplate.target = "_blank";

	var link = function(url, text) {
		linkTemplate.href = url;
		linkTemplate.textContent = text;
		return linkTemplate.outerHTML;
	};

	var pairsTemplate = [
		"pairsInSpace.jsp?type=",
		null,
		"&sid=",
		DETAILS_JOB.rootJobSpaceId,
		"&configid=",
		null,
		"&stagenum=",
		null
	];
	var getPairsInSpaceLink = function(type, configId, stageNumber) {
		pairsTemplate[1] = type;
		pairsTemplate[5] = configId;
		pairsTemplate[7] = stageNumber;
		return pairsTemplate.join("");
	};

	var conflictsTemplate = [
		"conflictingBenchmarks.jsp?jobId=",
		null,
		"&configId=",
		null,
		"&stageNumber=",
		null
	];
	var getConflictingLink = function(configId, stageNumber) {
		conflictsTemplate[1] = jobId;
		conflictsTemplate[3] = configId;
		conflictsTemplate[5] = stageNumber;
		return conflictsTemplate.join("");
	};

	var solverTemplate = ["solver.jsp?id=", null];
	var getSolverLink = function(solver) {
		solverTemplate[1] = solver;
		return solverTemplate.join("");
	};

// changed configTemplate so that href= is also null to start; now gets populated depending on
// if the config is marked as deleted or not in table configurations; Alexander Brown 9/24
	var configTemplate = [
		"<a target='_blank' class='configLink' href='",
		null,
		"?id=",
		null,
		"' id='",
		null,
		"'>",
		null,
		"</a>"
	];

	var formatConfig = function(row, type, val) {
	    if ( val[CONFIG_DELETED] == 1 ) {
	        configTemplate[1] = "configDeleted.jsp";
	    } else {
            configTemplate[1] = "configuration.jsp";
	    }
		configTemplate[3] = val[CONFIG_ID];
		configTemplate[5] = val[CONFIG_ID];
		configTemplate[7] = val[CONFIG_NAME];
		return configTemplate.join("");
	};

	var hideLink = function(href, text) {return text;};
	var noOp = function() {}; // NOOP; no need to create URLs we won't use
	if (DETAILS_JOB.primitivesToAnonymize === "all"
		|| DETAILS_JOB.primitivesToAnonymize === "allButBench") {
		link = hideLink;
		getSolverLink = noOp;
		getPairsInSpaceLink = noOp;
		getConflictingLink = noOp;

		formatConfig = function(row, type, val) {
			return val[CONFIG_NAME];
		}
	}

	var formatSolver = function(row, type, val) {
		var href = getSolverLink(val[SOLVER_ID]);
		return link(href, val[SOLVER_NAME]);
	};
	var formatSolved = function(row, type, val) {
		var href = getPairsInSpaceLink("solved", val[CONFIG_ID], val[STAGE]);
		return link(href, val[SOLVED]);
	};
	var formatSolvedText = function(row, type, val) {
		return val[SOLVED];
	};
	var formatWrong = function(row, type, val) {
		var href = getPairsInSpaceLink("wrong", val[CONFIG_ID], val[STAGE]);
		return link(href, val[WRONG]);
	};
	var formatOut = function(row, type, val) {
		var href = getPairsInSpaceLink("resource", val[CONFIG_ID], val[STAGE]);
		return link(href, val[RESOURCED]);
	};
	var formatFailed = function(row, type, val) {
		var href = getPairsInSpaceLink("failed", val[CONFIG_ID], val[STAGE]);
		return link(href, val[FAILED]);
	};
	var formatUnknown = function(row, type, val) {
		var href = getPairsInSpaceLink("unknown", val[CONFIG_ID], val[STAGE]);
		return link(href, val[UNKNOWN]);
	};
	var formatIncomplete = function(row, type, val) {
		var href = getPairsInSpaceLink("incomplete",
			val[CONFIG_ID],
			val[STAGE]);
		return link(href, val[INCOMPLETE]);
	};
	var formatTime = function(row, type, val) {
		return (val[TIME] / 100).toFixed(1);
	};
	var formatConflicts = function(row, type, val) {
		var href = getConflictingLink(val[CONFIG_ID], val[STAGE]);
		return link(href, val[CONFLICTS]);
	};

	var panelTableInitializer = new window.star.DataTableConfig({
		"dom": 'rt<"clear">',
		"pageLength": 1000, // make sure we show every entry
		"aoColumns": [
			{"mRender": formatSolver},
			{"mRender": formatConfig},
			{"mRender": formatSolvedText},
			{"mRender": formatTime},
		]
	});

	if (isLocalJobPage) {
		window.getPanelTableInitializer = function(jobId, spaceId) {
			if (useWallclock) {
				// get the JSON directly from the page if this is a local page.
				return $.extend({},
					$.parseJSON($('#jobSpaceWallclockTimeSolverStats' + spaceId)
					.attr('value')),
					panelTableInitializer
				);
			} else {
				// get the JSON directly from the page if this is a local page.
				return $.extend({},
					$.parseJSON($('#jobSpaceCpuTimeSolverStats' + spaceId)
					.attr('value')),
					panelTableInitializer
				);
			}
		}
	} else {
		var paginationUrlTemplate;
		if (DETAILS_JOB.isAnonymousPage) {
			paginationUrlTemplate = [
				starexecRoot + 'services/jobs/solvers/anonymousLink/pagination/',
				null,
				'/' + DETAILS_JOB.anonymousLinkUuid + '/' + DETAILS_JOB.primitivesToAnonymize + '/true/'
			];
		} else {
			paginationUrlTemplate = [
				starexecRoot + 'services/jobs/solvers/pagination/',
				null,
				'/true/'
			];
		}

		var getPaginationUrl = function(spaceId) {
			paginationUrlTemplate[1] = spaceId;
			return paginationUrlTemplate.join("");
		};

		panelTableInitializer["fnServerData"] = fnShortStatsPaginationHandler;
		window.getPanelTableInitializer = function(jobId, spaceId) {
			var data = $.extend({}, panelTableInitializer); // deep copy
			data["sAjaxSource"] = getPaginationUrl(spaceId);
			return data;
		}
	}

// solverTableInitializer is used to construct the solver summary page in the job space view
	var solverTableInitializer = new window.star.DataTableConfig({
		"bSort": true,
		"bPaginate": true,
		"aoColumns": [
			{"mRender": formatSolver},
			{"mRender": formatConfig},
			{"mRender": formatSolved},
			{"mRender": formatWrong},
			{"mRender": formatOut},
			{"mRender": formatFailed},
			{"mRender": formatUnknown},
			{"mRender": formatIncomplete},
			{"mRender": formatTime},
			{"mRender": formatConflicts},
		]
	});

	if (!isLocalJobPage) {
		solverTableInitializer["sAjaxSource"] = starexecRoot + "services/jobs/";
		solverTableInitializer["fnServerData"] = fnStatsPaginationHandler;
	} else {
		delete solverTableInitializer["aoColumns"];
	}

	return solverTableInitializer;
}

function fnShortStatsPaginationHandler(sSource, aoData, fnCallback) {
	$.post(
		sSource + useWallclock + "/" + getSelectedStage(),
		aoData,
		function(nextDataTablePage) {
			//if the user has clicked on a different space since this was called, we want those results, not these
			var s = parseReturnCode(nextDataTablePage);
			if (s) {
				fnCallback(nextDataTablePage);
			}
		},
		"json"
	).fail(function(code, textStatus) {
		handleAjaxError(textStatus);
	});
}

function fnStatsPaginationHandler(sSource, aoData, fnCallback) {
	if (typeof curSpaceId == 'undefined') {
		return;
	}

	var postUrl;
	if (DETAILS_JOB.isAnonymousPage) {
		postUrl = sSource + "solvers/anonymousLink/pagination/" + curSpaceId + "/" + getParameterByName(
			"anonId") +
			"/" + DETAILS_JOB.primitivesToAnonymize + "/false/" + useWallclock + "/" + getSelectedStage();
	} else {
		postUrl = sSource + "solvers/pagination/" + curSpaceId + "/false/" + useWallclock + "/" + getSelectedStage();
	}
	var xhr = $.post(
		postUrl,
		aoData,
		function(nextDataTablePage) {
			//if the user has clicked on a different space since this was called, we want those results, not these
			var s = parseReturnCode(nextDataTablePage);
			if (s) {
				$("#solverSummaryField").show();
				$("#graphField").show();
				$("#statsErrorField").hide();
				fnCallback(nextDataTablePage);
			}
		},
		"json"
	).fail(function(code, textStatus) {
		handleAjaxError(textStatus);
	});

	openAjaxRequests.push(xhr);
}

//
//  Handles querying for pages in a given DataTable object
//
//  @param sSource the "sAjaxSource" of the calling table
//  @param aoData the parameters of the DataTable object to send to the server
//  @param fnCallback the function that actually maps the returned page to the DataTable object
//
function fnPaginationHandler(sSource, aoData, fnCallback) {
	if (typeof curSpaceId == 'undefined') {
		return;
	}
	if (sortOverride != null) {
		aoData.push({'name': 'sort_by', 'value': getSelectedSort()});
		aoData.push({'name': 'sort_dir', 'value': isASC()});
	}

	var postUrl = null;
	if (DETAILS_JOB.isAnonymousPage) {
		postUrl = sSource + 'pairs/pagination/anonymousLink/' + DETAILS_JOB.anonymousLinkUuid + '/' + curSpaceId +
			'/' + useWallclock + '/' + syncResults + '/' + getSelectedStage() + '/' + DETAILS_JOB.primitivesToAnonymize;
	} else {
		postUrl = sSource + 'pairs/pagination/' + curSpaceId + '/' + useWallclock + '/' + syncResults + '/' + getSelectedStage();
	}

	var xhr = $.post(
		postUrl,
		aoData,
		function(nextDataTablePage) {
			var s = parseReturnCode(nextDataTablePage);
			if (s) {
				pairTable.fnProcessingIndicator(false);
				fnCallback(nextDataTablePage);
				$("#errorField").hide();
				if (pairTable.fnSettings().fnRecordsTotal() == 0) {
					$("#pairTblField").hide();
				} else {
					$("#pairTblField").show();
				}
			} else {
				//if we weren't successful, we need to check to see if it was because there are too many pairs
				var code = getStatusCode(nextDataTablePage);
				if (code == 1) {
					$("#pairTblField").hide();
					$("#errorField").show();
				}
			}
		},
		"json"
	).fail(function(code, textStatus) {
		handleAjaxError(textStatus);
	});

	openAjaxRequests.push(xhr);
}

function popup(url) {
	var win = window.open(url, '_blank');
	if (win) {
		// Browser allowed opening of popup.
		win.focus();
	}
}

function registerAnonymousLinkButtonEventHandler() {
	$('#anonymousLink').unbind('click');
	$('#anonymousLink').click(function() {
		$('#dialog-confirm-anonymous-link').text(
			"Do you want the job, benchmark, solver, and configuration names to be hidden on the linked page?");
		$('#dialog-confirm-anonymous-link').dialog({
			modal: true,
			width: 600,
			height: 200,
			buttons: {
				'everything': function() {
					$(this).dialog('close');
					makeAnonymousLinkPost('job', jobId, 'all');
				},
				'everything except benchmarks': function() {
					$(this).dialog('close');
					makeAnonymousLinkPost('job', jobId, 'allButBench');
				},
				'nothing': function() {
					$(this).dialog('close');
					makeAnonymousLinkPost('job', jobId, 'none');
				}
			}
		});
	});
}
