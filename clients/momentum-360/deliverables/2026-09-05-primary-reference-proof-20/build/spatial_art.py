"""Source-reference drawing language; business objects, never replacement logos."""
import html
import illustrations as old

def pet(i):
 if i==0:
  return old.blob(290,200,170)+'''<ellipse class="wash" cx="300" cy="337" rx="180" ry="24"/><g class="bob"><path class="deep" d="M170 158l55-33 206 42v138l-61 36-200-45z"/><path class="pap line" d="M170 158l200 39v144l-200-45z"/><path class="acc line" d="M170 158l55-33 206 42-61 30z"/><path class="line" d="M244 158v-35q0-26 28-19l33 7q23 5 23 29v35"/><path class="accd" d="M244 222l22 4v-22l25 5v22l22 5v26l-22-5v22l-25-5v-22l-22-4z"/><path class="thin" d="M390 216v79m18-73v64"/></g><g class="sway" style="transform-origin:110px 240px"><path class="pap line" d="M75 260l-8-66 31 21q27-12 47 3l31-21-10 67q-42 50-91-4z"/><path class="thin" d="M93 244l1 1m54 7l1 1m-35 14q10 15 22 2"/><path class="accd" d="M115 251l17 2-9 12z"/></g>'''+old.star4(480,105,26)
 if i==1:
  return old.blob(295,203,175)+'''<ellipse class="wash" cx="303" cy="339" rx="183" ry="19"/><g class="sway" style="transform-origin:300px 180px"><path class="line" d="M165 104v69q0 86 93 99t89-79v-62"/><path class="athin" d="M178 103v70q0 71 81 84t74-66v-61"/><path class="accd" d="M151 90l32-6 4 50-34 5zM329 106l35 7-7 50-34-8z"/><path class="line" d="M255 273q-19 70 70 63t100-89"/><circle class="deep" cx="430" cy="214" r="56"/><circle class="pap line" cx="419" cy="201" r="56"/><path class="aline" d="M399 201q16-30 37 2l9 20q-26-5-50 0z"/><circle class="accd" cx="395" cy="179" r="8"/><circle class="accd" cx="415" cy="166" r="9"/><circle class="accd" cx="437" cy="177" r="8"/></g>'''+old.star4(130,300,20)
 return old.blob(300,203,175)+'''<ellipse class="wash" cx="295" cy="341" rx="205" ry="20"/><g class="nudge"><path class="deep" d="M133 181l70-56 288 62-56 63v99l-301-58z"/><path class="pap line" d="M133 181l294 59v102l-294-54z"/><path class="acc line" d="M133 181l70-56 288 62-64 53z"/><path class="line" d="M262 168v-40q0-25 30-18l37 8q21 5 21 32v36"/><path class="line" d="M163 216l81 17v76l-81-16zm105 22l80 17m-80 22l80 17"/><path class="aline" d="M381 264l14 3m-14 22l14 3"/><path class="thin" d="M453 258l16-19m-16 40l16-18"/></g>'''+old.star4(448,95,19)

def insurance(i):
 if i==0:
  return old.blob(300,190,170)+'''<ellipse class="wash" cx="300" cy="340" rx="190" ry="19"/><g class="bob"><path class="deep" d="M188 229l115-63 112 96v77l-117 35-110-60z"/><path class="pap line" d="M188 229l107 26v105l-107-46z"/><path class="acc line" d="M160 231l81-91 139 36 67 105-152-32-54-90z"/><path class="line" d="M242 306v33m78-63l47-12v40l-47 14z"/></g><g class="sway" style="transform-origin:295px 135px"><path class="pap line" d="M98 141q50-151 199-101 124-5 199 134-74-29-96 0-47-49-98-19-42-51-99-29-33-32-105 15z"/><path class="aline" d="M297 39q-56 14-94 87m94-87q69 35 103 135"/><path class="line" d="M302 155v52q-2 36-34 19"/></g>'''
 if i==1:
  return old.blob(290,210,170)+'''<ellipse class="wash" cx="306" cy="345" rx="170" ry="18"/><g class="bob"><path class="deep" d="M164 100l227 24 44 45-31 182-244-28z"/><path class="pap line" d="M146 84l221 22 35 39-24 192-239-25z"/><path class="acc line" d="M367 106l-4 44 39-5"/><path class="thin" d="M190 151l119 12m-124 27l139 15m-143 26l99 12m-104 29l89 10"/><g class="sway" style="transform-origin:369px 252px"><path class="acc line" d="M311 219l60-24 63 37-6 62-71 51-56-66z"/><path class="pline" d="M326 266l28 27 51-49"/></g></g>'''
 return old._wm_key()

def metal(i):
 if i==0:
  return old.blob(300,215,174)+'''<ellipse class="wash" cx="300" cy="345" rx="195" ry="20"/><path class="deep" d="M132 238l354-21-63 76-267 31z"/><path class="pap line" d="M132 220l357-23-44 59-63 7-26 30 50 33-17 21-182-2-16-21 38-33-26-31-93 7z"/><path class="thin" d="M138 237l329-22m-226 87l91 1"/><g class="press"><path class="accd" d="M273 73l30-9 56 142-23 10z"/><path class="pap line" d="M200 84l117-55 34 47-118 57z"/><path class="acc line" d="M317 29l25 16 36 46-27-15z"/></g>'''+old.star4(435,157,19)+old.star4(114,172,12)
 if i==1:
  bars=''.join('<path class="thin" d="M%d 144v183"/>'%x for x in range(150,480,40))
  curls=''.join('<path class="aline" d="M%d 289q-40-16-27-65 11-27 29-5 9 21-9 23m7-5q41-12 39-53-3-29-28-19-21 11-1 26"/>'%x for x in [190,285,380])
  return old.blob(300,215,170)+'''<ellipse class="wash" cx="300" cy="345" rx="220" ry="17"/><g class="bob"><path class="line" d="M116 119v225m378-236v236M112 138l386-8M114 326l380-2"/>'''+bars+curls+'</g>'
 return old._na_wrench()

def gym(i):
 if i==0:
  return old.blob(300,210,177)+'''<ellipse class="wash" cx="300" cy="345" rx="180" ry="20"/><g class="sway" style="transform-origin:320px 290px"><path class="deep" d="M221 103q93-62 151 6 41 33 18 88l-12 110-110 27-46-113q-61-8-46-65 3-25 33-31z"/><path class="acc line" d="M204 94q86-62 151 2 41 39 13 96l-13 96-103 29-42-103q-60-11-45-65 6-21 35-25z"/><path class="pap line" d="M249 269l111-23 9 57-105 34z"/><path class="thin" d="M227 121q46-21 83 7m-90 27q45-18 79 9m-38 130l85-20"/></g>'''+old.star4(448,114,23)
 if i==1:
  weights=''.join('<g transform="translate(%d %d)"><path class="deep" d="M0 0l45-24 32 28-5 112-40 21-35-32z"/><path class="acc line" d="M-3 0l40-21 1 125-41-29z"/><path class="thin" d="M10 18v56"/></g>'%(x,y) for x,y in [(129,151),(386,110)])
  return old.blob(300,203,180)+'''<ellipse class="wash" cx="305" cy="339" rx="196" ry="23"/><g class="lift"><path class="pap line" d="M160 195l272-46 4 33-271 50z"/>'''+weights+'</g>'
 return old.blob(300,211,170)+'''<ellipse class="wash" cx="300" cy="349" rx="190" ry="15"/><path class="aline dash" d="M183 126C60 77 68 353 288 331S522 99 420 125"/><g class="sway" style="transform-origin:200px 200px"><path class="acc line" d="M180 123l34-9 38 144-33 8z"/><path class="thin" d="M196 147l14-4m-7 25l14-4m-7 25l14-4"/></g><g class="sway d2" style="transform-origin:399px 200px"><path class="acc line" d="M405 120l35 11-49 141-34-11z"/><path class="thin" d="M406 149l16 5m-24 15l16 5m-24 15l16 5"/></g>'''

def food(i):
 if i==0:
  return old.blob(300,209,177)+'''<ellipse class="wash" cx="300" cy="345" rx="181" ry="19"/><g class="sway" style="transform-origin:284px 280px"><path class="deep" d="M178 104l151-18 48 41-17 186-139 30-33-25z"/><path class="acc line" d="M166 108l168 2-16 213q-77 37-137-1z"/><path class="pap line" d="M177 134c-37-22-36-61-3-68 5-33 52-34 68-11 25-22 61-8 62 12 56-13 69 50 27 69-64-20-109-19-154-2z"/><path class="aline" d="M341 161q84-10 62 83-16 37-73 43"/><path class="pline" d="M207 175l-2 106m73-111l-5 106"/><circle class="pap pulse" cx="249" cy="189" r="7"/><circle class="pap pulse d2" cx="225" cy="250" r="5"/></g>'''
 if i==1:
  return old.blob(300,210,179)+'''<ellipse class="wash" cx="300" cy="336" rx="205" ry="27"/><g class="bob"><path class="deep" d="M102 253q197-82 388 0l-23 61q-178 75-341-2z"/><path class="pap line" d="M116 231q183-79 368 0l-15 42q-173 72-339-1z"/><path class="acc line" d="M116 227q22-21 45-9 18-37 48-15 18-35 48-14 28-34 57-9 27-30 55-7 26-15 50 7 26-1 43 29l17 21q-188 79-363-3z"/><path class="pap line" d="M113 203q-2-119 169-116 185-17 210 111-194 93-379 5z"/><path class="thin" d="M204 128l9 5m46-14l9 6m53-11l9 5m54 14l8 4m-159 36l10 3m58-13l10 4m67 5l9 4"/></g>'''
 return old._jm_bowl()

def chicken(i):
 if i==0: return food(1)
 if i==1: return food(2)
 return old.blob(300,205,178)+'''<ellipse class="wash" cx="305" cy="337" rx="203" ry="20"/><g class="bob"><path class="deep" d="M104 253l77-37 327 36-68 71-288-20z"/><path class="pap line" d="M98 238l335 31 71-38-330-29z"/><path class="acc line" d="M146 237q3-115 150-120 143 12 150 143z"/><path class="pap line" d="M264 115q-6-39 29-42 39 7 21 47"/><path class="thin" d="M180 218q16-65 83-78m-113 126l269 29m33-21l35-23"/></g>'''+old.star4(477,121,19)

def taproom(i):
 return food([1,2,0][i])

MAP={'pet':pet,'insurance':insurance,'metal':metal,'gym':gym,'food':food,'chicken':chicken,'taproom':taproom}
FN={'dental':[old._sc_tooth,old._sc_aligner,old._sc_implant],'hvac':[old._fm_furnace,old._fm_thermostat,old._uc_fan],'home':[old._ae_house,old._wm_key,old._hub_pen],'auto':[old._wm_lot,old._wm_key,old._wm_street],'auto_service':[old._na_brake,old._wm_lift,old._na_wrench]}
def svg(kind,index,title):
 body=MAP[kind](index) if kind in MAP else FN[kind][index]()
 return '<svg class="illo spatial-illo" viewBox="0 0 600 400" role="img" focusable="false"><title>'+html.escape(title)+'</title><g class="drawing">'+body+'</g></svg>'
