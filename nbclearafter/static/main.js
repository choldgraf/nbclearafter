define([
    'base/js/events'
], function (events) {

    // Called every time a cell is executed
    function execute_codecell_callback(e, data) {
        var cell = data.cell;
        var all_cells = cell.notebook.get_cells();
        var start_clearing = false;

        // Loop through all cells until we find the cell that was just executed
        // Clear output of all cells that come after it.
        for (var i = 0; i < all_cells.length; i++) {
            var cur_cell = all_cells[i];
            if (cur_cell.cell_type !== "code") {
                continue
            }
            if (start_clearing) {
                cur_cell.clear_output();
            } else if (cur_cell.cell_id === cell.cell_id) {
                start_clearing = true;
            }
        }
    }

    var load_jupyter_extension = function () {
        // FIXME: This should instead hook to cell execution *finish*, not start
        events.on('execute.CodeCell', execute_codecell_callback);
    };

    return {
        load_ipython_extension: load_jupyter_extension,
        load_jupyter_extension: load_jupyter_extension
    };
});
