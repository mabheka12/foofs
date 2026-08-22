// ─── State-level intro paragraphs ─────────────────────────────────────────
// Mirrors the cityIntros pattern: each entry gives a short, roofing-specific
// intro plus a practical tip. Content is differentiated by climate, common
// roofing materials, and regional risk factors (hail, hurricanes, snow load,
// wildfire, humidity) to avoid thin/duplicate content across state pages.

export const stateIntros: Record<string, { intro: string; tip: string }> = {
  alabama: {
    intro:
      "Alabama's roofing market is shaped by hot, humid summers and a real risk of hurricane-driven wind and rain along the Gulf Coast, making wind-rated shingles and proper attic ventilation common priorities for homeowners.",
    tip: "If you're near Mobile or the coast, ask contractors specifically about hurricane strapping and wind-rated shingle warranties — inland shops may not stock the same materials.",
  },
  alaska: {
    intro:
      "Roofing in Alaska has to account for extreme snow loads, ice damming, and long stretches of freezing temperatures, so most established contractors specialize in metal roofing and heavy-duty insulation work.",
    tip: "Ice dam prevention (heat cables, proper venting) is worth asking about upfront — it's one of the most common and costly issues for Alaska homeowners.",
  },
  arizona: {
    intro:
      "Arizona's roofing industry is built around extreme heat and UV exposure rather than moisture, with tile, foam, and reflective coatings favored over standard asphalt shingles in many parts of the state.",
    tip: "Ask about UV-resistant materials and reflective coatings specifically — a roof that performs well in the Northeast can degrade quickly under Phoenix summer sun.",
  },
  arkansas: {
    intro:
      "Arkansas sits in a active severe-weather corridor, with hail and tornado activity driving significant demand for storm damage assessment and insurance-claim-related roof replacement.",
    tip: "If you're filing an insurance claim after a storm, look for contractors experienced specifically with claims documentation, not just repair work.",
  },
  california: {
    intro:
      "California's roofing needs vary sharply by region — wildfire-resistant materials and Class A fire ratings are a major concern in fire-prone areas, while coastal cities focus more on tile, drought-resilient design, and seismic considerations.",
    tip: "In wildfire-risk zones, confirm a contractor is experienced with Class A fire-rated roofing systems, which some insurers now require for coverage.",
  },
  colorado: {
    intro:
      "Colorado has one of the highest hail-damage rates in the country, particularly along the Front Range, which has produced a large number of contractors specializing in impact-resistant shingles and storm restoration.",
    tip: "Ask specifically about impact-resistant (Class 4) shingles — many Colorado insurers offer premium discounts for installing them.",
  },
  connecticut: {
    intro:
      "Connecticut's roofing market deals with cold winters, heavy snow, and coastal storm exposure near the Long Island Sound, with ice dam prevention and asphalt shingle replacement being the most common jobs.",
    tip: "Older homes in Connecticut often have layered roofing from past repairs — ask contractors whether a full tear-off is recommended before quoting a like-for-like replacement.",
  },
  delaware: {
    intro:
      "Delaware's small size means most roofing contractors serve the entire state, with coastal areas near Rehoboth and Dover Beach facing higher wind and moisture exposure than inland communities.",
    tip: "Coastal Delaware properties should ask about wind-rated shingles and salt-air-resistant flashing, which last longer near the shore.",
  },
  florida: {
    intro:
      "Florida has some of the strictest roofing codes in the country due to hurricane risk, and most contractors here are well-versed in wind-rated systems, tile roofing, and the permitting requirements that follow major storms.",
    tip: "Confirm any contractor is licensed with the state (not just insured) — Florida has cracked down heavily on unlicensed storm-chasing roofers after hurricane season.",
  },
  georgia: {
    intro:
      "Georgia's roofing demand is driven by humid summers, seasonal thunderstorms, and periodic hail in the northern part of the state, with asphalt shingle replacement and moisture-related repairs being the most common jobs.",
    tip: "In metro Atlanta, ask about mold- and algae-resistant shingle coatings — the combination of humidity and tree cover accelerates roof staining and deterioration.",
  },
  hawaii: {
    intro:
      "Hawaii's roofing market is unusual in the US — high humidity, salt air, and occasional hurricanes mean metal and tile roofing dominate, while standard asphalt shingles tend to underperform.",
    tip: "Given how much materials cost to ship to the islands, get multiple quotes and confirm exactly which materials are being used before committing.",
  },
  idaho: {
    intro:
      "Idaho roofing contractors deal with a wide range of conditions, from heavy mountain snow loads in the north to drier, more moderate conditions in the Boise area.",
    tip: "If you're in a higher-elevation area, ask about snow load ratings and ice-and-water shield installation, which matter far more there than in the Boise valley.",
  },
  illinois: {
    intro:
      "Illinois roofing demand is split between Chicago's dense urban housing stock, which often needs flat or low-slope commercial roofing expertise, and the rest of the state, where standard pitched asphalt roofs are more common.",
    tip: "If you're in Chicago and need flat-roof or commercial work, look specifically for contractors with EPDM or TPO experience rather than general residential shingle installers.",
  },
  indiana: {
    intro:
      "Indiana sees a mix of hail-driven storm damage and standard wear-and-tear replacement work, with many contractors experienced in insurance claims following spring and summer severe weather.",
    tip: "After a hail event, get a roof inspection even if damage isn't visible from the ground — hail bruising can void shingle warranties if left unaddressed.",
  },
  iowa: {
    intro:
      "Iowa sits within Tornado Alley and experiences frequent hail, which has made storm damage assessment and full roof replacement a major part of the local roofing industry.",
    tip: "Iowa homeowners should keep records of storm dates in their area — most insurers require a claim to be filed within a specific window after a hail event.",
  },
  kansas: {
    intro:
      "Kansas has one of the highest hail frequencies in the country, and its roofing contractors are correspondingly experienced with impact-resistant shingles and large-scale insurance restoration work.",
    tip: "Ask contractors about Class 4 impact-resistant shingles — many Kansas insurers offer meaningful discounts for installing them given the state's hail history.",
  },
  kentucky: {
    intro:
      "Kentucky's roofing market handles a mix of severe spring storms, humidity-related wear, and standard age-related shingle replacement across both urban Louisville and more rural parts of the state.",
    tip: "In older Louisville neighborhoods, ask whether a permit and structural inspection are needed before replacement — some older homes have decking that needs repair first.",
  },
  louisiana: {
    intro:
      "Louisiana roofing is dominated by hurricane and flood-adjacent concerns, with wind-rated materials, proper flashing, and rapid storm-response repair being central to the local industry.",
    tip: "After a hurricane, be cautious of out-of-state storm-chasing crews — verify Louisiana licensing before signing any repair contract.",
  },
  maine: {
    intro:
      "Maine's roofing contractors deal with heavy snow loads, ice damming, and coastal wind exposure, with metal roofing increasingly popular for its snow-shedding properties.",
    tip: "If ice dams have been a recurring issue, ask about ice-and-water shield coverage and attic ventilation upgrades rather than just replacing shingles.",
  },
  maryland: {
    intro:
      "Maryland roofing demand spans dense Baltimore-area rowhomes, which often need specialized flat or low-slope expertise, and suburban and coastal areas dealing with standard wind and storm exposure.",
    tip: "For Baltimore rowhomes, confirm a contractor has specific experience with flat and low-slope roofing systems — not all residential roofers do.",
  },
  massachusetts: {
    intro:
      "Massachusetts roofing contractors handle a mix of historic homes requiring careful, code-compliant restoration and modern coastal properties facing nor'easter wind and snow exposure.",
    tip: "In historic districts like parts of Boston, check whether roofing material choices are subject to local historic preservation guidelines before starting a project.",
  },
  michigan: {
    intro:
      "Michigan roofing deals with heavy lake-effect snow in some regions, freeze-thaw cycles statewide, and periodic hail damage, making ice dam prevention and shingle durability major considerations.",
    tip: "In areas near the Great Lakes, ask specifically about lake-effect snow load capacity — it can be significantly higher than standard regional snow load estimates.",
  },
  minnesota: {
    intro:
      "Minnesota's roofing industry is heavily shaped by extreme cold, heavy snowfall, and hail, with most contractors well-versed in ice dam prevention, snow load engineering, and storm restoration claims.",
    tip: "Minnesota insurers often require documented hail damage within a set timeframe — schedule an inspection soon after any significant storm to preserve your claim options.",
  },
  mississippi: {
    intro:
      "Mississippi roofing contractors deal with hurricane exposure along the Gulf Coast and severe thunderstorm and tornado activity further inland, making wind-rated materials a common recommendation statewide.",
    tip: "Coastal Mississippi homeowners should ask about wind mitigation inspections, which can also reduce homeowners insurance premiums.",
  },
  missouri: {
    intro:
      "Missouri sits within a high-hail-frequency zone, and its roofing industry is correspondingly built around storm damage assessment, insurance claims, and impact-resistant shingle installation.",
    tip: "St. Louis and Kansas City both see frequent hail — ask contractors for local storm history data if you're unsure whether recent weather may have caused damage.",
  },
  montana: {
    intro:
      "Montana roofing contractors work with heavy snow loads, high wind exposure, and significant temperature swings, with metal roofing common in more rural and mountainous areas.",
    tip: "If you're at higher elevation, confirm your roof's snow load rating meets local building code — requirements vary significantly across the state.",
  },
  nebraska: {
    intro:
      "Nebraska experiences frequent severe thunderstorms and hail, and its roofing contractors are generally experienced with both storm restoration work and standard age-related replacement.",
    tip: "After a hail event, request a written inspection report even if you don't plan to file a claim immediately — it can support a future claim if damage worsens.",
  },
  nevada: {
    intro:
      "Nevada roofing is shaped by intense desert heat and UV exposure rather than moisture, with tile and reflective coatings common in the Las Vegas area to help manage cooling costs.",
    tip: "Ask about reflective or 'cool roof' coatings — they can meaningfully reduce indoor temperatures and energy costs in the Las Vegas and Reno areas.",
  },
  "new-hampshire": {
    intro:
      "New Hampshire roofing contractors deal with heavy winter snow and ice, and ice dam prevention is one of the most common concerns raised by homeowners in the state.",
    tip: "Ask about attic insulation and ventilation as part of any roofing quote — poor ventilation is a leading cause of ice dams in New Hampshire homes.",
  },
  "new-jersey": {
    intro:
      "New Jersey's roofing market spans dense suburban housing near New York City and coastal shore towns dealing with wind and storm exposure, giving contractors experience with both standard shingles and higher wind-rated systems.",
    tip: "Shore-area homeowners should ask about wind-rated shingles and salt-air-resistant flashing, which hold up better than standard materials near the coast.",
  },
  "new-mexico": {
    intro:
      "New Mexico roofing contractors primarily deal with intense sun exposure, low humidity, and flat or low-slope roofing common in adobe-style construction, rather than the moisture-driven issues seen elsewhere.",
    tip: "If your home has a flat or low-slope roof, confirm the contractor has specific experience with that style rather than standard pitched asphalt roofing.",
  },
  "new-york": {
    intro:
      "New York's roofing needs vary widely between dense urban flat-roof buildings in New York City and heavy snow-load residential roofing further upstate, giving the state a broad mix of specialized contractors.",
    tip: "In New York City, confirm a contractor has experience with the specific permitting and co-op/condo board approval process, which can differ from suburban jobs.",
  },
  "north-carolina": {
    intro:
      "North Carolina roofing contractors handle hurricane exposure along the coast, hail and severe thunderstorms further inland, and general humidity-related wear across the state.",
    tip: "Coastal North Carolina homeowners should ask whether a wind mitigation inspection could reduce their homeowners insurance premium after a roof replacement.",
  },
  "north-dakota": {
    intro:
      "North Dakota roofing deals with extreme cold, heavy snow, and strong prairie winds, with metal roofing and reinforced shingle systems commonly recommended.",
    tip: "Ask about wind-rated shingle installation specifically — standard nailing patterns may not hold up to North Dakota's sustained wind speeds.",
  },
  ohio: {
    intro:
      "Ohio's roofing industry deals with a mix of freeze-thaw cycles, seasonal hail, and general humidity-related wear, with asphalt shingle replacement being the most common residential job statewide.",
    tip: "Given Ohio's freeze-thaw cycles, ask about proper attic ventilation as part of any roofing quote — it significantly extends shingle lifespan.",
  },
  oklahoma: {
    intro:
      "Oklahoma is part of Tornado Alley and experiences some of the most frequent hail and severe wind events in the country, making storm restoration and insurance claims a core part of the local roofing industry.",
    tip: "Given how frequently Oklahoma sees hail, ask contractors about impact-resistant (Class 4) shingles, which many insurers offer premium discounts for.",
  },
  oregon: {
    intro:
      "Oregon roofing contractors deal primarily with sustained rain and moss growth rather than extreme temperature swings, making moisture management and moss-resistant materials a common focus.",
    tip: "Ask about moss and algae-resistant shingle treatments — Oregon's damp climate makes this a bigger long-term factor than in drier states.",
  },
  pennsylvania: {
    intro:
      "Pennsylvania roofing spans older housing stock in cities like Philadelphia and Pittsburgh, along with heavier snow load requirements in more rural and mountainous parts of the state.",
    tip: "For older homes in Philadelphia or Pittsburgh, ask whether a structural inspection is recommended before replacement — older decking sometimes needs repair first.",
  },
  "rhode-island": {
    intro:
      "Rhode Island's small size and coastal exposure mean most roofing contractors are experienced with both standard shingle replacement and wind-rated systems for properties near Narragansett Bay.",
    tip: "Coastal properties should ask specifically about salt-air-resistant flashing and wind-rated shingles, which last longer near the water.",
  },
  "south-carolina": {
    intro:
      "South Carolina roofing contractors deal with hurricane risk along the coast and humid, storm-prone conditions further inland, with wind-rated materials commonly recommended statewide.",
    tip: "Coastal South Carolina homeowners should ask about wind mitigation inspections, which can reduce homeowners insurance premiums after a roof replacement.",
  },
  "south-dakota": {
    intro:
      "South Dakota roofing deals with a combination of heavy snow, hail, and strong prairie winds, giving many contractors experience with both storm restoration and reinforced shingle systems.",
    tip: "After a hail event, ask for a written inspection report — South Dakota insurers typically require documented damage within a set window to process a claim.",
  },
  tennessee: {
    intro:
      "Tennessee roofing contractors handle a mix of severe spring storms, humidity-related wear, and general shingle replacement across both urban Nashville and Memphis and more rural areas of the state.",
    tip: "After a spring storm, get an inspection even without visible damage — hail bruising can shorten shingle life without being obvious from the ground.",
  },
  texas: {
    intro:
      "Texas has one of the largest and most varied roofing markets in the country, with hail-driven storm restoration common in the north, hurricane exposure along the Gulf Coast, and intense heat statewide.",
    tip: "Given Texas's size, ask contractors about their specific experience in your region — hail expertise in Dallas doesn't necessarily translate to hurricane-related work in Houston.",
  },
  utah: {
    intro:
      "Utah roofing contractors deal with heavy mountain snow loads in some areas and intense sun exposure in the Salt Lake valley, giving the state a fairly wide range of material recommendations by region.",
    tip: "If you're at higher elevation near the mountains, confirm your roof's snow load rating meets local code requirements, which can differ from the valley floor.",
  },
  vermont: {
    intro:
      "Vermont roofing contractors are heavily focused on snow load capacity, ice dam prevention, and metal roofing, given the state's long, snow-heavy winters.",
    tip: "Standing seam metal roofing is popular in Vermont for its snow-shedding properties — worth asking about if you're replacing an aging asphalt roof.",
  },
  virginia: {
    intro:
      "Virginia roofing spans coastal hurricane exposure near Virginia Beach and Norfolk, and more standard storm and humidity-related wear further inland toward Richmond and the Blue Ridge region.",
    tip: "Coastal Virginia homeowners should ask about wind-rated shingles and whether a wind mitigation inspection could lower their insurance premium.",
  },
  washington: {
    intro:
      "Washington roofing contractors deal primarily with sustained rain, moss growth, and moisture management on the west side of the state, while the drier east side has more in common with inland climates.",
    tip: "West of the Cascades, ask about moss-resistant shingle treatments and proper attic ventilation, which matter far more there than on the drier east side.",
  },
  "west-virginia": {
    intro:
      "West Virginia's mountainous terrain means roofing contractors deal with a mix of heavy snow at higher elevations and more standard humidity-related wear in the valleys.",
    tip: "If your home is at higher elevation, ask about snow load ratings specifically — requirements can vary noticeably even within short distances in West Virginia's terrain.",
  },
  wisconsin: {
    intro:
      "Wisconsin roofing contractors handle heavy snow loads, ice damming, and freeze-thaw cycles, with proper attic ventilation and insulation being a common focus alongside standard shingle replacement.",
    tip: "Ask about ice-and-water shield coverage along eaves and valleys — it's a standard defense against ice dams in Wisconsin's winter climate.",
  },
  wyoming: {
    intro:
      "Wyoming roofing contractors deal with strong sustained winds, heavy snow, and significant temperature swings, making wind-rated and reinforced shingle systems a common recommendation.",
    tip: "Given Wyoming's wind speeds, ask specifically about wind-rated shingle installation and nailing patterns rather than standard residential specifications.",
  },
};