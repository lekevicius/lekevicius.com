(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{"00au":function(M,N,e){M.exports=e.p+"static/brusselsairlines-d7ca8b5f727e6f45633812c3f2bb063e.svg"},"16l3":function(M,N,e){"use strict";e.r(N),e.d(N,"pageQuery",(function(){return d}));e("rE2o"),e("ioFf"),e("XfO3"),e("HEwt"),e("a1Th"),e("f3/d"),e("0mN4"),e("SRfc"),e("rGqo"),e("yt8O"),e("Btvt"),e("RW0V");var t=e("q1tI"),c=e.n(t),a=e("Wbzz"),z=e("9eSz"),j=e.n(z),D=e("LvDl"),T=e("RJaA"),i=(e("UaTi"),e("kCXl")),n=e("3QGZ"),r=e.n(n),s=e("2tlq"),o=e.n(s),u=e("00au"),g=e.n(u),l=e("k1yg"),I=e.n(l);function L(M){var N=0;if("undefined"==typeof Symbol||null==M[Symbol.iterator]){if(Array.isArray(M)||(M=function(M,N){if(!M)return;if("string"==typeof M)return y(M,N);var e=Object.prototype.toString.call(M).slice(8,-1);"Object"===e&&M.constructor&&(e=M.constructor.name);if("Map"===e||"Set"===e)return Array.from(M);if("Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return y(M,N)}(M)))return function(){return N>=M.length?{done:!0}:{done:!1,value:M[N++]}};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return(N=M[Symbol.iterator]()).next.bind(N)}function y(M,N){(null==N||N>M.length)&&(N=M.length);for(var e=0,t=new Array(N);e<N;e++)t[e]=M[e];return t}var w={projects:{name:"Projects",description:"Currently my focus is on designing and developing useful and delightful apps. This section contains projects I have released, both recently and in the past. My most successful one, Infinite Loop game, was sold in 2016 and I no longer maintain it."},"open-source":{name:"Open Source",description:'Occasionally I build something useful and release it on <a href="https://github.com/lekevicius">GitHub</a>. I’m not a very consistent maintainer of these projects, but stars and follows are always appreciated and motivating. This website is also <a href="https://github.com/lekevicius/lekevicius.com">open sourced</a>.'},hacks:{name:"Smaller hacks",description:"I love playing with new tech and shipping smaller, even if not perfectly polished hacks. These are by no means “products”. Some are artistic or more conceptual, others were built just because I could."},studies:{name:"Study projects",description:'I have studied in <a href="https://www.baaa.dk/programmes/ap-degree/multimedia-design/">Business Academy Aarhus</a> (AP, Multimedia Design) and <a href="http://www.vda.lt/en/study_programs/undergraduate-ba/graphic-design/graphic-design-undergraduate-vilnius/">Vilnius Academy of Arts</a> (BA, Graphic Design). This section contains a few of the more interesting works I did as study projects. Sound Shapes in particular grew from a pretty small study project to a profit-generating venture.'},"lemon-labs":{name:"Works at Lemon Labs",description:"Love forever"}},O=Object.keys(w),E={};O.map((function(M,N){return E[M]=N}));var Q=function(M){var N,e;function t(){return M.apply(this,arguments)||this}return e=M,(N=t).prototype=Object.create(e.prototype),N.prototype.constructor=N,N.__proto__=e,t.prototype.render=function(){for(var M,N=Object(D.get)(this,"props.data.allMarkdownRemark.group"),e=L(i);!(M=e()).done;)for(var t,z=M.value,n=L(N);!(t=n()).done;){var s=t.value;if(s.fieldValue===z.group){for(var u,l=!1,y=L(s.edges);!(u=y()).done;){u.value.node.fields.slug===z.slug&&(l=!0)}l||s.edges.push({node:{fields:{slug:z.slug,projectPath:z.path},frontmatter:z}})}}var O={};return Object(D.get)(this,"props.data.allFile.edges").map((function(M){var N=M.node,e=N.absolutePath.match(/\/projects\/([a-z0-9-]+)\/project-image/);return e&&(O[e[1]]=N.childImageSharp.fixed),null})),c.a.createElement(T.a,{location:this.props.location,title:"Projects"},Object(D.orderBy)(N,(function(M){return E[M.fieldValue]?E[M.fieldValue]:-1})).map((function(M){var N=M.fieldValue;return c.a.createElement("div",{className:"project-group",key:M.fieldValue},c.a.createElement("h4",{className:"section-title"},w[N].name),w[N].description&&c.a.createElement("div",{className:"content-layout"},c.a.createElement("div",{className:"content"},c.a.createElement("p",{className:"intro secondary",dangerouslySetInnerHTML:{__html:w[N].description}}))),c.a.createElement("ul",{className:"project-list"},Object(D.orderBy)(M.edges,(function(M){return M.node.frontmatter.order})).map((function(M){var N=M.node;return c.a.createElement("li",{key:N.frontmatter.title},c.a.createElement(a.Link,{to:N.fields.projectPath},c.a.createElement(j.a,{fixed:O[N.fields.slug]}),c.a.createElement("h3",null,N.frontmatter.title),c.a.createElement("p",{className:"secondary"},N.frontmatter.description)))}))))})),c.a.createElement("div",{className:"project-group client-logos"},c.a.createElement("h4",{className:"section-title"},"Notable clients"),c.a.createElement("div",{className:"content-layout"},c.a.createElement("div",{className:"content"},c.a.createElement("p",{className:"intro secondary"},"I have been doing client work of all kinds — websites, apps, games, magazines, videos — for over 10 years. Currently I am not available for any freelance or contract work. However, I would like to mention a couple of clients that I had pleasure to work with."))),c.a.createElement("ul",{className:"project-list"},c.a.createElement("li",null,c.a.createElement("img",{alt:"Coca-Cola",src:r.a})),c.a.createElement("li",null,c.a.createElement("img",{alt:"Hitachi",src:o.a})),c.a.createElement("li",null,c.a.createElement("img",{alt:"Brussels Airlines",src:g.a})),c.a.createElement("li",null,c.a.createElement("img",{alt:"Barclay's",src:I.a})))))},t}(c.a.Component);N.default=Q;var d="1482582013"},"2tlq":function(M,N){M.exports="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjE4cHgiIGhlaWdodD0iMTIwcHgiIHZpZXdCb3g9IjAgMCAyMTggMTIwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA1Mi40ICg2NzM3OCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+aGl0YWNoaTwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJSZWN0YW5nbGUtMS0rLXBhdGgzNjIxIiBmaWxsPSIjODA4MDgwIj4KICAgICAgICAgICAgPHBhdGggZD0iTTE2Ni42MjQzNzMsNDUuNzIzNjY5NiBMMTY2LjYyNDM3Myw1Ny4zMjk5MzQ3IEwxODIuMjU3MzMsNTcuMzI5OTM0NyBDMTgyLjI1NzMzLDU3LjM3MTM4NDMgMTgyLjI0MzQzMyw0NS43MjE5MzY3IDE4Mi4yNTczMyw0NS43MjM2Njk2IEMxODIuMjQzNDMzLDQ1LjcyMTkzNjcgMTg5LjkxOTk0MSw0NS43MjM2Njk2IDE4OS45OTk5MTIsNDUuNzIzNjY5NiBDMTg5Ljk5OTkxMiw0NS43MjM2Njk2IDE5MC4wMjU5OTEsNzQuNzE4NjI1IDE4OS45OTk5MTIsNzQuNzQ3OTc5MyBDMTg5Ljk4OTQ4LDc0Ljc0OTcxMjEgMTgyLjI2NjAyOSw3NC43NDk3MTIxIDE4Mi4yNTczMyw3NC43NDc5NzkzIEwxODIuMjU3MzMsNjEuOTc1OTA5OSBDMTgyLjI1NzMzLDYyLjAxMjE3ODMgMTY2LjYyNDM3Myw2MS45NzU5MDk5IDE2Ni42MjQzNzMsNjEuOTc1OTA5OSBDMTY2LjYzNjU1NSw2Mi4wMjQyNTYyIDE2Ni42MjQzNzMsNzQuNzU2NjI2MiAxNjYuNjI0MzczLDc0Ljc0Nzk3OTMgTDE1OC44ODcwMDcsNzQuNzQ3OTc5MyBDMTU4Ljg4NzAwNyw3NC43NDc5NzkzIDE1OC45Mjg3MzQsNDUuNzIzNjY5NiAxNTguODg3MDA3LDQ1LjcyMzY2OTYgTDE2Ni42MjQzNzMsNDUuNzIzNjY5NiBaIE05My4xNjQ2MTc0LDQ1LjcyMzY2OTYgQzkzLjE2NjM1MDMsNDUuODA4MzAxNiA5My4xNjQ2MTc0LDUwLjY2MTUwNzQgOTMuMTY0NjE3NCw1MC42NjE1MDc0IEw4MS4zMzA3OTU1LDUwLjY2MTUwNzQgTDgxLjMzMDc5NTUsNzQuNzQ3OTc5MyBMNzMuNTg5OTQ2OCw3NC43NDc5NzkzIEw3My41ODk5NDY4LDUwLjY2MTUwNzQgTDYxLjc1OTYwNzgsNTAuNjYxNTA3NCBDNjEuNzU5NjA3OCw1MC42NjE1MDc0IDYxLjc3MzUwNTIsNDUuNzMwNTgzNiA2MS43NTk2MDc4LDQ1LjcyMzY2OTYgQzYxLjc3MzUwNTIsNDUuNzMwNTgzNiA5My4xNjQ2MTc0LDQ1LjcyMzY2OTYgOTMuMTY0NjE3NCw0NS43MjM2Njk2IFogTTEyMy4yNTE2NjIsNzQuNzQ3OTc5MyBDMTIzLjI3NjAwOCw3NC43NDk3MTIxIDExNC41NzcxMjMsNzQuNzQ3OTc5MyAxMTQuNjMyNzY1LDc0Ljc0Nzk3OTMgQzExNC42NDQ5MjksNzQuNzQ3OTc5MyAxMTIuMTAxMTY5LDY4LjUwNzg3NTkgMTEyLjEwMTE2OSw2OC41MDc4NzU5IEw5Ny41OTQ5MDU4LDY4LjUwNzg3NTkgQzk3LjU5NDkwNTgsNjguNTA3ODc1OSA5NS4wOTk4MjEsNzQuNzU2NjI2MiA5NS4wNjMzMSw3NC43NDc5NzkzIEM5NS4wNzAyNTg3LDc0Ljc1NjYyNjIgODYuNDQ2MTQ1Niw3NC43NDc5NzkzIDg2LjQ0NjE0NTYsNzQuNzQ3OTc5MyBMMTAwLjEwMDQyMiw0NS43MjM2Njk2IEMxMDAuMTAwNDIyLDQ1Ljc0MDk0NiAxMDkuNTkyMTY5LDQ1LjcyMzY2OTYgMTA5LjU5MjE2OSw0NS43MjM2Njk2IEwxMjMuMjUxNjYyLDc0Ljc0Nzk3OTMgWiBNMTA0Ljg0NTQyOSw1MC42NjE1MDc0IEwxMTAuMjM4OTcsNjMuODYxOTE4IEw5OS40NjA1NzAzLDYzLjg2MTkxOCBMMTA0Ljg0NTQyOSw1MC42NjE1MDc0IFogTTE5Ni4xMjg5NTcsNDUuNzIzNjY5NiBMMjAzLjg3NTAwNSw0NS43MjM2Njk2IEwyMDMuODc1MDA1LDc0Ljc0Nzk3OTMgTDE5Ni4xMjg5NTcsNzQuNzQ3OTc5MyBMMTk2LjEyODk1Nyw0NS43MjM2Njk2IFogTTIxLjc0MjYzMjMsNDUuNzIzNjY5NiBDMjEuNzQyNjMyMyw0NS43MjM2Njk2IDIxLjczMzk1MDgsNTcuNDEyODMzOSAyMS43NDI2MzIzLDU3LjMyOTkzNDcgTDM3LjM2NjkwOCw1Ny4zMjk5MzQ3IEMzNy4zNjY5MDgsNTcuMzcxMzg0MyAzNy4zNTgyMDkxLDQ1LjcyMTkzNjcgMzcuMzY2OTA4LDQ1LjcyMzY2OTYgQzM3LjM1ODIwOTEsNDUuNzIxOTM2NyA0NS4wMjk1MDE1LDQ1LjcyMzY2OTYgNDUuMTA5NDg5NSw0NS43MjM2Njk2IEM0NS4xMDk0ODk1LDQ1LjcyMzY2OTYgNDUuMTM1NTY4OCw3NC43MTg2MjUgNDUuMTA5NDg5NSw3NC43NDc5NzkzIEM0NS4xMDI1MjM1LDc0Ljc0OTcxMjEgMzcuMzczODU2Nyw3NC43NDk3MTIxIDM3LjM2NjkwOCw3NC43NDc5NzkzIEwzNy4zNjY5MDgsNjEuOTc1OTA5OSBDMzcuMzY2OTA4LDYyLjAxMjE3ODMgMjEuNzQyNjMyMyw2MS45NzU5MDk5IDIxLjc0MjYzMjMsNjEuOTc1OTA5OSBDMjEuNzQ3ODY1NSw2Mi4wMjQyNTYyIDIxLjczMzk1MDgsNzQuNzU2NjI2MiAyMS43NDI2MzIzLDc0Ljc0Nzk3OTMgTDE0LjAwMDA1MDgsNzQuNzQ3OTc5MyBDMTMuOTk4MzE3OSw3NC43NDc5NzkzIDE0LjA0MTc5NDksNDUuNzIzNjY5NiAxNC4wMDAwNTA4LDQ1LjcyMzY2OTYgTDIxLjc0MjYzMjMsNDUuNzIzNjY5NiBaIE01MS4yNDcyMTY2LDQ1LjcyMzY2OTYgTDU4Ljk4NDU4MjMsNDUuNzIzNjY5NiBMNTguOTg0NTgyMyw3NC43NDc5NzkzIEw1MS4yNDcyMTY2LDc0Ljc0Nzk3OTMgTDUxLjI0NzIxNjYsNDUuNzIzNjY5NiBaIE0xMjIuOTc1MjA0LDY2LjcwMzAzNDEgQzEyMi4yOTUzNTgsNjQuNzU2NTY3MSAxMjEuOTM1NDQ3LDYyLjY5Nzg0NjYgMTIxLjkzNTQ0Nyw2MC41MjMzODk2IEMxMjEuOTM1NDQ3LDU3LjQ3Njc0MTEgMTIyLjQ3NzkzMSw1NC41MjE2Mzg2IDEyMy45NDcxNTYsNTIuMDcyNTc4MSBDMTI1LjQ2MTU5LDQ5LjU0MjMzMzkgMTI3Ljc4NDUzNSw0Ny41OTA2ODU3IDEzMC41ODkxMjIsNDYuNTQ1NzgxOSBDMTMzLjI2Njc2Miw0NS41NTQ0MDU1IDEzNi4xNDc4NTUsNDUgMTM5LjE2OTc3Niw0NSBDMTQyLjY0NTQ5Myw0NSAxNDUuOTM2OTIzLDQ1Ljc1ODIwNTEgMTQ4LjkzNjI0OCw0Ny4wNDY2NDI2IEMxNTEuNzI2OTAzLDQ4LjIzNjYzNzMgMTUzLjgzNDI0Nyw1MC43Mzc1MDk4IDE1NC40NTg0NTIsNTMuNzUzMDcxMSBDMTU0LjU4NTM4Myw1NC4zNTQxMDc1IDE1NC42NzkyODUsNTQuOTY4OTU0NSAxNTQuNzMzMTc3LDU1LjU5MjQ0ODUgTDE0Ni42MTE1NTMsNTUuNTkyNDQ4NSBDMTQ2LjU4MzcyNCw1NC44MTg2OTk4IDE0Ni40NTg1NDMsNTQuMDUzNTgwNiAxNDYuMTkwNzg0LDUzLjM1OTI4MjggQzE0NS41NzcwMTIsNTEuNzU0Nzc0OSAxNDQuMjMxMjE3LDUwLjUwMjYyMzEgMTQyLjU2MDMwNyw1MC4wMDE3NDUgQzE0MS40ODU3NzEsNDkuNjc1MzI5NiAxNDAuMzQ2ODk1LDQ5LjQ5OTE1MTUgMTM5LjE2OTc3Niw0OS40OTkxNTE1IEMxMzcuODIzOTk4LDQ5LjQ5OTE1MTUgMTM2LjUzNTU5Niw0OS43MzQwNTU2IDEzNS4zMzc1OTUsNTAuMTU1NDY1NSBDMTMzLjM1MzY5OSw1MC44NDk3NjM0IDEzMS44MDc5NjksNTIuNDQzOTA4OSAxMzEuMTEwNzQzLDU0LjQxNDU0OSBDMTMwLjQzNDM4LDU2LjMyMTI5OTIgMTMwLjA1MzU4Nyw1OC4zODUyMTgzIDEzMC4wNTM1ODcsNjAuNTIzMzg5NiBDMTMwLjA1MzU4Nyw2Mi4yOTU0MTE0IDEzMC4zMzcwMTEsNjQuMDAwMDk0OSAxMzAuNzkwODA4LDY1LjYyMzU5NDcgQzEzMS4zNzY3NjgsNjcuNzM1ODYwMSAxMzIuOTc2NDA3LDY5LjQzMzYyOTUgMTM1LjAxOTQxMSw3MC4yMDU2NDU0IEMxMzYuMzExMjk3LDcwLjY4NzUxNDEgMTM3LjcwNTc0OSw3MC45NzA3NjQ1IDEzOS4xNjk3NzYsNzAuOTcwNzY0NSBDMTQwLjQxNjQ1Miw3MC45NzA3NjQ1IDE0MS42MTc5LDcwLjc4MjUwODYgMTQyLjc0NjM0NSw3MC40MTgwOTE4IEMxNDQuMjYwNzc5LDY5Ljk0MTQwNDMgMTQ1LjQ5MTgwOCw2OC44MzQzMDg3IDE0Ni4xMzE2Niw2Ny40MDQyNDYgQzE0Ni41NTU5MTIsNjYuNDU2MDY5NCAxNDYuNzY4MDQ2LDY1LjQwMjUxODcgMTQ2Ljc2ODA0Niw2NC4yOTM3MDc3IEwxNTQuOTIyNjk4LDY0LjI5MzcwNzcgQzE1NC44NzQwMjIsNjUuMjM0OTg3NSAxNTQuNzQzNjA4LDY2LjE2OTM1MzQgMTU0LjUzMTQ5MSw2Ny4wNDUwMTA1IEMxNTMuODM0MjQ3LDY5LjkxNTQ5ODMgMTUxLjgxMDM3NCw3Mi4zMjQ4MjQ4IDE0OS4xMjA1NTMsNzMuNDQ3NDYzOSBDMTQ2LjA1Njg4OCw3NC43MjcyNTQ1IDE0Mi43MDExMzUsNzUuNDY2NDY3NyAxMzkuMTY5Nzc2LDc1LjQ2NjQ2NzcgQzEzNi40MzEyNjEsNzUuNDY2NDY3NyAxMzMuNzkwMTMyLDc1LjAzNjQxMDkgMTMxLjMxNTkxMSw3NC4yNjQzOTUgQzEyNy41NDI4NTUsNzMuMDc5NTgxNSAxMjQuMjc0MDM5LDcwLjM4NTI3MTggMTIyLjk3NTIwNCw2Ni43MDMwMzQxIFoiIGlkPSJwYXRoMzYyMSI+PC9wYXRoPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+"},"3QGZ":function(M,N,e){M.exports=e.p+"static/cocacola-1ae07eccacd0f153603416b63af04481.svg"},UaTi:function(M,N,e){},k1yg:function(M,N,e){M.exports=e.p+"static/barclays-f4305d80b22b41ca00712fd0174586cf.svg"},kCXl:function(M){M.exports=JSON.parse('[{"group":"hacks","path":"/projects/nyt/","slug":"nyt","title":"Pandemic Rises","description":"Analysing New York Times frontpages in 2020","pageDescription":"A look at every frontpage published in 2020, tracking bigger stories, and illustrating how our news coverage became about one thing only.","order":0}]')}}]);
//# sourceMappingURL=component---src-pages-projects-js-712b09f93924406f1d66.js.map