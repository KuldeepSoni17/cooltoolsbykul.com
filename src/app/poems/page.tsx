"use client";

import { useEffect, useState } from "react";

type Poem = {
  title: string;
  body: string;
};

const poems: Poem[] = [
  {
    title: "શબ્દ-પ્રસવની પીડા",
    body: `આ પાને પાનાં ભરી નાંખવાની રમત,
કે વેદનાને આકાર આપવાની કળા,

અઘરા શબ્દો ખોળી, ગોઠવવાનો દંભ,
કે જોડણી-ચૂકની ભૂલ સ્વીકારવાની સહજતા,

આ કોઈ બીજાનું પોતાનું કહી જવાની ચપળતા,
કે શબ્દ-પ્રસવની પીડાએ પ્રગટેલી પ્રામાણિકતા,

આ નિતનવા પુરસ્કારો ઊંચકે એવી ગોઠવણ,
કે માલધારીય ચાખી હરખાય એવી ભોળપણ,

આ કેટલાએ ખરીદી એની ગણતરી,
કે કોઈને તો અડશે જ એની ખાતરી,

આ કાયદામાં વિચાર બાંધવાની તકેદારી,
કે સાફ, સચોટ ચિતરવાની બાંહેધરી,

આ ક્યાંક ઝડપાઇ ના જઈએ એનો નિરંતર પ્રયાસ,
કે બેફામ, બેફિકર વિહારની આગવી સુવાસ.`,
  },
  {
    title: "મારી પત્ની",
    body: `શરમાળ છે,
સાદી છે,
આ મારી પત્ની,

તેને ગાવું તો ખુબ ગમે છે,
પણ મન માં જ ગણગણે છે,
પાડોશી સાંભળી ના જાય એટલે,

આવડતું નથી નાચતા પણ શોખ મોટો,
પણ બહું કાબૂ રાખે છે પગ પર,
કે પાડોશી જોઇ ના જાય એટલે,

દમ ઘૂંટે છે એનો ઘૂંઘટ માં,
દેખાતું પણ નથી સાફ,
પણ સહે છે એ બધું,
કે પાડોશી ની નજરે ના ચડે,

મારે એને દૂર લઇ જવી છે,
જ્યાં એક જ ઘર હોય,
અમારું જ ઘર,

ત્યાં એ ગળું ખોલી ને ગાશે,
અને મન ભરી ને નાચશે,
અને એના ઘૂંઘટ નું જે કાપડ વધશે,
એમાં થી એને પાંખો બનાવી દઈશ,

પછી ધીરે ધીરે થાક ના લીધે,
ઢળી પડશે આંખો મારી પત્ની ની,

આ મારી પત્ની,
શરમાળ છે,
સાદી છે,
પણ મારી છે.`,
  },
  {
    title: "પાટિયા વિનાની બસ",
    body: `પાટિયા વિનાની બસમાં ચડ્યો છે,
શી ખબર ક્યાં લઈ જશે,

મારા જેવા તો બીજા પણ લાખો છે,
મંજિલ વિહોણા નીકળી જ પડ્યા છે,

આમાં કો'કને તો પહોંચવું પણ છે ક્યાંક,
પણ ક્યાંક એ ક્યાં છે, એની જ તો ખબર નથી,

સ્ટેશનો પણ કેટલાંય ગયાં,
પણ પોતિકા એકેય લાગ્યાં જ નઇ,

કદાચ આગલું મારું હોઇ શકે,
ખસોને જરા, ઉતરવાની જગ્યા કરો.`,
  },
  {
    title: "અન્યાયનો ન્યાય",
    body: `કોઈ આપણને અન્યાય કરે ને,
આપણને ન સમજાય,
તો કેવું સારું,

કોઈને આપણે અન્યાય કરીએ ને,
આપણને સમજાય જાય,
તો કેવું સારું.`,
  },
  {
    title: "પ્રસર્યા કરું",
    body: `પ્રસર્યા કરું,
પ્રસર્યા કરું,
નીકળીને નસ માંથી,
ઢોળાવું ભોંય પર,
ખાબોચિયું બની,
ને પ્રસર્યા કરું,

નથી રહેવું આ નાનકડી તપેલીમાં,
ઉકળાવું ને ઊભરાવું,
ચૂલાની ચારેકોર ફેલાવું,
ને પ્રસર્યા કરું,

થાક્યો હવે ગામેગામ ફરી આ વાદળમાં,
ઠેઠથી છલાંગું,
ઘૂસું પેટાળમાં,
ને પ્રસર્યા કરું.`,
  },
  {
    title: "વસમું",
    body: `ખુલ્લા આકાશ તળે પથારી,
તોય આ ગૂંગળામણ શાની,

હમણાં તો ગળચ્યું પેટભરી,
તોય આ ભૂખ શાની,

એકેય જખમ નથી આ ડીલ પર,
તોય આ બળે છે શાનું,

ના મરજ છે કે ના કરજ છે,
તોય આ નીંદર ખોવાઈ શાની,

કોઈ સમજાવે તો સમજીએ,
આ ઘડપણ વહમું શાનું.`,
  },
  {
    title: "શોધ",
    body: `ફાંફાં મારો,
ધ્યાનથી સાંભળો,
બેફામ વાંચો,
ને બધું જ કહી દો,

શી ખબર કઈ ઘડી એ ભગવાન મળી જાય,
એ ધૂન મળી જાય,
એ નજમ મળી જાય,
એ માણસ મળી જાય.`,
  },
  {
    title: "ચાતક",
    body: `આખી જીંદગી એ રાહ જોતી રહી,
પપ્પા ની,
પ્રેમી ની,
પતિ ની,
દીકરા ની,
મૃત્યુ ની.`,
  },
  {
    title: "પ્લાન",
    body: `જેટલો ફરું,
એટલો જ તુચ્છ થઉ,

જેટલો તુચ્છ,
એટલો જ મારો ઓછો,

જેમ-જેમ મારો ઓછો,
એમ એક ચિંતા ગાયબ,

જ્યારે બધી ચિંતા ગાયબ,
પીંછા જેટલો હલકો,

હું પીંછા જેટલો હલકો થઈ ને,
વાદળ-ચકલીની સવારી કરીશ.`,
  },
  {
    title: "મોડા આવતું ભાન",
    body: `ફરિયાદ પણ કરું,
તો કોની કરું જણાવ,
કૈદ તો હું છું,
પણ કૈદ મારામાં જ,

કોનાથી લડું જણાવ,
કોને હરાવું હું,
આ જંગ મારી જે,
એ જંગ મારાથી જ,

બધાને ખુશ કર્યા,
પોતાને ખફા કરી,
જણાવ શું મળ્યું,
મને ઈશ્વર બની,

પોતાનું કરું હું શું,
મને જરા જણાવ,
હું ખર્ચ થઈ રહ્યો,
હું ખતમ થઈ રહ્યો.`,
  },
  {
    title: "અડધી રાતની વાતો",
    body: `ક્યારેક પામવાની ઇચ્છા એટલી પ્રબળ થઈ જાય કે,
રજાઈ ફંગોળી બેઠા થઈ જવાય,

એવું તો શું બદલાઈ જવાનું મળી ગયાં પછી,
એવું તો શું કરડશે જો નઇ મળે તો,

મેળવી લઈએ ને ભોગવવાનો,
સમય જ ના બચે તો,
ને સમય ભોગવીને પસ્તાવો થાય,
કે મેળવ્યું જ નઇ,

તો કરવું શું?

'ચલ ઉઠ એ'
અને
'પણ કેમ ઊઠવું'
ની વચ્ચે કશેક,
સૂઈ જવું છે કાયમી.`,
  },
  {
    title: "અંતર નો આંકડો",
    body: `સતાવી રહ્યા છે અઘરા સવાલો અમુક દિવસો થી,
સવાલ એ કે કેટલું હોવું જોઈએ,

પણ નક્કી તો કરવો પડશે એક આંકડો,
કે કેટલું હોવું જોઈએ અંતર તારી ને મારી વચ્ચે,

પેલો રોજ આવે છે, સદીઓ થી, મન્વંતરો થી, પૂર્વ થી,
કાયમ રાખીને એ દૂરી નો આંકડો,

કે જેનો એક દોરો પણ નજીક આવે,
તો બંને ટકરાઇ જાય,
ને જેનો એક દોરો પણ દૂર જાય,
તો બંને વિખરાઈ જાય.`,
  },
  {
    title: "કિસ્સો",
    body: `લખ્યો તો એક કિસ્સો એને એક કાગળ પર,
એ કાગળ જે છુપાવાનો રહી ગયો,

મારી નજરે જોવો તો,
કઈ ખાસ ન હતો એ કિસ્સો,
બસ એ જ કે હાથ એનો પકડેલો,
સ્કૂલબસ આવી ત્યારે,

પણ એની નજરે જોવો તો,
એક પ્રચંડ બદલાવ હતો સમયમાં,
એક વાયદો માંગેલો મારી જોડે,
કે આ હાથ ક્યારેય ના છોડતી,

પણ દૂ:ખ નથી આ કેદ નું,
નીકળી જશે આ જેલવાસ,
વાગોળતાં વાગોળતાં એ કિસ્સો,
આ વખતે એની નજરો થી.`,
  },
  {
    title: "હાશકારો",
    body: `આ એવું જ છે કે,
જ્યારે તમે બ્રશ કરતાં હોવ,
ને તમને છીંક આવે,

તમે રોકવાનો પ્રયત્ન કરો,
કારણ કે નહીં તો બધું જ બગડી જશે,

પણ જેટલું રોકો,
એટલી વધારે અકળામણ,
રહેવાય નઇ એવી ગૂંગળામણ,

ને પછી તમે છોડી દો,
જવા દો,

અને હાશકારો,

ખરું કે કામ વધ્યું,
સમેટવું પડશે બધું ગાભાંમાં,
પણ એમાં શું,
મુક્તિ ય થઈ ને.`,
  },
  {
    title: "અડધું-અધૂરું",
    body: `ખાલી હું પૂરો છું અત્યારે,
બાકી બધું અડધું, ને બધું અધૂરું,

છે રાત અડધી, છે અધૂરો ચાંદો,
ઊંઘ અડધી, સમણું અડધું,

રોમાંચ છે અડધો, તડપ છે અડધી,
લાગણી છે અડધી, ફરિયાદ છે અડધી,

સૂતેલું છે અડધું,
મડદું છે અડધું.`,
  },
  {
    title: "આખરી",
    body: `આજે તાન અલગ છે ઘણું આ વાયરાનું,
જાણે ફૂંકાઈ રહ્યો છે આ વખતે આખરી,

આજે અલગ જ જોરથી ફટકારી રહ્યા છે કિનારાને મોજાઓ,
જાણે વહી રહ્યા છે આ વખતે આખરી,

આ સંયોગ નથી,
છે ઇશારાઓ અલૌકિક કશા,

તો આવી રહ્યો છું તારે ત્યાં,
ખખડાવીશ દરવાજો,
આ વખતે ઘબરાતી નહીં,
કદાચ ખખડશે આ દરવાજો,
આ વખતે આખરી.`,
  },
  {
    title: "ઝાકળ",
    body: `એક ગીત લખવું છે તારા માટે,
પણ એક સવાલ છે મારે મન,
તને હું ખુદા કહું,
કે કહું તને ભગવન,

શબ્દકોશમાં ભગવાન એ ઈશ્વર,
ને જોયું ખુદા તો એ પણ ઈશ્વર,

કાલ ઊઠીને ઝાકળ જોઈશ,
કાલથી તને હું ઝાકળ કહીશ.`,
  },
  {
    title: "શૂન્યતા",
    body: `ના ચાંદો દેખાય,
ના અજવાશ હોય,
ના જોઈએ વાદળ,
બસ અવકાશ હોય,

એક દિવસ એવો આપ,
લખવાનું કારણ ના આપ.`,
  },
  {
    title: "મળી ગયો",
    body: `ધર્મ શોધ્યો, ના મળ્યો,
ઉદ્દેશ શોધ્યો, ના મળ્યો,
પ્રેમ શોધ્યો, ના મળ્યો,
સંબંધ શોધ્યો, ના મળ્યો,

શોધખોળથી થાકી હારી રાતે,
તે જઈ બેઠો સરસ્વતી કિનારે,
ખરેલાં સૂકા પત્તાઓનું તાપણું કર્યું,

એણે પોતાને શોધ્યો,
મળી ગયો.`,
  },
  {
    title: "લગ્નનો પુલ",
    body: `કેટલો નબળો છે આ લગ્નનો પુલ,

કઈક મારી માં એ કીધું ને હલવા માંડ્યો,
કઈક એની માં એ શિખવાડ્યું ને ધ્રૂજવા માંડ્યો,

જે બાંધેલો ફક્ત ફોટા જોઈ,
શરીર જોઈ,
ઘર જોઈ,
હોદ્દો જોઈ,

લાગણીનાં પિલ્લરના ટેકા વગર,
નબળો જ રહેવાનો આ લગ્નનો પુલ.`,
  },
];

export default function PoemsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePoem = poems[activeIndex];

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % poems.length);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + poems.length) % poems.length);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        goNext();
      }
      if (event.key === "ArrowLeft") {
        goPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-6 py-10 text-zinc-100 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(45,212,191,0.22),transparent_28%),radial-gradient(circle_at_88%_15%,rgba(99,102,241,0.2),transparent_34%),radial-gradient(circle_at_50%_90%,rgba(236,72,153,0.16),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative mx-auto w-full max-w-7xl">
        <p className="inline-flex rounded-full border border-emerald-300/50 bg-zinc-900/70 px-4 py-1 text-sm font-semibold text-emerald-200 backdrop-blur">
          Songs / Poems / Stories
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
          ગુજરાતી કાવ્ય સંગ્રહ
        </h1>
        <p className="mt-4 max-w-3xl text-zinc-300 sm:text-lg">
          Future-mode reading room. એક સમયે એક કવિતા, cinematic focus સાથે.
          Arrow keys (left and right) પણ કામ કરશે.
        </p>

        <section className="mt-10 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                Poem Index
              </p>
              <p className="text-sm text-zinc-300">
                {activeIndex + 1}/{poems.length}
              </p>
            </div>

            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {poems.map((poem, index) => (
                <button
                  key={poem.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                    index === activeIndex
                      ? "border-cyan-300/70 bg-cyan-400/10 shadow-[0_0_22px_rgba(45,212,191,0.25)]"
                      : "border-zinc-700/80 bg-zinc-900/70 hover:border-zinc-500"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      index === activeIndex ? "text-cyan-100" : "text-zinc-200"
                    }`}
                  >
                    {poem.title}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          <article className="rounded-3xl border border-zinc-700/60 bg-zinc-900/55 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(20,184,166,0.12)] sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                  Live Reading
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-cyan-100 sm:text-3xl">
                  {activePoem.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="rounded-full border border-zinc-600 bg-zinc-900/80 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400 hover:text-white"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-full border border-cyan-300/60 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-400/20"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all duration-500"
                style={{
                  width: `${((activeIndex + 1) / poems.length) * 100}%`,
                }}
              />
            </div>

            <pre className="max-h-[62vh] overflow-y-auto whitespace-pre-wrap pr-1 font-sans text-base leading-8 text-zinc-100 sm:text-lg">
              {activePoem.body}
            </pre>
          </article>
        </section>

        <section className="mt-5 flex flex-wrap gap-2">
          {poems.map((poem, index) => (
            <button
              key={poem.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                index === activeIndex
                  ? "border-emerald-300 bg-emerald-400/20 text-emerald-100"
                  : "border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}
