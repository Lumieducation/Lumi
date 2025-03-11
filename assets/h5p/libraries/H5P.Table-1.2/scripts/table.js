var H5P = H5P || {};

/**
 * Constructor.
 *
 * @param {object} params Options for this library.
 * @param {int} id Content identifier
 */
H5P.Table = function (params, id) {
  const defaultTable = '<figure class="table">' +
                          '<table class="h5p-table">' +
                            '<thead>' +
                              '<tr>' +
                                '<th>Heading Column 1</th>' +
                                '<th>Heading Column 2</th>'+
                              '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                              '<tr>' +
                                '<td>Row 1 Col 1</td>' +
                                '<td>Row 1 Col 2</td>' +
                              '</tr>' +
                              '<tr>' +
                                '<td>Row 2 Col 1</td>' +
                                '<td>Row 2 Col 2</td>' +
                              '</tr>' +
                            '</tbody>' +
                          '</table>' +
                        '</figure>'
  this.text = params.text === undefined ? defaultTable : params.text;
};

/**
 * Wipe out the content of the wrapper and put our HTML in it.
 *
 * @param {jQuery} $wrapper
 */
H5P.Table.prototype.attach = function ($wrapper) {
  $wrapper.addClass('h5p-table').html(this.text);
};