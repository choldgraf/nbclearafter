define([
    'base/js/events',
    'base/js/namespace',
    "notebook/js/codecell",
], function(events, Jupyter, codecell) {
    var mod_name = 'NBLinear';
    var log_prefix = '[' + mod_name + ']';
    var CodeCell = codecell.CodeCell;

    // Called every time a cell is executed
    function execute_codecell_callback() {
        var cell = this;
        var all_cells = this.notebook.get_cells();
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

            if (cur_cell.get_text().length === 0) {
               cur_cell.editable = true;
            }
        }
    }

    function patch_CodeCell_execute () {
        console.log(log_prefix, 'Patching CodeCell.prototype.execute for linear flow.');
        var orig_execute = CodeCell.prototype.execute;
        CodeCell.prototype.execute = function () {
            if (Jupyter.linear_mode) {
                execute_codecell_callback.apply(this, arguments);
            }
            var ret = orig_execute.apply(this, arguments);
            return ret
        };
    }

    function place_button() {
      if (!Jupyter.toolbar) {
          $([Jupyter.events]).on("app_initialized.NotebookApp", place_button);
          return;
      }
      Jupyter.toolbar.add_buttons_group([{
          label: 'Linear Off',
          icon: 'fa-arrow-right',
          callback: toggle_linear
      }])
      }

      function toggle_linear() {
          if (Jupyter.linear_mode) {
              linear_status = 'off';
              all_cells = Jupyter.notebook.get_cells();
              for (var i = 0; i < all_cells.length; i++) {
                  var cur_cell = all_cells[i];
                  cur_cell.metadata.editable = true;
                  cur_cell.element[0].classList.remove('stale');
                  cur_cell.element[0].classList.remove('inactive');
                  $("button[title|='Linear Off'] span").text('Linear Off')
              }
          } else {
              linear_status = 'on';
              $("button[title|='Linear Off'] span").text('Linear On')
          }
          Jupyter.linear_mode = !Jupyter.linear_mode;
          console.info(log_prefix, "Linear mode is " + linear_status)
      }

      function init_linear_mode() {
          if (Jupyter.notebook.metadata.linear_mode === true) {
              Jupyter.linear_mode = true;
              console.info('blah')
              $("button[title|='Linear Off'] span").text('Linear On')
          } else {
              Jupyter.linear_mode = false;
          }
      }

      var load_jupyter_extension = function () {
          document.styleSheets[0].insertRule("div.inactive span {color: #929292 !important }")
          patch_CodeCell_execute();
          place_button();
          init_linear_mode();
      };

      return {
          load_ipython_extension: load_jupyter_extension,
          load_jupyter_extension: load_jupyter_extension
      };
});
