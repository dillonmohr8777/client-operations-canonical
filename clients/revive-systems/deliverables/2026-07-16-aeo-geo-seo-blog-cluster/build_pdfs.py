from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT.parent.parent / "assets"
LOGO = (ASSETS / "revive-logo-source.png").as_uri()

sources = {
    "niddk": ("NIDDK: Choosing a Safe and Successful Weight-loss Program", "https://www.niddk.nih.gov/health-information/weight-management/choosing-a-safe-successful-weight-loss-program"),
    "cdc_weight": ("CDC: Steps for Losing Weight", "https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html"),
    "cdc_activity": ("CDC: Physical Activity and Your Weight and Health", "https://www.cdc.gov/healthy-weight-growth/physical-activity/index.html"),
    "hhs": ("HHS: Physical Activity Guidelines for Americans", "https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines/top-10-things-know"),
    "nih_sleep": ("NIH: Getting Sufficient Sleep Reduces Calorie Intake", "https://www.nih.gov/news-events/nih-research-matters/getting-sufficient-sleep-reduces-calorie-intake"),
    "cdc_stress": ("CDC: Managing Stress", "https://www.cdc.gov/mental-health/living-with/index.html"),
    "bls": ("U.S. Bureau of Labor Statistics: Dietitians and Nutritionists", "https://www.bls.gov/ooh/healthcare/dietitians-and-nutritionists.htm"),
}

articles = [
{
"slug":"choose-a-weight-loss-program",
"title":"How to Choose a Weight-Loss Program That Fits Real Life",
"dek":"The right program is not the one that asks for the most discipline. It is the one that can survive your actual week.",
"keyword":"how to choose a sustainable weight loss program",
"image":"mike-site-2.jpg",
"body":r'''
<p class="lead"><strong>A sustainable weight-loss program</strong> gives you a realistic eating plan, appropriate physical activity, behavior support, progress tracking, regular feedback, and a plan for maintaining progress. It should adapt to your health, schedule, preferences, and setbacks. If the plan only works when life is quiet, it is not a real plan.</p>
<p>I have coached people for more than sixteen years. The pattern is not a lack of effort. Most people have worked hard. They have simply been handed plans built for an imaginary person with no kids, no deadlines, no injuries, and no bad weeks.</p>
<div class="answer"><strong>The short answer:</strong> Choose the program that evaluates you before prescribing, explains what happens when life gets messy, measures more than scale weight, and gives you a qualified human who adjusts the plan.</div>
<h2>What should a safe weight-loss program include?</h2>
<p>The National Institute of Diabetes and Digestive and Kidney Diseases recommends looking for a plan that includes healthy eating, physical activity, behavior-change support, ongoing feedback, and a strategy for keeping weight off. That is a system, not a thirty-day punishment.</p>
<ol>
<li><strong>An honest starting assessment.</strong> Your schedule, training history, health conditions, sleep, stress, food environment, and previous attempts matter.</li>
<li><strong>A plan you can explain.</strong> You should know what you are doing, why it matters, and how progress will be evaluated.</li>
<li><strong>Appropriate progression.</strong> More is not automatically better. Training and nutrition should match your current capacity.</li>
<li><strong>Data tracking and analysis.</strong> The program should record relevant behaviors, performance, recovery, and appropriate measurements, then look for trends before adjusting the plan.</li>
<li><strong>Regular feedback.</strong> A static template cannot respond when your work week changes, your recovery drops, or an old issue returns.</li>
<li><strong>A maintenance strategy.</strong> The plan should teach you how to keep the result without staying in permanent restriction.</li>
</ol>
<h2>Eight questions to ask before you commit</h2>
<table><tr><th>Question</th><th>What a strong answer sounds like</th></tr>
<tr><td>How do you assess me?</td><td>We review your history, constraints, goals, and readiness before building the plan.</td></tr>
<tr><td>Who adjusts the plan?</td><td>A named coach reviews your progress and makes documented changes.</td></tr>
<tr><td>What happens during a stressful week?</td><td>We scale the plan to preserve consistency instead of treating the week as failure.</td></tr>
<tr><td>How do you measure progress?</td><td>We use behaviors, strength, energy, measurements, and other appropriate indicators, not one number alone.</td></tr>
<tr><td>What claims do you avoid?</td><td>No guaranteed result, diagnosis, cure, or one-size-fits-all timeline.</td></tr></table>
<h2>What are the red flags?</h2>
<p>Be careful with guaranteed weight loss, pressure to buy immediately, secret foods or supplements, plans that forbid medical collaboration, and promises that one protocol will fix every person. A professional should be comfortable saying, “That is outside my scope. Let’s involve your physician or a registered dietitian.”</p>
<h2>Why support matters more than intensity</h2>
<p>Intensity can create a fast start. Support creates a repeatable process. At Revive Systems, the goal is not to prove how hard you can suffer for a month. It is to build structure around the life you already carry. That may mean a clear training floor, simpler meals during travel, a recovery decision, or an honest conversation before a bad week becomes a lost month.</p>
<h2>Frequently asked questions</h2>
<h3>How fast should a weight-loss program work?</h3><p>A responsible program does not promise a universal rate. Your starting point, health, adherence, medications, sleep, stress, and other factors affect progress. Ask how the program monitors safety and adjusts expectations.</p>
<h3>Is online coaching effective?</h3><p>Online coaching can provide structure, feedback, education, and accountability when the coach communicates consistently and individualizes the plan. It is not a replacement for medical care.</p>
<h3>Do I need a meal plan?</h3><p>Not everyone needs a rigid meal plan. Many people do better learning repeatable meal structures and decision rules. Medical nutrition therapy belongs with a qualified registered dietitian or other licensed clinician.</p>
<h3>What if I have already failed several programs?</h3><p>Past attempts are useful data. Review where each plan broke: complexity, hunger, schedule, pain, recovery, lack of support, or unrealistic expectations. Build the next plan around that evidence.</p>
<p class="cta"><strong>Stop collecting plans. Start building a system.</strong><br><a href="https://revive-systems.com/Programs">Explore Revive Systems programs</a> or <a href="https://revive-systems.com/contact-us">start a conversation</a>.</p>
''',
"links":["niddk","cdc_weight"]},
{
"slug":"strength-training-after-40",
"title":"Getting Strong Again After 40",
"dek":"You are not starting over. You are starting with history, responsibility, and better judgment.",
"keyword":"strength training after 40 beginner",
"image":"mike-site-3.jpg",
"body":r'''
<p class="lead"><strong>Strength training after 40</strong> should rebuild capacity gradually with two or more weekly sessions, simple movement patterns, repeatable effort, and enough recovery to adapt. The objective is not to recreate the hardest workout you did at twenty-five. It is to become stronger without repeatedly losing momentum.</p>
<p>I know what it feels like when your body stops cooperating. After a cycling accident, torn ligaments, a fractured femur, shoulder injuries, and eight knee surgeries, I had to learn the difference between being tough and training intelligently. Those are not the same thing.</p>
<div class="answer"><strong>The short answer:</strong> Begin below your maximum, practice the same core movements long enough to improve them, add work slowly, and treat pain or medical concerns as a reason to involve the right clinician rather than something to push through.</div>
<h2>How many days should adults strength train?</h2>
<p>U.S. physical activity guidance recommends muscle-strengthening activity at least two days each week, alongside aerobic activity. Two well-designed sessions can be a strong starting floor. Your exact plan should reflect ability, experience, health, and recovery.</p>
<h2>A four-week return-to-training framework</h2>
<ol>
<li><strong>Week 1: Relearn.</strong> Use comfortable ranges of motion and leave several good repetitions in reserve. Finish feeling capable of returning.</li>
<li><strong>Week 2: Repeat.</strong> Keep the same basic movements. Improve control and confidence before adding complexity.</li>
<li><strong>Week 3: Add one variable.</strong> Add a small amount of load, a repetition, or one set. Do not increase everything at once.</li>
<li><strong>Week 4: Review.</strong> Compare performance, soreness, sleep, pain, and consistency. Keep what worked and adjust what did not.</li>
</ol>
<h2>What should a beginner session include?</h2>
<table><tr><th>Pattern</th><th>Examples</th><th>Coaching focus</th></tr>
<tr><td>Squat or sit-to-stand</td><td>Box squat, supported squat</td><td>Control and comfortable depth</td></tr>
<tr><td>Hinge</td><td>Hip hinge, Romanian deadlift</td><td>Hip movement and trunk position</td></tr>
<tr><td>Push</td><td>Incline push-up, machine press</td><td>Stable shoulder position</td></tr>
<tr><td>Pull</td><td>Cable row, supported row</td><td>Full controlled range</td></tr>
<tr><td>Carry or brace</td><td>Farmer carry, dead bug</td><td>Breathing and position</td></tr></table>
<p>These are categories, not a prescription. Exercise selection changes with your history and available equipment.</p>
<h2>What if you have old injuries?</h2>
<p>Do not let an old injury become either an excuse or a dare. Get medical clearance when appropriate. A coach can modify exercises and training demands, but coaching is not diagnosis, rehabilitation, or physical therapy. Sharp pain, worsening symptoms, neurological symptoms, chest pain, or unusual shortness of breath deserve qualified medical attention.</p>
<h2>The mistake most returning adults make</h2>
<p>They test the body before they have trained it. The first week becomes an audition for their old identity. Then soreness, pain, or schedule disruption removes the next two weeks. The better move is to stack ordinary sessions until strength feels normal again.</p>
<h2>Frequently asked questions</h2>
<h3>Am I too old to start lifting?</h3><p>Age alone is not a reason to avoid strength training. Start at an appropriate level and involve your health professional when medical conditions, symptoms, or prior injuries call for it.</p>
<h3>How long should a workout be?</h3><p>A useful session can be shorter than people expect. Exercise selection, effort, rest, and consistency matter more than performing a long list of movements.</p>
<h3>Should I train when I am sore?</h3><p>Mild soreness may allow normal or adjusted activity. Severe soreness, altered movement, swelling, or pain needs a more cautious decision. Do not use a blog to diagnose an injury.</p>
<h3>When should I add weight?</h3><p>Add load when technique is repeatable, the current work is well tolerated, and recovery is stable. Small progress that continues beats a large jump that interrupts training.</p>
<p class="cta"><strong>Build strength for the life you have now.</strong><br>Read <a href="https://revive-systems.com/about">Mike’s story</a>, review <a href="https://revive-systems.com/success-stories">success stories</a>, or <a href="https://revive-systems.com/contact-us">talk with Revive Systems</a>.</p>
''',
"links":["hhs","cdc_activity"]},
{
"slug":"minimum-viable-routine",
"title":"The Minimum-Viable Routine for Stressful Weeks",
"dek":"A bad week does not need a perfect plan. It needs a floor you refuse to fall through.",
"keyword":"how to stay consistent with exercise when busy",
"image":"mike-site-4.jpg",
"body":r'''
<p class="lead"><strong>A minimum-viable health routine</strong> is the smallest version of your training, nutrition, sleep, and recovery plan that keeps you engaged during a demanding week. It is not the ideal week made smaller. It is a pre-decided floor that prevents stress from turning one disruption into a month of avoidance.</p>
<p>I am a business owner and a father. I have also been the guy who kept saying he was fine until the body said otherwise. Busy people do not need another lecture about motivation. They need a system that still works when capacity drops.</p>
<div class="answer"><strong>The short answer:</strong> Use three operating modes. Green weeks support normal progress. Yellow weeks protect the essentials. Red weeks preserve connection, recovery, and the next responsible action.</div>
<h2>Why does your plan fall apart during stress?</h2>
<p>Stress can change appetite, energy, attention, sleep, and decision-making. The CDC includes healthy eating, physical activity, sufficient sleep, and stress reduction among the major parts of healthy weight management. When your plan ignores one of those systems, you often try to compensate by forcing another.</p>
<h2>The Green, Yellow, and Red week system</h2>
<table><tr><th>Mode</th><th>Training</th><th>Nutrition</th><th>Recovery</th></tr>
<tr><td>Green</td><td>Normal planned sessions</td><td>Full meal structure and preparation</td><td>Normal sleep routine and planned downtime</td></tr>
<tr><td>Yellow</td><td>Two brief full-body sessions or purposeful walks</td><td>Repeat three reliable meals; simplify choices</td><td>Protect a consistent bedtime and one daily decompression block</td></tr>
<tr><td>Red</td><td>Short walk or clinician-approved movement</td><td>Eat regular, basic meals; avoid the restrict-then-binge swing</td><td>Ask for help, reduce optional load, and address acute symptoms</td></tr></table>
<h2>How to build your minimum-viable routine</h2>
<ol>
<li><strong>Choose your floor before the crisis.</strong> Decide what counts as staying connected when the calendar breaks.</li>
<li><strong>Reduce decisions.</strong> Reuse meals, training templates, grocery lists, and bedtime cues.</li>
<li><strong>Keep one appointment with yourself.</strong> The action can be small, but it should be scheduled.</li>
<li><strong>Tell someone which mode you are in.</strong> A coach, spouse, friend, clinician, or teammate can help you act honestly.</li>
<li><strong>Return without punishment.</strong> Do not repay a hard week with starvation or a brutal workout. Resume the next sensible action.</li>
</ol>
<h2>Sleep is not time you stole from progress</h2>
<p>Adults generally need at least seven hours of sleep for health. An NIH-funded randomized trial in adults with overweight who habitually slept less than 6.5 hours found that personalized sleep counseling increased sleep and reduced average daily calorie intake during the two-week intervention. That does not make sleep a weight-loss cure. It shows why recovery belongs inside the plan rather than outside it.</p>
<h2>Frequently asked questions</h2>
<h3>What is the minimum effective workout?</h3><p>There is no universal minimum for every goal. During a difficult week, a brief full-body session or purposeful walk may preserve routine. Your normal program can resume when capacity returns.</p>
<h3>Should I cut calories harder if I miss workouts?</h3><p>Large reactive changes can create another swing. Maintain a sensible meal rhythm and discuss individualized nutrition with a qualified professional.</p>
<h3>Can stress stop weight loss?</h3><p>Stress can affect behaviors and systems related to weight management, but a stalled scale does not identify one cause. Avoid diagnosing yourself from a single symptom or metric.</p>
<h3>What if I am not coping well?</h3><p>Reach out to a qualified mental-health professional, physician, trusted person, or crisis resource. Coaching can support structure and accountability, but it is not mental-health treatment.</p>
<p class="cta"><strong>You do not need to win the week. You need to stay in it.</strong><br>Explore <a href="https://revive-systems.com/revive-reset">The Revive Reset</a> or <a href="https://revive-systems.com/contact-us">start a conversation</a>.</p>
''',
"links":["cdc_stress","nih_sleep","cdc_weight"]},
{
"slug":"coach-trainer-dietitian",
"title":"Health Coach, Personal Trainer, or Dietitian?",
"dek":"The best professional is the one whose scope matches the problem in front of you.",
"keyword":"health coach vs personal trainer vs dietitian",
"image":"mike-site-1.jpg",
"body":r'''
<p class="lead"><strong>A health coach</strong> helps translate goals into sustainable behaviors and accountability. <strong>A personal trainer</strong> designs and coaches exercise within their training and scope. <strong>A registered dietitian nutritionist</strong> has standardized education and credentialing and may provide medical nutrition therapy when appropriately licensed. These roles can complement one another; they should not impersonate one another.</p>
<p>The wellness industry loses trust when everybody claims to fix everything. I would rather tell you the truth about where coaching fits than win a sale by blurring the line.</p>
<div class="answer"><strong>The short answer:</strong> Choose a coach for structure and follow-through, a trainer for exercise instruction and progression, an RDN for individualized nutrition care or medical nutrition therapy, and a licensed clinician for diagnosis and treatment.</div>
<h2>Health coach vs personal trainer vs registered dietitian</h2>
<table><tr><th>Need</th><th>Health coach</th><th>Personal trainer</th><th>RDN</th></tr>
<tr><td>Accountability and behavior structure</td><td>Primary role</td><td>Often supports</td><td>Often supports</td></tr>
<tr><td>Exercise technique and programming</td><td>Only if separately qualified</td><td>Primary role</td><td>Not usually primary role</td></tr>
<tr><td>General healthy-eating education</td><td>Within training and local scope</td><td>Limited general guidance</td><td>Primary expertise</td></tr>
<tr><td>Medical nutrition therapy</td><td>No</td><td>No</td><td>Yes, when credentialed/licensed</td></tr>
<tr><td>Diagnosis or medical treatment</td><td>No</td><td>No</td><td>Only within professional scope</td></tr></table>
<h2>When should you choose a health coach?</h2>
<p>Choose a coach when you largely know what matters but struggle to turn it into a repeatable week. A strong coach helps you define the next action, notice patterns, adapt around constraints, and remain honest when motivation disappears.</p>
<h2>When should you choose a personal trainer?</h2>
<p>Choose a trainer when you need exercise selection, technique coaching, progressive programming, and supervision. Verify the trainer’s current credentials, experience with people like you, emergency practices, and willingness to refer out.</p>
<h2>When do you need a registered dietitian?</h2>
<p>An RDN is the appropriate choice for medical nutrition therapy and for nutrition concerns that require clinical expertise. The Bureau of Labor Statistics notes that dietitians and nutritionists assess clients’ nutritional needs and develop plans, often working with other healthcare professionals. Credential and licensing rules matter.</p>
<h2>Can you use more than one professional?</h2>
<p>Yes. A physician, physical therapist, RDN, mental-health professional, trainer, and coach can form a useful team when each person communicates clearly and respects scope. The client should never have to manage competing claims from professionals who refuse to collaborate.</p>
<h2>How Revive Systems fits</h2>
<p>Mike Over is a NASM-certified CPT, CES, PES, GPT, and FNS with more than sixteen years in health and performance. Revive Systems provides coaching, training strategy, feedback, and accountability. It does not replace medical care, physical therapy, mental-health treatment, or medical nutrition therapy.</p>
<h2>Frequently asked questions</h2>
<h3>Is a health coach a medical provider?</h3><p>Not by title alone. Some licensed clinicians also train as coaches, but coaching itself does not create authority to diagnose or treat a condition.</p>
<h3>Can a personal trainer write a meal plan?</h3><p>Scope and state rules vary. General nutrition education differs from individualized medical nutrition therapy. Ask about qualifications and request an RDN referral when clinical nutrition is involved.</p>
<h3>How do I verify credentials?</h3><p>Ask for the exact credential, issuing organization, current status, and relevant experience. Verify it with the issuing body when possible.</p>
<h3>Who should I see if I have pain or symptoms?</h3><p>Start with an appropriate licensed healthcare professional. A coach or trainer can coordinate around medical guidance but should not diagnose the cause.</p>
<p class="cta"><strong>The right team does not compete for your trust. It earns it through clarity.</strong><br>Read <a href="https://revive-systems.com/about">Mike’s qualifications and story</a>, review the <a href="https://revive-systems.com/faqs">Revive FAQ</a>, or <a href="https://revive-systems.com/contact-us">ask a direct question</a>.</p>
''',
"links":["bls","niddk"]},
{
"slug":"health-coaching-chambersburg-pa",
"title":"What Health Coaching Looks Like in Chambersburg",
"dek":"Personalized coaching is not a template with your name on it. It is a process that changes when your real life changes.",
"keyword":"health coach Chambersburg PA",
"image":"mike-site-6.jpg",
"body":r'''
<p class="lead"><strong>Personalized health coaching in Chambersburg, Pennsylvania</strong> should begin with your history, goals, constraints, and readiness, then create a practical system for training, nutrition habits, recovery, and accountability. The value is not local proximity alone. It is having a named coach who understands the person, reviews the evidence, and adjusts the plan.</p>
<p>Revive Systems grew from my years building Over-Achieve Fitness and coaching people across South Central Pennsylvania. I saw athletes, business owners, parents, and professionals work hard while their plans ignored the stress and responsibility they carried.</p>
<div class="answer"><strong>The short answer:</strong> Good health coaching is a repeating cycle: assess, choose the smallest useful actions, practice, review what happened, and adjust without drama.</div>
<h2>What happens in personalized health coaching?</h2>
<ol>
<li><strong>Clarify the real objective.</strong> “Lose weight” may sit beside a desire for strength, confidence, energy, or a life that feels under control again.</li>
<li><strong>Review the current system.</strong> Training, meals, work, family, sleep, stress, injuries, medical guidance, and previous attempts all supply useful evidence.</li>
<li><strong>Build the first phase.</strong> The plan should be clear enough to follow and flexible enough to survive a normal week.</li>
<li><strong>Create feedback.</strong> Coaching requires regular communication, not a file delivered once.</li>
<li><strong>Adjust with evidence.</strong> Changes should respond to performance, recovery, adherence, symptoms, and appropriate measurements rather than emotion alone.</li>
</ol>
<h2>How is coaching different from a template?</h2>
<table><tr><th>Template</th><th>Personalized coaching</th></tr>
<tr><td>Assumes a standard schedule</td><td>Plans around your actual responsibilities</td></tr>
<tr><td>Changes only when you change it</td><td>Uses recurring review and feedback</td></tr>
<tr><td>Treats missed days as noncompliance</td><td>Investigates where the system broke</td></tr>
<tr><td>Offers generic progression</td><td>Adjusts training demand to response and capacity</td></tr>
<tr><td>Cannot refer or collaborate</td><td>A responsible coach knows when other professionals are needed</td></tr></table>
<h2>Is online or local coaching better?</h2>
<p>The best format is the one that gives you appropriate instruction, consistent communication, reliable review, and a plan you can execute. Some people value local connection in Chambersburg. Others need remote access around travel or work. Format matters less than the quality of the coaching process.</p>
<h2>Which Revive Systems path fits?</h2>
<p><a href="https://revive-systems.com/revive-reset">The Revive Reset</a> is a structured starting point. <a href="https://revive-systems.com/Programs">Revive programs</a> provide different levels of coaching and support. The right path should be based on fit, not pressure. The first conversation is meant to clarify that.</p>
<h2>What should you ask a Chambersburg health coach?</h2>
<ul><li>What are your exact credentials and experience?</li><li>Who will review my progress?</li><li>How often do we communicate?</li><li>How do you modify the plan during stress, travel, or setbacks?</li><li>What is outside your scope?</li><li>When do you refer to a physician, RDN, physical therapist, or mental-health professional?</li></ul>
<h2>Frequently asked questions</h2>
<h3>Where is Revive Systems located?</h3><p>Revive Systems lists its location at 473 Lynn Drive, Chambersburg, Pennsylvania 17202 and also supports coaching beyond the local area.</p>
<h3>Does health coaching replace my doctor?</h3><p>No. Health coaching can support behaviors, structure, education, and accountability. Diagnosis, treatment, and medical clearance belong with licensed healthcare professionals.</p>
<h3>Do I need to be fit before I start?</h3><p>No. An honest assessment exists to find the appropriate starting point. The program should meet your current capacity rather than demand that you prove readiness first.</p>
<h3>How do I know whether Revive Systems is a fit?</h3><p>Review Mike’s story, credentials, programs, and success stories, then have a direct conversation about your goals and constraints. A responsible answer may be yes, not yet, or another professional is more appropriate.</p>
<p class="cta"><strong>Everything begins with an honest conversation.</strong><br>Visit <a href="https://revive-systems.com/about">About Mike Over</a>, see <a href="https://revive-systems.com/success-stories">client stories</a>, or <a href="https://revive-systems.com/contact-us">contact Revive Systems</a>.</p>
''',
"links":["niddk","cdc_weight"]},
]

STYLE = r'''
@page { size: Letter; margin: .55in .62in .62in; }
* { box-sizing: border-box; }
body { margin: 0; color:#15191d; font-family: Arial, Helvetica, sans-serif; font-size:10.6pt; line-height:1.48; }
a { color:#087f8c; text-decoration:none; }
.top { display:flex; align-items:center; justify-content:space-between; border-bottom:4px solid #0b8694; padding-bottom:10px; margin-bottom:14px; }
.logo { width:76px; height:76px; object-fit:contain; }
.eyebrow { color:#64717a; font-size:8.5pt; letter-spacing:1.2px; text-transform:uppercase; text-align:right; }
h1 { font-size:27pt; line-height:1.03; margin:12px 0 7px; letter-spacing:-.6px; color:#111; }
.dek { font-size:14pt; line-height:1.25; color:#3d484f; margin:0 0 14px; }
.hero { width:100%; height:250px; object-fit:cover; object-position:center; border-radius:4px; }
.byline { font-size:8.8pt; color:#5d6970; margin:8px 0 18px; }
.lead { font-size:12.2pt; line-height:1.52; }
.answer { background:#eaf5f5; border-left:5px solid #0b8694; padding:12px 14px; margin:14px 0; font-size:11.2pt; }
h2 { font-size:17pt; line-height:1.15; margin:22px 0 8px; color:#12363b; page-break-after:avoid; }
h3 { font-size:12.2pt; margin:14px 0 3px; color:#173e43; page-break-after:avoid; }
p { margin:7px 0 10px; }
li { margin:0 0 6px; }
table { width:100%; border-collapse:collapse; margin:10px 0 14px; font-size:9.3pt; page-break-inside:avoid; }
th { background:#12363b; color:white; text-align:left; }
th,td { border:1px solid #cbd5d9; padding:7px; vertical-align:top; }
.cta { background:#12363b; color:white; padding:15px; margin:22px 0 12px; font-size:11.2pt; border-radius:4px; }
.cta a { color:#7ee5ed; }
.sources { border-top:1px solid #bcc8cc; margin-top:18px; padding-top:9px; font-size:8.7pt; color:#4c585f; }
.sources li { margin-bottom:4px; }
.notice { font-size:8.3pt; color:#68747b; margin-top:14px; }
.meta { margin-top:10px; padding:10px; background:#f4f7f7; font-size:8.5pt; }
'''

def page(article):
    img=(ASSETS/article['image']).as_uri()
    src_items=''.join(f'<li><a href="{sources[k][1]}">{escape(sources[k][0])}</a></li>' for k in article['links'])
    return f'''<!doctype html><html><head><meta charset="utf-8"><title>{escape(article['title'])}</title><style>{STYLE}</style></head><body>
<header class="top"><img class="logo" src="{LOGO}" alt="Revive Systems logo"><div class="eyebrow">Revive Systems<br>Health coaching built for real life</div></header>
<h1>{escape(article['title'])}</h1><p class="dek">{escape(article['dek'])}</p>
<img class="hero" src="{img}" alt="Mike Over of Revive Systems">
<p class="byline">By Mike Over, NASM CPT, CES, PES, GPT, FNS &nbsp;|&nbsp; Prepared July 16, 2026 &nbsp;|&nbsp; Chambersburg, Pennsylvania</p>
{article['body']}
<section class="sources"><strong>Sources and further reading</strong><ul>{src_items}</ul></section>
<p class="notice">Educational information only. This article does not diagnose, treat, or replace individualized medical, nutrition, mental-health, or rehabilitation care.</p>
<div class="meta"><strong>Publication metadata:</strong> Primary query: {escape(article['keyword'])} &nbsp;|&nbsp; Proposed slug: /blogs/{article['slug']} &nbsp;|&nbsp; Canonical domain: revive-systems.com</div>
</body></html>'''

ROOT.mkdir(parents=True, exist_ok=True)
for a in articles:
    (ROOT/f"{a['slug']}.html").write_text(page(a),encoding="utf-8")

cluster = """# Revive Systems five-blog cluster\n\nStatus: five complete review-ready blog drafts with matching PDFs. No blog pages uploaded.\n\n## Editorial signal\n\nThe cluster follows Mike Over's direct, first-person, identity-aware voice from his July 12, 2026 post, A Man Alone Starts To Rot. Each article opens with a self-contained answer, uses Mike's verified history and scope, avoids unsupported medical claims, and provides clean facts, steps, tables, FAQs, citations, and internal links for later AEO/GEO/SEO publication.\n\n## Proposed future URLs\n\n""" + "\n".join(f"- https://revive-systems.com/blogs/{a['slug']}" for a in articles) + "\n"
(ROOT/"00-cluster-brief.md").write_text(cluster,encoding="utf-8")

sitemap = """<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url><loc>https://revive-systems.com/</loc></url>\n  <url><loc>https://revive-systems.com/about</loc></url>\n  <url><loc>https://revive-systems.com/contact-us</loc></url>\n  <url><loc>https://revive-systems.com/faqs</loc></url>\n  <url><loc>https://revive-systems.com/revive-reset</loc></url>\n  <url><loc>https://revive-systems.com/Programs</loc></url>\n  <url><loc>https://revive-systems.com/inthemedia</loc></url>\n  <url><loc>https://revive-systems.com/blogs</loc></url>\n  <url><loc>https://revive-systems.com/success-stories</loc></url>\n  <url><loc>https://revive-systems.com/testimonials</loc></url>\n  <url><loc>https://revive-systems.com/ebooks</loc></url>\n  <url><loc>https://revive-systems.com/free-guides</loc></url>\n  <url><loc>https://revive-systems.com/privacy-policy</loc></url>\n</urlset>\n"""
(ROOT/"sitemap-validated-current.xml").write_text(sitemap,encoding="utf-8")

robots = """User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Claude-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: https://revive-systems.com/sitemap.xml\n"""
(ROOT/"robots-ai-crawler-proposed.txt").write_text(robots,encoding="utf-8")
