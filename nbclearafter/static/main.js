define([
    'base/js/events'
], function (events) {

    var initialize = function () {
        // add our extension's css to the page
        $('<link/>')
            .attr({
                rel: 'stylesheet',
                type: 'text/css',
                href: requirejs.toUrl('./static/nbclearafter.css')
            })
            .appendTo('head');
    };

    // Called every time a cell is executed
    function execute_codecell_callback(e, data) {
        var cell = data.cell;
        var all_cells = cell.notebook.get_cells();
        var ix_start = all_cells.indexOf(cell);

        // Loop through all cells until we find the cell that was just executed
        // Clear output of all cells that come after it.
        for (var i = 0; i < all_cells.length; i++) {
            var cur_cell = all_cells[i];
            // Skip cells we don't care about
            if (cur_cell.cell_type !== "code") {
                continue;
            }
            // Earlier cells should be run in order if they're stale
            if ((i < ix_start) && cur_cell.element[0].classList.contains('stale')) {
              cur_cell.execute();
            }
            // The current cell should now be editable and active
            cur_cell.metadata.editable = true;
            cur_cell.element[0].classList.remove('inactive');
            cur_cell.element[0].classList.remove('stale');

            // The next cell is stale but inactive
            if (i === (ix_start + 1)) {
              cur_cell.clear_output();
              cur_cell.metadata.editable = false;
              cur_cell.element[0].classList.add('stale');
            }
            // The remaining cells are both stale and inactive
            if (i > (ix_start + 1)) {
              // Subsequent cells are now inactive and stale
              cur_cell.clear_output();
              cur_cell.metadata.editable = false;
              cur_cell.element[0].classList.add('stale');
              cur_cell.element[0].classList.add('inactive');
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
