/**
 * Flight Cancellation Response Decision Tree
 * Each node: id, title, prompt?, type (choice|info|actions), options?|steps?, next?, continueLabel?, breadcrumb?
 */
const FLOW = {
  start: {
    id: "start",
    title: "Flight Cancelled or Suspected Cancellation",
    prompt:
      "Use this guide to determine your next actions after a cancellation or suspected cancellation.",
    type: "info",
    continueLabel: "Begin",
    next: "verifyCancellation",
    breadcrumb: "Start",
  },

  verifyCancellation: {
    id: "verifyCancellation",
    title: "Verify Cancellation",
    prompt: "Confirm the cancellation in both systems before proceeding.",
    type: "info",
    steps: [
      {
        text: "Verify cancellation on the Cancel Flight Report on Endeavor Air Net",
        image: "images/cancel-flight-report.jpg",
        imageAlt: "Cancel Flight Report on Endeavor Air Net",
      },
      "Verify cancellation on Delta.com",
    ],
    continueLabel: "Continue",
    next: "reportStatus",
    breadcrumb: "Verify",
  },

  reportStatus: {
    id: "reportStatus",
    title: "Cancellation Report Status",
    prompt: "What is the cancellation report status?",
    type: "choice",
    options: [
      { label: "Pending", next: "waitProcessed" },
      { label: "Processed", next: "checkAssignment" },
    ],
    breadcrumb: "Status",
  },

  waitProcessed: {
    id: "waitProcessed",
    title: "Wait Until Processed",
    prompt: "Do not proceed until the report status updates.",
    type: "info",
    steps: [
      "Wait until status shows Processed",
    ],
    continueLabel: "Status is Processed",
    next: "checkAssignment",
    breadcrumb: "Status",
  },

  checkAssignment: {
    id: "checkAssignment",
    title: "Check for New Assignment",
    prompt: "Open CrewTrac and check for a new assignment.",
    type: "info",
    steps: [
      "If no new assignment in 60 minutes, call or email Crew Services.",
    ],
    continueLabel: "I have an assignment",
    next: "assignmentType",
    breadcrumb: "Assignment",
  },

  assignmentType: {
    id: "assignmentType",
    title: "New Assignment Type",
    prompt: "What assignment type is shown in CrewTrac?",
    type: "choice",
    options: [
      { label: "Flying Replaced", next: "flyingContactable" },
      { label: "Released to Rest", next: "hotelAssigned" },
      { label: "Reserve Assignment", next: "reserveLocation" },
      { label: "Time Available (Line Holder)", next: "lhtaLocation" },
    ],
    breadcrumb: "Assignment",
  },

  // --- Flying Replaced ---
  flyingContactable: {
    id: "flyingContactable",
    title: "Flying Replaced",
    prompt: "Are you contactable?",
    type: "choice",
    examples: [
      "Are you on Home Reserve?",
      "Are you on Airport Reserve?",
      "Are you Time Available (AVL)?",
      "Did a manager meet you or was an ACARS message sent?",
    ],
    options: [
      { label: "Yes — I am contactable", next: "acceptAssignment" },
      { label: "No — not contactable", next: "waitContactable" },
    ],
    breadcrumb: "Flying",
  },

  acceptAssignment: {
    id: "acceptAssignment",
    title: "Accept Assignment",
    type: "actions",
    steps: [
      "Accept assignment via CrewTrac or by calling Crew Scheduling",
      "Proceed to the gate",
    ],
    breadcrumb: "Flying",
  },

  waitContactable: {
    id: "waitContactable",
    title: "Wait Until Contactable",
    type: "actions",
    steps: [
      "Wait until you become contactable",
      "You may voluntarily accept an assignment if desired",
    ],
    breadcrumb: "Flying",
  },

  // --- Released to Rest ---
  hotelAssigned: {
    id: "hotelAssigned",
    title: "Released to Rest",
    prompt: "Was a hotel assigned in API?",
    type: "choice",
    options: [
      { label: "Yes — hotel assigned", next: "beginRest" },
      { label: "No — no hotel yet", next: "monitorHotel" },
    ],
    breadcrumb: "Rest",
  },

  beginRest: {
    id: "beginRest",
    title: "Begin Rest",
    type: "actions",
    steps: ["Begin 10-hour rest from the time you were released"],
    emphasis: ["10-hour rest"],
    breadcrumb: "Rest",
  },

  monitorHotel: {
    id: "monitorHotel",
    title: "No Hotel Assigned Yet",
    type: "info",
    steps: [
      "Monitor API for a hotel assignment",
      "Contact Crew Scheduling if no hotel is assigned within 30 minutes",
    ],
    emphasis: ["within 30 minutes"],
    continueLabel: "Hotel has been assigned",
    next: "restFromHotelQuestion",
    breadcrumb: "Rest",
  },

  restFromHotelQuestion: {
    id: "restFromHotelQuestion",
    title: "Rest After Hotel Assignment",
    prompt: "Do you have 10 hours of rest from the hotel being assigned?",
    type: "choice",
    options: [
      { label: "Yes", next: "proceedToHotel" },
      { label: "No", next: "noRestCallCS" },
    ],
    breadcrumb: "Rest",
  },

  proceedToHotel: {
    id: "proceedToHotel",
    title: "Proceed to Hotel",
    type: "actions",
    steps: ["Proceed to hotel"],
    breadcrumb: "Rest",
  },

  noRestCallCS: {
    id: "noRestCallCS",
    title: "Contact Crew Services",
    type: "actions",
    steps: [
      "Call Crew Services to establish a new rest period",
      "If long wait time: send email to Crew Services to start 10-hour rest from hotel notification time",
    ],
    emphasis: ["10-hour rest", "hotel notification time"],
    breadcrumb: "Rest",
  },

  // --- Reserve Assignment (shared) ---
  reserveLocation: {
    id: "reserveLocation",
    title: "Reserve Assignment",
    prompt: "What is new Reserve Assignment",
    type: "choice",
    options: [
      { label: "Home Reserve", next: "homeReserve" },
      { label: "Airport Reserve", next: "airportReserve" },
    ],
    breadcrumb: "Reserve",
  },

  homeReserve: {
    id: "homeReserve",
    title: "Home Reserve",
    type: "actions",
    steps: [
      "Remain at home",
      "Return to Home Reserve status",
      "Callout time applies",
    ],
    emphasis: ["Callout time applies"],
    breadcrumb: "Reserve",
  },

  airportReserve: {
    id: "airportReserve",
    title: "Airport Reserve",
    type: "actions",
    steps: [
      "Remain at the airport until Airport Reserve ends, or",
      "Remain at the airport until you are released to rest",
    ],
    breadcrumb: "Reserve",
  },

  hotelReserve: {
    id: "hotelReserve",
    title: "Hotel Reserve",
    type: "actions",
    steps: [
      "Remain at the hotel",
      "If contactable, remain contactable until the assignment ends or you are released to rest",
      "If called by Crew Scheduling: proceed to the airport ASAP",
    ],
    emphasis: ["proceed to the airport ASAP"],
    breadcrumb: "Reserve",
  },

  // --- Line Holder Time Available ---
  lhtaLocation: {
    id: "lhtaLocation",
    title: "Line Holder Time Available",
    prompt: "What is your current location status?",
    type: "choice",
    options: [
      { label: "Home", next: "lhtaHome" },
      { label: "Hotel", next: "lhtaHotel" },
      { label: "Airport", next: "lhtaAirportBase" },
    ],
    breadcrumb: "LHTA",
  },

  lhtaHome: {
    id: "lhtaHome",
    title: "Time Available — Home",
    type: "actions",
    steps: [
      "Remain at home",
      "Answer if Crew Scheduling calls during Time Available",
      "Callout time applies",
    ],
    emphasis: ["Callout time applies"],
    breadcrumb: "LHTA",
  },

  lhtaHotel: {
    id: "lhtaHotel",
    title: "Time Available — Hotel",
    type: "actions",
    steps: [
      "Remain at the hotel",
      "Answer if Crew Scheduling calls during Time Available",
      "Proceed to the airport ASAP if contacted",
    ],
    emphasis: ["Proceed to the airport ASAP"],
    breadcrumb: "LHTA",
  },

  lhtaAirportBase: {
    id: "lhtaAirportBase",
    title: "Time Available — Airport",
    prompt: "Are you in base or at an outstation?",
    type: "choice",
    options: [
      { label: "In Base", next: "lhtaInBase" },
      { label: "Outstation", next: "lhtaOutstation" },
    ],
    breadcrumb: "LHTA",
  },

  lhtaInBase: {
    id: "lhtaInBase",
    title: "Airport — In Base",
    type: "actions",
    steps: [
      "Call Crew Scheduling",
      "Remain at the airport for 120 minutes",
      "Revert to Home status for the remainder of Time Available",
    ],
    emphasis: ["120 minutes"],
    breadcrumb: "LHTA",
  },

  lhtaOutstation: {
    id: "lhtaOutstation",
    title: "Airport — Outstation",
    type: "actions",
    steps: [
      "Call Crew Scheduling",
      "Remain at the airport for 120 minutes",
      "Proceed to hotel",
      "Revert to Hotel status for the remainder of Time Available",
    ],
    emphasis: ["120 minutes"],
    breadcrumb: "LHTA",
  },
};
