H5P Editor Color Selector
==========

A visual color selector for the H5P Editor. Wrapping bgrins' JavaScript
Colorpicker found here: http://bgrins.github.io/spectrum/

## Usage

In your semantics.json set:
```json
"widget": "colorSelector"
```
It is possible to configure the color chooser with all the settings supported by
spectrum by adding the spectrum attribute to your semantics.json. E.g:
```json
"widget": "colorSelector",
"spectrum": {
  "showPalette": true,
  "palette": [
        ["black", "white", "blanchedalmond"],
        ["rgb(255, 128, 0);", "hsv 100 70 50", "lightyellow"]
    ]
}
```

## License

(The MIT License)

Copyright (c) 2015 Joubel AS

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
