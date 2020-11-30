/**
 * For a given dataTable, this extracts the id's of the rows that have been
 * selected by the user
 *
 * @param dataTable the particular dataTable to extract the id's from
 * @returns {Array} list of id values for the selected rows
 * @author Todd Elvers
 */
function getSelectedRows(dataTable) {
	var idArray = [];
	var rows = $(dataTable).children('tbody').children('tr.row_selected');
	$.each(rows, function(i, row) {
		idArray.push($(this).children('td:first').children('input').val());
	});
	return idArray;
}

function addFilterOnDoneTyping() {
	// Changes the filter so that it only queries when the user is done typing
	jQuery.fn.dataTableExt.oApi.fnFilterOnDoneTyping = function(oSettings) {
		var _that = this;
		this.each(function(i) {
			$.fn.dataTableExt.iApiIndex = i;
			var anControl = $('input', _that.fnSettings().aanFeatures.f);
			anControl.unbind('keyup')
			.bind('keyup', $.debounce(400, function(e) {
				$.fn.dataTableExt.iApiIndex = i;
				_that.fnFilter(anControl.val());
			}));
			return this;
		});
		return this;
	};
}

function addProcessingIndicator() {
	jQuery.fn.dataTableExt.oApi.fnProcessingIndicator = function(
		oSettings, onoff) {
		if (typeof(onoff) == 'undefined') {
			onoff = true;
		}
		this.oApi._fnProcessingDisplay(oSettings, onoff);
	};
}

