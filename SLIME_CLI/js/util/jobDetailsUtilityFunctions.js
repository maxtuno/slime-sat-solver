$(document).ready(function() {
	$(".stageSelector").first().each(function() {
		if ($(this).children().size() <= 2) {
			hideStageSelectors();
		}
	});
});

function hideStageSelectors() {
	$(".stageSelector").hide();
	$(".stageSelectorLabel").hide();
	setInputToValue(".stageSelector", "1");
}

function showStageSelectors() {
	$(".stageSelector").show();
	$(".stageSelectorLabel").show();
}

function setTimeButtonText() {
	if (useWallclock) {
		$(".changeTime .ui-button-text").html("use CPU time");
	} else {
		$(".changeTime .ui-button-text").html("use wall time");
	}
}

function setSelectedStage(stage) {
	$(".stageSelector").val(stage);
}

//gets the selected stage. If there is not one, defaults to 0
function getSelectedStage() {
	value = $("#subspaceSummaryStageSelector").val();
	if (!stringExists(value)) {
		return "0";
	}

	return value;
}

//Sets the stages dropdown menu with all needed options
function setMaxStagesDropdown(maximum) {
	$('.stageSelector').empty();

	$('.stageSelector')
	.not(".noPrimaryStage")
	.append($("<option></option>").attr("value", "0").text("Primary"));
	setInputToValue(".stageSelector", "0");
	x = 1;
	while (x <= maximum) {
		$('.stageSelector')
		.append($("<option></option>").attr("value", x).text(x));
		x = x + 1;
	}
	if (maximum == 1) {
		hideStageSelectors();
	} else {
		showStageSelectors();
	}

}