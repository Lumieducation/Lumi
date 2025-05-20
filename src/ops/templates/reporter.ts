import fsExtra from 'fs-extra';
import { IIntegration } from '@lumieducation/h5p-server';

function createReporter(main: string): string {
  return `<script>
    !(function (e) {
        function t(t) {
            for (
                var n, l, i = t[0], f = t[1], a = t[2], c = 0, s = [];
                c < i.length;
                c++
            )
                (l = i[c]),
                    Object.prototype.hasOwnProperty.call(o, l) &&
                        o[l] &&
                        s.push(o[l][0]),
                    (o[l] = 0);
            for (n in f)
                Object.prototype.hasOwnProperty.call(f, n) &&
                    (e[n] = f[n]);
            for (p && p(t); s.length; ) s.shift()();
            return u.push.apply(u, a || []), r();
        }
        function r() {
            for (var e, t = 0; t < u.length; t++) {
                for (var r = u[t], n = !0, i = 1; i < r.length; i++) {
                    var f = r[i];
                    0 !== o[f] && (n = !1);
                }
                n && (u.splice(t--, 1), (e = l((l.s = r[0]))));
            }
            return e;
        }
        var n = {},
            o = { 1: 0 },
            u = [];
        function l(t) {
            if (n[t]) return n[t].exports;
            var r = (n[t] = { i: t, l: !1, exports: {} });
            return (
                e[t].call(r.exports, r, r.exports, l),
                (r.l = !0),
                r.exports
            );
        }
        (l.m = e),
            (l.c = n),
            (l.d = function (e, t, r) {
                l.o(e, t) ||
                    Object.defineProperty(e, t, {
                        enumerable: !0,
                        get: r
                    });
            }),
            (l.r = function (e) {
                'undefined' != typeof Symbol &&
                    Symbol.toStringTag &&
                    Object.defineProperty(e, Symbol.toStringTag, {
                        value: 'Module'
                    }),
                    Object.defineProperty(e, '__esModule', {
                        value: !0
                    });
            }),
            (l.t = function (e, t) {
                if ((1 & t && (e = l(e)), 8 & t)) return e;
                if (4 & t && 'object' == typeof e && e && e.__esModule)
                    return e;
                var r = Object.create(null);
                if (
                    (l.r(r),
                    Object.defineProperty(r, 'default', {
                        enumerable: !0,
                        value: e
                    }),
                    2 & t && 'string' != typeof e)
                )
                    for (var n in e)
                        l.d(
                            r,
                            n,
                            function (t) {
                                return e[t];
                            }.bind(null, n)
                        );
                return r;
            }),
            (l.n = function (e) {
                var t =
                    e && e.__esModule
                        ? function () {
                              return e.default;
                          }
                        : function () {
                              return e;
                          };
                return l.d(t, 'a', t), t;
            }),
            (l.o = function (e, t) {
                return Object.prototype.hasOwnProperty.call(e, t);
            }),
            (l.p = '/');
        var i = (this.webpackJsonplumitest =
                this.webpackJsonplumitest || []),
            f = i.push.bind(i);
        (i.push = t), (i = i.slice());
        for (var a = 0; a < i.length; a++) t(i[a]);
        var p = f;
        r();
    })([]);
</script>
<script>${main}</script>`;
}

export default function generateReporter(
  integration: IIntegration,
  scriptsBundle: string,
  stylesBundle: string,
  contentId: string
): string {
  const reporterMain = fsExtra.readFileSync(
    `${__dirname}/../../../../reporter-client/build/static/js/main.js`,
    {
      encoding: 'utf-8'
    }
  );

  return `<!doctype html>
<html class="h5p-iframe">
<head>
<meta charset="utf-8">                    
<meta name="viewport" content="width=device-width, initial-scale=1"> 
<script>H5PIntegration = ${JSON.stringify(integration)};
if (new URLSearchParams(window.location.search).get('embed') == 'true') {
    H5PIntegration.contents['cid-' + '${contentId}'].displayOptions.embed = false;
} else {
    H5PIntegration.contents['cid-' + '${contentId}'].embedCode = '<iframe src="' + window.location.protocol + "//" + window.location.host + window.location.pathname + '?embed=true' + '" width=":w" height=":h" frameborder="0" allowfullscreen="allowfullscreen"></iframe>';
    H5PIntegration.contents['cid-' + '${contentId}'].resizeCode = '';
}
${scriptsBundle}</script>
<style>${stylesBundle}</style>
</head>
<body>
<div id="root"></div>
${createReporter(reporterMain)}
<div style="margin: 20px auto; padding: 20px;  max-width: 840px; box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)" class="h5p-content lag" data-content-id="${contentId}"></div>                
</body>
</html>`;
}
