"""Precise service symbols, selected by content rather than cycling illustrations."""
import html

SHAPES = {
 'home':'M12 35 40 12 68 35 M20 31v34h40V31 M33 65V43h14v22 M27 27v-9h9',
 'building':'M17 68V15h33v53 M50 33h14v35 M26 25h5m7 0h5M26 37h5m7 0h5M26 49h5m7 0h5M31 68V57h10v11 M10 68h60',
 'shield':'M40 10 64 20v21q-2 19-24 30Q18 60 16 41V20Z M27 39l9 10 18-22',
 'heart':'M40 64C24 53 12 42 12 29c0-16 19-21 28-7 9-14 28-9 28 7 0 13-12 24-28 35Z',
 'document':'M20 10h29l13 14v46H20Z M49 10v15h13 M29 35h24M29 45h24M29 55h14',
 'tooth':'M40 17C25 7 12 18 17 34l8 29q4 14 10 0l5-16 5 16q6 14 10 0l8-29C68 18 55 7 40 17Z M27 25q5-4 10 0',
 'implant':'M24 12h32v15H24Z M28 34h24l-4 34H32Z M25 40l29-6M27 50l25-6M29 60l21-6',
 'smile':'M13 27q27-9 54 0-3 35-27 35T13 27Z M15 35q25 8 50 0 M29 27v13M40 25v16M51 27v13',
 'spark':'M40 9q2 28 28 31-26 2-28 31-2-29-28-31 26-3 28-31Z M64 10v14M57 17h14',
 'search':'M50 48 69 67 M57 33a24 24 0 1 1-48 0 24 24 0 1 1 48 0 M23 33h20M33 23v20',
 'light':'M40 8v9M12 20l7 7M68 20l-7 7 M22 39a18 18 0 1 1 36 0c0 10-10 12-10 22H32c0-10-10-12-10-22Z M32 67h16M36 73h8',
 'leaf':'M16 62Q7 20 65 12q8 48-39 45 M17 66 52 27 M30 49l-3-16M39 40l14 1',
 'thermometer':'M34 48V17a6 6 0 0 1 12 0v31a13 13 0 1 1-12 0 M40 26v30 M52 22h10M52 34h7',
 'fan':'M40 35C5 11 39 0 46 17v18 M45 40C70 4 81 39 64 46H45 M40 45C75 69 41 80 34 63V45 M35 40C10 76-1 41 16 34h19 M45 40a5 5 0 1 1-10 0 5 5 0 1 1 10 0',
 'snow':'M40 9v62M13 24l54 32M13 56l54-32M32 14l8 8 8-8M32 66l8-8 8 8M14 34l11-3-3-11M58 60l-3-11 11-3M14 46l11 3-3 11M58 20l-3 11 11 3',
 'water':'M40 9C29 26 17 37 17 49a23 23 0 0 0 46 0C63 37 51 26 40 9Z M28 49q0 11 11 12',
 'wrench':'M61 10 48 23l9 9 13-13c6 19-11 30-24 24L22 68q-8 6-13-2-4-6 2-11l25-24C30 18 42 3 61 10Z M17 60l2 2',
 'calendar':'M16 19h48v48H16Z M16 32h48M28 11v16M52 11v16 M27 43h5m12 0h5M27 54h5m12 0h5',
 'paw':'M25 48q15-22 30 0l5 12q-3 9-20 3-17 6-20-3Z M24 23a6 9 0 1 1-12 0 6 9 0 1 1 12 0 M39 17a6 9 0 1 1-12 0 6 9 0 1 1 12 0 M54 17a6 9 0 1 1-12 0 6 9 0 1 1 12 0 M68 29a6 9 0 1 1-12 0 6 9 0 1 1 12 0',
 'care':'M15 36q0 22 16 22t16-22V16M15 16v20 M10 12h10v11H10Z M42 12h10v11H42Z M31 58v3q0 12 17 12t17-20 M70 47a5 5 0 1 1-10 0 5 5 0 1 1 10 0',
 'travel':'M13 31h54v36H13Z M29 31V20h22v11 M23 31v36M57 31v36 M31 12l11-5 6 9',
 'screen':'M12 16h56v39H12Z M29 67h22M40 55v12 M29 35l8 8 15-18',
 'car':'M16 37l7-20h34l7 20 M10 37h60v22H10Z M16 59v8h10v-8M54 59v8h10v-8 M17 47h9M54 47h9M33 49h14',
 'swap':'M12 26h53L54 15 M68 54H15l11 11 M65 26 54 37M15 54l11-11',
 'steering':'M66 40a26 26 0 1 1-52 0 26 26 0 1 1 52 0 M46 40a6 6 0 1 1-12 0 6 6 0 1 1 12 0 M14 34l20 4M66 34l-20 4M40 46v20',
 'dish':'M14 52a26 26 0 0 1 52 0 M9 58h62M34 24v-6h12v6 M20 65h40',
 'glass':'M22 10h36l-5 47H27Z M25 30h30M33 66h14 M40 57v9',
 'bowl':'M11 36h58Q65 64 40 64T11 36Z M17 29q10-21 23 0M35 29q9-27 23-5 M22 18l-6-8',
 'bag':'M18 27h44l6 43H12Z M29 30V20a11 11 0 0 1 22 0v10 M31 48l8 8 13-16',
 'glove':'M26 58 18 40q-10-18 1-22 8-3 11 9V18q0-10 8-8 5-7 10-1 9-3 11 6l4 20q1 10-8 19v14H27Z M27 55h28M27 62h28',
 'weight':'M27 40h26M14 26h13v28H14ZM53 26h13v28H53Z M8 33h6v14H8ZM66 33h6v14h-6Z',
 'book':'M40 21Q23 12 10 19v45q16-7 30 1 14-8 30-1V19q-13-7-30 2Z M40 21v44M18 29l13 1M18 39l13 1M49 30l13-1M49 40l13-1',
 'brake':'M66 40a26 26 0 1 1-52 0 26 26 0 1 1 52 0 M49 40a9 9 0 1 1-18 0 9 9 0 1 1 18 0 M22 27l4 3M54 50l4 3M27 58l3-4M50 26l3-4',
 'syringe':'M20 50 48 22l13 13-28 28Z M14 69l10-10M47 12l22 22M53 18l10-10M62 27l10-10M32 39l7 7M40 31l7 7',
}

RULES=[
 ('certificate|inspection|biopsy','document'),('commercial insurance|insurance$','shield'),('life insurance','heart'),('personal insurance|home|property','home'),('commercial real estate','building'),
 ('implant|denture','implant'),('invisalign|orthodont','smile'),('cosmetic','spark'),('dental|dentistry|restorative|cleaning','tooth'),
 ('allergy|air quality','leaf'),('diagnostic|finder','search'),('light|electrocautery','light'),('air conditioning|cooling|equipment','fan'),('heating','thermometer'),('refrigeration','snow'),('water','water'),
 ('maintenance','wrench'),('brake','brake'),('trade','swap'),('vehicle inventory','car'),('test drive','steering'),('muay thai','glove'),('strength','weight'),
 ('trial|first visit|appointment','calendar'),('resource|support','book'),('travel','travel'),('portal','screen'),('spay|neuter|medical','care'),('vaccin','syringe'),('cat|wellness|preventive','paw'),
 ('sandwich|dinner|brunch|cater','dish'),('salad|bowl','bowl'),('drink','glass'),('pickup|order','bag')]

def svg(title, category):
 import re
 symbol=next((icon for pattern,icon in RULES if re.search(pattern,title,re.I)), 'tooth' if category=='dental' else 'care')
 if category=='dental' and symbol=='paw': symbol='tooth'
 if 'personal insurance' in title.lower(): symbol='home'
 if 'life insurance' in title.lower(): symbol='heart'
 return '<svg class="service-symbol" viewBox="0 0 80 80" aria-hidden="true" focusable="false" data-symbol="'+symbol+'"><path d="'+SHAPES[symbol]+'"/></svg>'
