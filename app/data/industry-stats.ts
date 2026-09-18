export const industrySources = {
  homebase: {
    organization: "Homebase",
    title: "Restaurant Employee Turnover Rate: 2025 Statistics, Costs, and Retention Strategies",
    date: "October 29, 2025",
    methodology: "Homebase summary; some estimates originate from cited third-party restaurant industry research.",
    url: "https://www.joinhomebase.com/blog/restaurant-employee-turnover",
  },
  toast: {
    organization: "Toast",
    title: "How to Survive the Restaurant Industry Labor Shortage",
    date: "Employee survey conducted Feb. 27–Mar. 19, 2023",
    methodology: "Blinded online survey of 1,011 current restaurant employees.",
    url: "https://pos.toasttab.com/blog/on-the-line/how-to-handle-the-restaurant-industry-labor-shortage",
  },
} as const;

export const turnoverByRole = [{ role: "Front of House", value: 41 }, { role: "Back of House", value: 43 }, { role: "Managers", value: 28 }];
export const trainingPerception = [{ duration: "< 1 week", value: 45, label: "45%" }, { duration: "1–2 weeks", value: 69, label: "69%" }, { duration: "3+ weeks", value: 80, label: "80%+" }];
