var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.InteractiveBook'] = (function () {
  return {
    1: {
      /**
       * Upgrade cover description to not imply "centered"
       * @param {object} parameters Parameters of content.
       * @param {function} finished Callback.
       * @param {object} extras Metadata.
       */
      6: function (parameters, finished, extras) {
        if (parameters && parameters.bookCover) {
          const bookCover = parameters.bookCover;

          const convertToImageParams = function (file, alt) {
            const imageParams = {
              library: 'H5P.Image 1.1',
              metadata: {
                contentType: 'Image',
                license: 'U',
                title: 'Untitled Image'
              },
              params: {
                contentName: 'Image',
                decorative: false
              },
              subContentId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
                const random = Math.random()*16|0, newChar = char === 'x' ? random : (random&0x3|0x8);
                return newChar.toString(16);
              })
            };

            if (alt) {
              imageParams.params.alt = alt;
            }

            if (file) {
              imageParams.params.file = file;
              if (file.copyright) {
                const copyright = file.copyright;

                if (copyright.author) {
                  imageParams.metadata.authors = [{
                    name: copyright.author,
                    role: 'Author'
                  }];
                }

                if (copyright.license) {
                  imageParams.metadata.license = copyright.license;
                }

                if (copyright.source) {
                  imageParams.metadata.source = copyright.source;
                }

                if (copyright.title) {
                  imageParams.metadata.title = copyright.title;
                }

                if (copyright.version) {
                  imageParams.metadata.licenseVersion = copyright.version;
                }

                if (copyright.year && !isNaN(parseInt(copyright.year))) {
                  imageParams.metadata.yearFrom = parseInt(copyright.year);
                }

                delete imageParams.params.file.copyright;
              }
            }

            return imageParams;
          };

          if (bookCover.coverAltText || bookCover.coverImage) {
            bookCover.coverMedium = convertToImageParams(bookCover.coverImage, bookCover.coverAltText);
          }

          delete bookCover.coverImage;
          delete bookCover.coverAltText;
        }
        
        if (parameters && parameters.bookCover && parameters.bookCover.coverDescription) {
          if (parameters.bookCover.coverDescription.substr(0, 2) !== '<p') {
            parameters.bookCover.coverDescription = '<p style="text-align: center;">' + parameters.bookCover.coverDescription + '</p>'; // was plain text
          }
          else {
            parameters.bookCover.coverDescription = parameters.bookCover.coverDescription.replace(/<p[^>]*>/g, '<p style="text-align: center;">');
          }
        }

        finished(null, parameters, extras);
      },
      11: function (parameters, finished, extras) {
        if (parameters && parameters.bookCover && parameters.bookCover.coverDescription) {
          const tables = parameters.bookCover.coverDescription.split('<table');
          let newParams = tables[0];

          for (let i = 1; i < tables.length; i++) {
            let tableChanges = false;
            let cellChanges = false;
            let style = 'style="';
            let cellStyle = 'style="';

            // Find and replace border width and style
            if (tables[i].includes('border')) {
              const needle = 'border="';
              const needleStart = tables[i].indexOf(needle);
              const needleEnd = tables[i].indexOf('"', needleStart + needle.length);
              const borderWidth = parseInt(tables[i].substring(needleStart + needle.length, needleEnd));

              style += 'border-style:solid;border-collapse:collapse;' + 'border-width:' + borderWidth + 'px;';
              cellStyle += tables[i].includes('h5p-table') ?
                'border-style:solid;' :
                'border-style:double;border-collapse:collapse;border-width:0.15em;';

              tableChanges = true;
              cellChanges = true;
            }
            else {
              style += 'border-style:none;';
              cellStyle += 'border-style:none;';
              tableChanges = true;
              cellChanges = true;
            }

            // Find and replace cell padding
            if (tables[i].includes('cellpadding')) {
              const needle = 'cellpadding="';
              const needleStart = tables[i].indexOf(needle);
              const needleEnd = tables[i].indexOf('"', needleStart + needle.length);
              const cellPadding = parseInt(tables[i].substring(needleStart + needle.length, needleEnd));

              cellStyle += 'padding:' + cellPadding + 'px;';
              tables[i] = tables[i].replace(/cellpadding="[0-9]*"/, '');

              cellChanges = true;
            }

            if (tableChanges) {
              const tagEnd = tables[i].indexOf('>');
              let substring = tables[i].substring(0, tagEnd);

              // Set border style on the table
              if (substring.includes('style="')) {
                tables[i] = substring.replace('style="', style) + tables[i].substring(tagEnd);
              }
              else {
                tables[i] = ' ' + style + '"' + tables[i];
              }
            }

            if (cellChanges) {
              // Set border style on header cells
              let headers = tables[i].split(/<th(?!ead)/);
              tables[i] = headers[0];

              for (let j = 1; j < headers.length; j++) {
                tables[i] += '<th';

                const tagEnd = headers[j].indexOf('>');
                let substring = headers[j].substring(0, tagEnd);

                if (substring.includes('style="')) {
                  tables[i] += substring.replace('style="', cellStyle) + headers[j].substring(tagEnd);
                }
                else {
                  tables[i] += ' ' + cellStyle + '"' + headers[j];
                }
              }

              // Set border style on cells
              let cells = tables[i].split('<td');
              tables[i] = cells[0];

              for (let j = 1; j < cells.length; j++) {
                tables[i] += '<td';

                const tagEnd = cells[j].indexOf('>');
                let substring = cells[j].substring(0, tagEnd);

                if (substring.includes('style="')) {
                  tables[i] += substring.replace('style="', cellStyle) + cells[j].substring(tagEnd);
                }
                else {
                  tables[i] += ' ' + cellStyle + '"' + cells[j];
                }
              }
            }

            newParams += '<table' + tables[i];
          }

          parameters.bookCover.coverDescription = newParams;
        }
        
        finished(null, parameters, extras);
      }
    }
  };
})();
