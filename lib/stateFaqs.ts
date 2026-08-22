// ─── State-level FAQ content (all 50 states) ───────────────────────────────
// Powers both the visible FAQ accordion and FAQPage JSON-LD on each state
// page. Answers are written to be genuinely state-specific (climate, common
// roof types, regional risk factors) rather than a single templated answer
// with the state name swapped in.

export interface StateFaq {
  question: string
  answer: string
}

export const stateFaqs: Record<string, StateFaq[]> = {
  alabama: [
    {
      question: 'Do Alabama roofs need to be wind-rated?',
      answer:
        'Homes near Mobile and the Gulf Coast are the most exposed to hurricane-force wind, and many contractors there recommend wind-rated shingles even where local code doesn\'t strictly require them. Inland Alabama sees less wind exposure but more humidity-related wear.',
    },
    {
      question: 'How does humidity affect roofs in Alabama?',
      answer:
        'Alabama\'s hot, humid summers accelerate algae and moss growth on shingles and put extra strain on attic ventilation. Contractors often recommend algae-resistant shingles and confirm proper ventilation as part of a replacement.',
    },
  ],
  alaska: [
    {
      question: 'Why is metal roofing so common in Alaska?',
      answer:
        'Metal roofing sheds heavy snow more effectively than asphalt shingles and holds up better under Alaska\'s extreme cold and freeze-thaw cycles, which is why it\'s the default recommendation from most established Alaska roofing contractors.',
    },
    {
      question: 'How serious are ice dams in Alaska?',
      answer:
        'Ice dams are one of the most common and costly roofing issues in Alaska, caused by heat escaping the attic and melting snow that refreezes at the eaves. Heat cables, proper insulation, and ventilation are the standard prevention measures.',
    },
  ],
  arizona: [
    {
      question: 'What roofing materials work best in Arizona\'s heat?',
      answer:
        'Tile, foam, and reflective "cool roof" coatings generally outperform standard asphalt shingles under Arizona\'s intense sun and UV exposure, particularly in the Phoenix area where surface temperatures can accelerate shingle breakdown.',
    },
    {
      question: 'Do Arizona roofs need special UV protection?',
      answer:
        'Yes — standard shingles rated for milder climates can degrade faster under Arizona\'s UV exposure. Look for materials specifically rated for high-UV, high-heat conditions rather than a generic national warranty.',
    },
  ],
  arkansas: [
    {
      question: 'Why is storm damage assessment such a common service in Arkansas?',
      answer:
        'Arkansas sits in an active severe-weather corridor with frequent hail and tornado activity, which has made storm damage inspection and insurance-claim documentation a core part of the local roofing industry.',
    },
    {
      question: 'Should I get a roof inspection after a hailstorm in Arkansas?',
      answer:
        'Yes, even if damage isn\'t visible from the ground. Hail bruising can compromise a shingle\'s waterproofing without an obvious visual sign, and most insurers require documented damage within a set window to process a claim.',
    },
  ],
  connecticut: [
    {
      question: 'How do Connecticut winters affect roofing decisions?',
      answer:
        'Heavy snow and freeze-thaw cycles make ice dam prevention a common concern, and many Connecticut contractors recommend improved attic ventilation and ice-and-water shield membranes along the eaves as part of a replacement.',
    },
    {
      question: 'Do older Connecticut homes need a full roof tear-off?',
      answer:
        'Many older Connecticut homes have layered roofing from past repairs. Contractors generally recommend a full tear-off rather than installing new shingles over old layers, since it allows proper inspection of the decking underneath.',
    },
  ],
  delaware: [
    {
      question: 'Do coastal Delaware homes need different roofing than inland areas?',
      answer:
        'Yes. Properties near Rehoboth Beach and the coast face higher wind and salt-air exposure, so wind-rated shingles and corrosion-resistant flashing are generally recommended over standard inland materials.',
    },
    {
      question: 'Are Delaware roofing contractors typically statewide or local?',
      answer:
        'Given Delaware\'s small size, most established roofing contractors serve the entire state rather than a single city, so it\'s worth comparing quotes from providers even if they\'re not based in your immediate area.',
    },
  ],
  georgia: [
    {
      question: 'How does humidity affect roofing in Georgia?',
      answer:
        'Georgia\'s humid climate, especially in and around Atlanta, accelerates algae and moss growth on asphalt shingles. Algae-resistant shingle coatings are a common upgrade recommendation, particularly on homes with significant tree cover.',
    },
    {
      question: 'Is hail a concern for Georgia roofs?',
      answer:
        'Northern Georgia sees periodic hail activity alongside seasonal thunderstorms, making storm damage assessment a regular part of the roofing work done in that part of the state.',
    },
  ],
  hawaii: [
    {
      question: 'Why don\'t Hawaii homes commonly use asphalt shingles?',
      answer:
        'Standard asphalt shingles tend to underperform in Hawaii\'s combination of high humidity, salt air, and occasional hurricane exposure. Metal and tile roofing are more common because they hold up better in those conditions.',
    },
    {
      question: 'Why does roofing cost more in Hawaii than the mainland?',
      answer:
        'Most roofing materials have to be shipped to the islands, which adds meaningfully to project costs compared to mainland pricing. Getting multiple quotes and confirming exact materials used is especially worthwhile in Hawaii.',
    },
  ],
  idaho: [
    {
      question: 'Does Idaho roofing differ between the north and the Boise area?',
      answer:
        'Yes. Northern Idaho deals with heavier mountain snow loads, while the Boise valley has more moderate, drier conditions closer to a standard residential roofing climate.',
    },
    {
      question: 'Do higher-elevation Idaho homes need special snow load ratings?',
      answer:
        'Homes at higher elevations should confirm their roof meets local snow load requirements, along with proper ice-and-water shield installation, since these matter far more there than in the valley floor.',
    },
  ],
  illinois: [
    {
      question: 'Do Chicago buildings need different roofing expertise than the rest of Illinois?',
      answer:
        'Yes. Chicago\'s dense housing stock includes a large share of flat and low-slope roofs, which require contractors experienced with EPDM or TPO systems rather than standard pitched asphalt shingle installation.',
    },
    {
      question: 'How common is hail damage in Illinois?',
      answer:
        'Illinois sees periodic severe thunderstorm and hail activity, particularly in the spring and summer, which supports a fairly active insurance-claim and storm-restoration segment of the local roofing industry.',
    },
  ],
  indiana: [
    {
      question: 'Should I file an insurance claim after hail damage in Indiana?',
      answer:
        'It\'s worth getting an inspection after any significant hail event, since bruising can void a shingle warranty even without visible damage. Many Indiana contractors are experienced specifically with insurance claim documentation.',
    },
    {
      question: 'What roofing issues are most common in Indiana?',
      answer:
        'A mix of hail-driven storm damage and standard age-related wear are the most common reasons Indiana homeowners replace a roof, with spring and summer storms being the peak season for storm-related work.',
    },
  ],
  iowa: [
    {
      question: 'Why does Iowa see so much hail-related roofing work?',
      answer:
        'Iowa sits within Tornado Alley and experiences frequent hail, which has made storm damage assessment and full roof replacement a significant part of the state\'s roofing industry.',
    },
    {
      question: 'How long do I have to file a hail damage claim in Iowa?',
      answer:
        'Most insurers require a claim to be filed within a specific window after a storm, so it\'s worth keeping records of storm dates in your area and scheduling an inspection promptly after any significant hail event.',
    },
  ],
  kansas: [
    {
      question: 'Why is Kansas known for hail damage to roofs?',
      answer:
        'Kansas has one of the highest hail frequencies in the country, which is why so many local contractors specialize specifically in impact-resistant shingle installation and large-scale insurance restoration work.',
    },
    {
      question: 'Do Class 4 impact-resistant shingles make sense in Kansas?',
      answer:
        'For most of the state, yes. Many Kansas insurers offer meaningful premium discounts for installing Class 4 impact-resistant shingles given how often hail causes roof damage there.',
    },
  ],
  kentucky: [
    {
      question: 'What roofing issues are common in Louisville versus rural Kentucky?',
      answer:
        'Older Louisville neighborhoods often need a structural inspection before replacement due to aging decking, while more rural parts of the state see a mix of severe spring storm damage and standard age-related wear.',
    },
    {
      question: 'Is spring storm damage a big factor for Kentucky roofs?',
      answer:
        'Yes, Kentucky sees significant spring storm activity that can cause hail and wind damage, making storm inspection and insurance claim work a regular part of the local roofing industry.',
    },
  ],
  louisiana: [
    {
      question: 'How does hurricane risk affect Louisiana roofing choices?',
      answer:
        'Wind-rated materials and proper flashing are central to Louisiana roofing given the state\'s hurricane exposure, and rapid storm-response repair capacity is a major factor when comparing local contractors.',
    },
    {
      question: 'How do I avoid storm-chasing scams after a Louisiana hurricane?',
      answer:
        'Be cautious of out-of-state crews that appear immediately after a storm. Always verify Louisiana state licensing before signing a repair contract, especially in the weeks following major hurricane damage.',
    },
  ],
  maine: [
    {
      question: 'Why is metal roofing popular in Maine?',
      answer:
        'Metal roofing sheds heavy snow more effectively than asphalt shingles, which is a significant advantage given Maine\'s snow loads and coastal wind exposure.',
    },
    {
      question: 'How do I prevent recurring ice dams in Maine?',
      answer:
        'Ice dam prevention generally comes down to attic ventilation and insulation upgrades rather than just replacing shingles. Ask contractors to assess ice-and-water shield coverage as part of any roofing quote.',
    },
  ],
  maryland: [
    {
      question: 'Do Baltimore rowhomes need specialized roofing contractors?',
      answer:
        'Yes. Many Baltimore-area rowhomes have flat or low-slope roofs, which require different expertise than standard pitched residential roofing — confirm a contractor has specific experience with that roof style.',
    },
    {
      question: 'Is wind damage a concern for Maryland roofs?',
      answer:
        'Coastal and suburban Maryland properties can see meaningful storm and wind exposure, particularly during hurricane season, making wind-rated materials a common recommendation outside of Baltimore\'s dense rowhome market.',
    },
  ],
  massachusetts: [
    {
      question: 'Are there restrictions on roofing materials in historic Massachusetts neighborhoods?',
      answer:
        'In historic districts, including parts of Boston, local preservation guidelines can restrict material choices. It\'s worth checking with your municipality before finalizing a roofing plan on a historic property.',
    },
    {
      question: 'How does coastal weather affect Massachusetts roofing?',
      answer:
        'Coastal Massachusetts properties face nor\'easter wind and snow exposure that inland areas don\'t see as severely, which is why many coastal contractors emphasize wind-rated shingle installation.',
    },
  ],
  michigan: [
    {
      question: 'Does lake-effect snow change roofing requirements in Michigan?',
      answer:
        'Areas near the Great Lakes can see snow load significantly higher than standard regional estimates due to lake-effect snow, so it\'s worth confirming your roof\'s snow load capacity specifically for your location.',
    },
    {
      question: 'What causes most roof damage in Michigan?',
      answer:
        'A combination of freeze-thaw cycles, ice damming, and periodic hail are the most common causes of roof damage across Michigan, with ice dam prevention being a particularly frequent homeowner concern.',
    },
  ],
  mississippi: [
    {
      question: 'Should Gulf Coast Mississippi homes get a wind mitigation inspection?',
      answer:
        'Yes — a wind mitigation inspection can identify upgrades that reduce homeowners insurance premiums, which is especially relevant for coastal Mississippi properties facing regular hurricane exposure.',
    },
    {
      question: 'Is tornado damage common inland in Mississippi?',
      answer:
        'Inland Mississippi sees significant severe thunderstorm and tornado activity, which makes wind-rated roofing materials a common recommendation even away from the immediate coast.',
    },
  ],
  missouri: [
    {
      question: 'Why do so many Missouri roofing contractors specialize in storm restoration?',
      answer:
        'Missouri sits within a high-hail-frequency zone, particularly around St. Louis and Kansas City, which has made storm damage assessment and insurance-claim-related replacement a core part of the local industry.',
    },
    {
      question: 'How do I know if recent weather damaged my Missouri roof?',
      answer:
        'If you\'re unsure whether a recent storm caused damage, ask a contractor for local storm history data for your address — most established Missouri roofers track this given how frequently hail affects the state.',
    },
  ],
  montana: [
    {
      question: 'What roofing materials work best in Montana?',
      answer:
        'Metal roofing is common in rural and mountainous parts of Montana due to its snow-shedding properties and durability against heavy wind exposure, both common in the state.',
    },
    {
      question: 'Do Montana snow load requirements vary by region?',
      answer:
        'Yes — requirements can differ significantly across the state depending on elevation and typical snowfall. Confirm your roof meets local building code for your specific area rather than a statewide average.',
    },
  ],
  nebraska: [
    {
      question: 'Is hail damage common in Nebraska?',
      answer:
        'Nebraska experiences frequent severe thunderstorms and hail, which supports a fairly active storm-restoration and insurance-claim segment within the state\'s roofing industry.',
    },
    {
      question: 'Should I document roof damage even if I\'m not filing a claim yet?',
      answer:
        'Yes — requesting a written inspection report after a hail event can support a future claim if damage worsens over time, even if you don\'t plan to file immediately.',
    },
  ],
  nevada: [
    {
      question: 'Does a cool roof coating help in Las Vegas or Reno?',
      answer:
        'Reflective "cool roof" coatings can meaningfully reduce indoor temperatures and cooling costs in Nevada\'s hot, dry climate, making them a popular upgrade in the Las Vegas area specifically.',
    },
    {
      question: 'Why is tile roofing common in Nevada?',
      answer:
        'Tile handles Nevada\'s intense desert heat and UV exposure better than standard asphalt shingles, which is why it\'s a frequent choice in the Las Vegas region.',
    },
  ],
  'new-hampshire': [
    {
      question: 'Why are ice dams such a common concern in New Hampshire?',
      answer:
        'New Hampshire\'s heavy winter snow and cold temperatures create ideal conditions for ice dams to form at the eaves. Poor attic ventilation is a leading contributing factor, which is why contractors often recommend addressing insulation alongside shingle replacement.',
    },
    {
      question: 'What roofing upgrades help prevent ice dams in New Hampshire?',
      answer:
        'Improved attic insulation and ventilation, along with ice-and-water shield membranes along the eaves, are the standard combination New Hampshire contractors recommend to reduce ice dam risk.',
    },
  ],
  'new-jersey': [
    {
      question: 'Do shore-area New Jersey homes need different roofing than inland suburbs?',
      answer:
        'Yes. Properties near the Jersey Shore face higher wind and storm exposure than inland suburban areas near New York City, so wind-rated shingles and salt-air-resistant flashing are commonly recommended for coastal homes.',
    },
    {
      question: 'Is roofing more expensive near New York City in New Jersey?',
      answer:
        'Labor rates in dense suburban areas closer to New York City can run higher than in more rural parts of the state, so it\'s worth comparing quotes from a few contractors regardless of location.',
    },
  ],
  'new-mexico': [
    {
      question: 'Why is flat or low-slope roofing common in New Mexico?',
      answer:
        'Much of New Mexico\'s residential construction, particularly adobe-style homes, uses flat or low-slope roofing rather than standard pitched asphalt roofs, which requires different contractor expertise.',
    },
    {
      question: 'What roofing issues does New Mexico\'s dry climate cause?',
      answer:
        'New Mexico\'s low humidity and intense sun exposure put more strain on roofing materials from UV degradation than from moisture, unlike most other states.',
    },
  ],
  'new-york': [
    {
      question: 'Does roofing in New York City require special permitting?',
      answer:
        'Yes — New York City roofing projects often involve co-op or condo board approval and specific city permitting that differs from suburban or upstate jobs, so confirm a contractor has direct experience with that process.',
    },
    {
      question: 'How does roofing differ between NYC and upstate New York?',
      answer:
        'New York City\'s dense housing stock includes many flat-roof buildings requiring specialized commercial expertise, while upstate New York deals more with heavy snow load residential roofing.',
    },
  ],
  'north-carolina': [
    {
      question: 'Should coastal North Carolina homeowners get a wind mitigation inspection?',
      answer:
        'Yes — a wind mitigation inspection can identify features that reduce homeowners insurance premiums, which is particularly relevant for coastal North Carolina properties facing regular hurricane exposure.',
    },
    {
      question: 'Is hail damage a concern inland in North Carolina?',
      answer:
        'Inland North Carolina sees more hail and severe thunderstorm activity than the immediate coast, making storm damage assessment a regular part of roofing work away from the shoreline.',
    },
  ],
  'north-dakota': [
    {
      question: 'Why do North Dakota roofs need wind-rated installation?',
      answer:
        'North Dakota\'s sustained prairie winds can exceed what standard nailing patterns are designed to handle, which is why wind-rated shingle installation is commonly recommended over standard specifications.',
    },
    {
      question: 'Is metal roofing common in North Dakota?',
      answer:
        'Metal roofing and reinforced shingle systems are popular in North Dakota due to the combination of extreme cold, heavy snow, and strong sustained winds the state regularly experiences.',
    },
  ],
  ohio: [
    {
      question: 'How do freeze-thaw cycles affect Ohio roofs?',
      answer:
        'Ohio\'s freeze-thaw cycles put extra strain on shingles and flashing over time, which is why proper attic ventilation is commonly recommended as part of any roofing quote to help extend shingle lifespan.',
    },
    {
      question: 'Is hail damage common in Ohio?',
      answer:
        'Ohio sees seasonal hail activity alongside general humidity-related wear, making both storm damage assessment and standard age-related replacement common reasons for roof work statewide.',
    },
  ],
  oklahoma: [
    {
      question: 'Why does Oklahoma see so much roofing insurance claim work?',
      answer:
        'Oklahoma is part of Tornado Alley and experiences some of the most frequent hail and severe wind events in the country, making storm restoration and insurance claims a central part of the local roofing industry.',
    },
    {
      question: 'Are impact-resistant shingles worth it in Oklahoma?',
      answer:
        'Given how frequently Oklahoma experiences hail, many insurers offer premium discounts for Class 4 impact-resistant shingles, making them a common upgrade recommendation statewide.',
    },
  ],
  oregon: [
    {
      question: 'Why is moss growth such a common issue on Oregon roofs?',
      answer:
        'Oregon\'s sustained rainfall, especially west of the Cascades, creates ideal conditions for moss and algae growth on shingles, which is why moss-resistant treatments are a frequent recommendation.',
    },
    {
      question: 'Does eastern Oregon have different roofing needs than the west side?',
      answer:
        'Yes. The drier eastern side of the state has more in common with inland climates, while the wetter west side focuses much more heavily on moisture management and moss prevention.',
    },
  ],
  pennsylvania: [
    {
      question: 'Do older Philadelphia and Pittsburgh homes need extra inspection before roofing?',
      answer:
        'Many older homes in Philadelphia and Pittsburgh benefit from a structural inspection before replacement, since aging decking sometimes needs repair before new shingles can be properly installed.',
    },
    {
      question: 'Does rural Pennsylvania need higher snow load roofing than the cities?',
      answer:
        'More rural and mountainous parts of Pennsylvania generally require higher snow load capacity than the state\'s urban centers, so local snow data is worth confirming with your contractor.',
    },
  ],
  'rhode-island': [
    {
      question: 'Do Rhode Island coastal homes need special roofing materials?',
      answer:
        'Properties near Narragansett Bay benefit from wind-rated shingles and salt-air-resistant flashing, which last longer under coastal exposure than standard materials used further inland.',
    },
    {
      question: 'Is roofing similar across Rhode Island given its small size?',
      answer:
        'Most Rhode Island contractors serve the whole state given its compact size, though coastal properties do warrant different material considerations than inland ones.',
    },
  ],
  'south-carolina': [
    {
      question: 'Should coastal South Carolina homes get wind-rated roofing?',
      answer:
        'Yes — coastal South Carolina properties face regular hurricane exposure, and wind-rated materials combined with a wind mitigation inspection can also help reduce homeowners insurance premiums.',
    },
    {
      question: 'Does inland South Carolina have different roofing needs than the coast?',
      answer:
        'Inland areas deal more with humid, storm-prone conditions and general wear than direct hurricane wind exposure, though wind-rated materials are still commonly recommended statewide.',
    },
  ],
  'south-dakota': [
    {
      question: 'Is hail damage common in South Dakota?',
      answer:
        'Yes — South Dakota deals with a combination of heavy snow, hail, and strong prairie winds, which is why many local contractors are experienced with both storm restoration and reinforced shingle systems.',
    },
    {
      question: 'How quickly should I get an inspection after hail in South Dakota?',
      answer:
        'Promptly — South Dakota insurers typically require documented damage within a set window after a storm, so a written inspection report soon after a hail event helps preserve your claim options.',
    },
  ],
  tennessee: [
    {
      question: 'How does spring weather affect Tennessee roofs?',
      answer:
        'Tennessee sees significant severe spring storm activity across both urban areas like Nashville and Memphis and more rural parts of the state, making storm inspection a regular seasonal concern.',
    },
    {
      question: 'Should I get a roof inspection even without visible storm damage in Tennessee?',
      answer:
        'Yes — hail bruising can shorten shingle life without being obvious from the ground, so an inspection after any significant spring storm is worthwhile even if nothing looks wrong.',
    },
  ],
  utah: [
    {
      question: 'Do Utah mountain homes need different roofing than the Salt Lake valley?',
      answer:
        'Yes — homes near the mountains typically need higher snow load capacity than properties in the Salt Lake valley, where intense sun exposure is a bigger factor than snow.',
    },
    {
      question: 'What roofing materials work best in Utah?',
      answer:
        'Material choice in Utah depends heavily on elevation — reinforced systems for snow load in the mountains, versus more standard residential materials suited to the drier valley climate.',
    },
  ],
  vermont: [
    {
      question: 'Why is standing seam metal roofing popular in Vermont?',
      answer:
        'Standing seam metal roofing sheds heavy snow effectively, which is a major advantage given Vermont\'s long, snow-heavy winters — it\'s a common upgrade when replacing an aging asphalt roof.',
    },
    {
      question: 'Does Vermont need special roofing for ice dam prevention?',
      answer:
        'Yes — given Vermont\'s snow load and cold winters, most contractors focus heavily on snow load capacity and ice dam prevention as core parts of any roofing recommendation.',
    },
  ],
  virginia: [
    {
      question: 'Do coastal Virginia homes need different roofing than the Blue Ridge region?',
      answer:
        'Yes — properties near Virginia Beach and Norfolk face hurricane and coastal wind exposure, while areas further inland toward Richmond and the Blue Ridge deal more with standard storm and humidity-related wear.',
    },
    {
      question: 'Can a wind mitigation inspection lower insurance costs in Virginia?',
      answer:
        'For coastal Virginia homeowners specifically, a wind mitigation inspection can identify upgrades — like wind-rated shingles — that may reduce homeowners insurance premiums.',
    },
  ],
  washington: [
    {
      question: 'Why does moss growth affect roofs so much in western Washington?',
      answer:
        'The sustained rainfall on the west side of the Cascades creates ideal conditions for moss growth on shingles, which is why moss-resistant treatments and proper attic ventilation are common recommendations there.',
    },
    {
      question: 'Is eastern Washington roofing different from the west side?',
      answer:
        'Yes — eastern Washington\'s drier climate has more in common with inland states, while the wetter west side focuses much more on moisture management and moss prevention.',
    },
  ],
  'west-virginia': [
    {
      question: 'Do higher-elevation West Virginia homes need different roofing?',
      answer:
        'Yes — homes at higher elevations in West Virginia\'s mountainous terrain typically need higher snow load capacity than properties in the valleys, and requirements can vary noticeably even over short distances.',
    },
    {
      question: 'What roofing issues are most common in West Virginia?',
      answer:
        'A mix of heavy snow at higher elevations and more standard humidity-related wear in the valleys are the most common factors driving roof replacement across the state.',
    },
  ],
  wisconsin: [
    {
      question: 'How do Wisconsin winters affect roofing recommendations?',
      answer:
        'Heavy snow loads, ice damming, and freeze-thaw cycles make proper attic ventilation and insulation a common focus alongside standard shingle replacement in Wisconsin.',
    },
    {
      question: 'Should I add ice-and-water shield when replacing a Wisconsin roof?',
      answer:
        'Yes — ice-and-water shield coverage along eaves and valleys is a standard defense against ice dams in Wisconsin\'s winter climate and is commonly included in replacement quotes.',
    },
  ],
  wyoming: [
    {
      question: 'Why does Wyoming need wind-rated roofing installation?',
      answer:
        'Wyoming\'s strong sustained winds can exceed standard residential nailing specifications, which is why wind-rated shingle installation is commonly recommended over standard methods.',
    },
    {
      question: 'What roofing materials handle Wyoming\'s climate best?',
      answer:
        'Reinforced shingle systems and wind-rated installation methods are common in Wyoming given the combination of strong winds, heavy snow, and significant temperature swings the state experiences.',
    },
  ],
  florida: [
    {
      question: 'Do roofing contractors in Florida need to be licensed?',
      answer:
        'Yes. Florida requires roofing contractors to hold a state-issued license through the DBPR, and after major storms the state has cracked down on unlicensed "storm chasers." Always confirm a contractor\'s license number before signing a contract.',
    },
    {
      question: 'What roofing materials hold up best against hurricanes?',
      answer:
        'Wind-rated asphalt shingles, concrete tile, and metal roofing with proper wind-rated fastening are the most common choices in Florida. Many insurers also offer premium discounts for roofs that pass a wind mitigation inspection.',
    },
  ],
  texas: [
    {
      question: 'Why is hail damage such a common roofing issue in Texas?',
      answer:
        'Much of Texas, particularly the north and central regions, sits in a high-frequency hail corridor. This has made storm damage assessment and insurance-claim-related roof replacement one of the most common services Texas roofing contractors provide.',
    },
    {
      question: 'Are impact-resistant shingles worth it in Texas?',
      answer:
        'For most of the state, yes. Class 4 impact-resistant shingles cost more upfront but many Texas insurers offer meaningful premium discounts for installing them, given how frequently hail causes roof damage statewide.',
    },
  ],
  colorado: [
    {
      question: 'How common is hail damage to roofs in Colorado?',
      answer:
        'Colorado, especially along the Front Range, has one of the highest hail-damage rates in the country. This is why a large share of Colorado roofing contractors specialize specifically in storm restoration and insurance claim documentation.',
    },
  ],
  california: [
    {
      question: 'Do California roofs need to be fire-rated?',
      answer:
        'In wildfire-risk zones, many insurers and some local codes require a Class A fire-rated roofing system. Requirements vary by county and proximity to wildland areas, so it\'s worth confirming with a local contractor before choosing materials.',
    },
  ],
  minnesota: [
    {
      question: 'What causes ice dams and how are they prevented in Minnesota?',
      answer:
        'Ice dams form when heat escaping through the attic melts snow on the roof, which then refreezes at the colder eaves. Minnesota contractors typically address this with improved attic insulation, ventilation, and ice-and-water shield membranes along the eaves.',
    },
  ],
}

// Generic fallback questions that apply reasonably well to any state, used
// to top up states without dedicated entries above.
export const genericFaqs = (stateName: string): StateFaq[] => [
  {
    question: `How much does a roof replacement cost in ${stateName}?`,
    answer: `Roof replacement costs in ${stateName} vary based on roof size, pitch, material, and local labor rates. Getting quotes from two or three contractors is the most reliable way to understand current pricing in your specific area.`,
  },
  {
    question: `How do I know if a roofing contractor in ${stateName} is legitimate?`,
    answer: `Look for verifiable licensing and insurance, a physical business address, and reviews that go back further than a few months. Be cautious of contractors who only appear after a major storm and pressure you to sign quickly.`,
  },
  {
    question: `How long does a typical roof replacement take?`,
    answer: `Most residential roof replacements take one to three days depending on roof size and weather conditions, though larger homes or complex roof lines can take longer.`,
  },
]

// Merge helper: state-specific entries first, topped up with generic ones,
// capped at a max count so the block doesn't get unwieldy on data-rich states.
export function getFaqsForState(stateSlug: string, stateName: string, max = 4): StateFaq[] {
  const specific = stateFaqs[stateSlug] ?? []
  const generic = genericFaqs(stateName)
  const combined = [...specific, ...generic]
  return combined.slice(0, max)
}