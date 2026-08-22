// lib/serviceGuides.ts

export interface ServiceGuide {
  title: string
  summary: string
  introduction: string
  warningSigns: string[]
  typicalWork: string[]
  contractorQuestions: string[]
  considerations: string[]
  nextStep: string
}

export const serviceGuides: Record<string, ServiceGuide> = {
  'emergency-roof-repair': {
    title: 'Emergency Roof Repair Guide',
    summary:
      'Understand what to do when roof damage requires urgent attention and what to confirm before authorizing emergency work.',
    introduction:
      'Emergency roof repair focuses on stopping immediate water entry, protecting exposed areas and preventing damage from becoming worse. Temporary stabilization may be completed first, followed by a permanent repair after weather conditions improve and the full extent of the damage can be inspected.',
    warningSigns: [
      'Water entering through the ceiling or running down walls',
      'Roofing material removed by strong wind',
      'A fallen branch or other object striking the roof',
      'A visible opening or exposed roof decking',
      'A ceiling that is sagging or holding water',
      'Damage affecting electrical fixtures or wiring',
    ],
    typicalWork: [
      'Assessing the affected area from a safe location',
      'Installing temporary weather protection where conditions allow',
      'Removing loose material that presents an immediate hazard',
      'Documenting visible damage for the property owner',
      'Identifying the permanent repair required',
      'Scheduling follow-up work after the roof is stable and dry',
    ],
    contractorQuestions: [
      'Is this a temporary stabilization or a permanent repair?',
      'What immediate work is included in the quoted call-out charge?',
      'Can you provide photographs of the affected area?',
      'When can a complete inspection be performed?',
      'Will temporary work be credited toward the permanent repair?',
      'What should remain untouched until an insurer inspects it?',
    ],
    considerations: [
      'Do not climb onto a wet, storm-damaged or structurally uncertain roof.',
      'Keep away from sagging ceilings and areas where water is near electrical fixtures.',
      'Photograph visible interior damage from a safe position.',
      'Ask for the emergency scope and price in writing before work begins.',
      'Treat unsolicited storm-response offers cautiously and verify the business independently.',
    ],
    nextStep:
      'Browse contractors in your state and ask each business directly whether emergency response is currently available. RooferNet does not presently verify 24-hour availability for every listing.',
  },

  'roof-inspection': {
    title: 'Roof Inspection Guide',
    summary:
      'Learn what a roof inspection may cover, when an inspection is useful and what should appear in the resulting report.',
    introduction:
      'A roof inspection evaluates visible roofing components and looks for signs of deterioration, damage, moisture entry or installation problems. The exact scope varies, so property owners should confirm whether the inspection covers only the exterior roof surface or also includes flashing, drainage, ventilation, attic areas and supporting materials.',
    warningSigns: [
      'Missing, cracked, curled or displaced roofing material',
      'Water stains on ceilings or in attic areas',
      'Repeated leaks without a confirmed source',
      'Loose, damaged or corroded flashing',
      'Blocked or damaged roof drainage',
      'Visible sagging or uneven roof sections',
    ],
    typicalWork: [
      'Reviewing accessible roof surfaces and penetrations',
      'Checking flashing around chimneys, vents and walls',
      'Examining valleys, edges and drainage points',
      'Looking for moisture entry or damaged decking where visible',
      'Assessing age-related wear and previous repairs',
      'Preparing findings, photographs and recommended next steps',
    ],
    contractorQuestions: [
      'Which roof components are included in the inspection?',
      'Will I receive photographs and a written report?',
      'Does the inspection include accessible attic areas?',
      'Will repair priorities be separated into urgent and future work?',
      'Is the inspection fee credited toward later repairs?',
      'Do you inspect this particular roofing material regularly?',
    ],
    considerations: [
      'A sales estimate and an independent inspection are not always the same service.',
      'Ask whether inaccessible areas will be identified in the report.',
      'Inspection findings should distinguish observed damage from assumptions.',
      'A report should explain why work is recommended, not merely list a price.',
      'Major structural concerns may require a qualified engineer rather than only a roofing contractor.',
    ],
    nextStep:
      'Use the state directory to compare local roofing businesses, then confirm whether they provide written inspections and what their inspection includes.',
  },

  'roof-leak-repair': {
    title: 'Roof Leak Repair Guide',
    summary:
      'Learn how roof leaks are investigated, why the visible stain may not identify the source and what a repair estimate should explain.',
    introduction:
      'Roof leak repair begins with identifying how water is entering the roof system. Water can travel along decking, framing or other materials before appearing indoors, so the source may be some distance from the visible ceiling stain. A useful estimate should identify the suspected entry point and explain the proposed repair.',
    warningSigns: [
      'New or expanding ceiling stains',
      'Damp insulation or moisture in the attic',
      'Water appearing during wind-driven rain',
      'Damage around vents, chimneys or skylights',
      'Cracked sealant or loose flashing',
      'Recurring moisture after an earlier repair',
    ],
    typicalWork: [
      'Inspecting the interior and exterior symptoms',
      'Tracing likely water-entry paths',
      'Checking flashing, penetrations, valleys and roof edges',
      'Removing damaged material where necessary',
      'Repairing the entry point and affected surrounding area',
      'Explaining whether moisture-damaged decking also needs attention',
    ],
    contractorQuestions: [
      'What do you believe is causing the leak?',
      'How will you confirm the suspected source?',
      'Which materials will be removed and replaced?',
      'Does the estimate include damaged decking if discovered?',
      'What workmanship warranty applies to the repair?',
      'What happens if water reappears in the same area?',
    ],
    considerations: [
      'A ceiling stain does not always sit directly below the roof opening.',
      'Repeatedly applying surface sealant may conceal rather than solve the underlying problem.',
      'Matching replacement material may be difficult on an older roof.',
      'Interior drying or mold-related work may require a separate provider.',
      'Ask the contractor to document conditions before and after the repair.',
    ],
    nextStep:
      'Browse roofing businesses by state and location, then describe when and where the leak appears so the contractor can determine the appropriate inspection.',
  },

  'roof-maintenance': {
    title: 'Roof Maintenance Guide',
    summary:
      'Understand routine roof maintenance, common preventable problems and how to establish a practical inspection schedule.',
    introduction:
      'Roof maintenance is intended to identify small problems before they develop into leaks or widespread material damage. Maintenance needs depend on roof type, age, nearby trees, drainage design and local weather. Safe professional inspections are generally more useful than relying only on what can be seen from the ground.',
    warningSigns: [
      'Debris collecting in valleys or drainage areas',
      'Loose flashing or deteriorated sealant',
      'Moss, algae or persistent organic growth',
      'Damaged gutters or downspouts',
      'Tree branches contacting or overhanging the roof',
      'Small areas of displaced or damaged material',
    ],
    typicalWork: [
      'Reviewing roof surfaces for visible deterioration',
      'Checking penetrations, flashing and sealant',
      'Clearing accessible drainage paths',
      'Identifying loose or damaged roofing material',
      'Reviewing gutters, downspouts and roof edges',
      'Documenting items that require repair or future monitoring',
    ],
    contractorQuestions: [
      'What maintenance is appropriate for my roof material?',
      'Which tasks are included in the maintenance visit?',
      'Will you provide photographs of identified concerns?',
      'How often should this roof be inspected?',
      'Which repairs are urgent and which can be monitored?',
      'Could any proposed treatment affect the material warranty?',
    ],
    considerations: [
      'Pressure washing can damage some roofing materials.',
      'Walking on a roof can cause damage and presents a fall risk.',
      'Maintenance does not restore material that has reached the end of its service life.',
      'Drainage and ventilation issues may require work beyond the roof surface.',
      'Keep dated inspection records, photographs and repair invoices.',
    ],
    nextStep:
      'Compare contractors in your area and ask whether they maintain your specific roof material and provide a written maintenance report.',
  },

  'roof-replacement': {
    title: 'Roof Replacement Guide',
    summary:
      'Learn what a complete roof replacement estimate should include and how to compare materials, warranties and project scope.',
    introduction:
      'Roof replacement removes or covers an existing roof system and installs new roofing materials. The appropriate approach depends on the condition of the existing material, decking, flashing, ventilation and local requirements. Estimates should be compared by scope and material specification—not only by total price.',
    warningSigns: [
      'Widespread cracking, curling or material loss',
      'Leaks occurring in several unrelated areas',
      'Extensive storm or impact damage',
      'Soft, deteriorated or damaged roof decking',
      'A roof approaching the expected service range of its material',
      'Repeated repairs that no longer provide a reliable result',
    ],
    typicalWork: [
      'Confirming measurements and the replacement scope',
      'Removing existing roofing where required',
      'Inspecting and replacing damaged decking',
      'Installing underlayment, flashing and roof-edge components',
      'Installing the selected roofing material',
      'Handling ventilation, cleanup and material disposal',
    ],
    contractorQuestions: [
      'Does the estimate include complete removal of the existing roof?',
      'How will damaged decking be priced if discovered?',
      'Which exact manufacturer and product line are included?',
      'Are flashing, ventilation and roof-edge components included?',
      'Who obtains required permits and handles inspections?',
      'What manufacturer and workmanship warranties apply?',
    ],
    considerations: [
      'Compare product names, grades and quantities across estimates.',
      'Clarify whether decking replacement is included or charged separately.',
      'Confirm cleanup, disposal and protection of surrounding property.',
      'Ask for the payment schedule and change-order process in writing.',
      'Verify applicable licensing, insurance and permit requirements before signing.',
    ],
    nextStep:
      'Browse contractors in your state and request comparable written estimates that identify materials, scope, exclusions, warranties and payment terms.',
  },
}

export function getServiceGuide(slug: string) {
  return serviceGuides[slug] || null
}