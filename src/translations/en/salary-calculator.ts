/**
 * Salary Calculator tool module — every string that belongs to this one
 * tool, following the same shape as `./percentage-calculator.ts`. Merged
 * into its own site dictionary in `./index.ts`, never into another
 * tool's.
 *
 * Amounts, percentages and years are never written in here: they come
 * from the salary engine (`src/lib/salary`) and are filled into
 * `{placeholders}` by `interpolate()`, so they stay identical across
 * locales and change in one place when the law does.
 *
 * `seo` feeds the page's metadata, Open Graph and WebApplication JSON-LD;
 * `content.faq` is also the page's FAQPage JSON-LD, so the questions and
 * answers here are exactly what is shown on the page.
 */
export const salaryCalculator = {
  app: {
    title: "Salary Calculator",
    tagline: "See how much of your CTC reaches your bank account each month.",
    calculatorLabel: "Salary calculator",
  },

  calculator: {
    ctc: "Annual CTC",
    ctcHint: "Your yearly cost to company, as written on your offer letter.",
    ctcPlaceholder: "e.g. 12,00,000",
    ctcInLakhs: "= {lakhs} lakh a year",
    clear: "Clear",

    advanced: "More options",
    advancedHint: "Optional. Change these only if your offer letter says something different.",
    optional: "Optional",

    variablePay: "Variable pay",
    variablePayPercent: "Variable pay (% of CTC)",
    variablePayHint: "Bonus or performance pay that is part of your CTC.",
    variablePayPlaceholder: "e.g. 10",

    pfWagesPercent: "Basic + DA (% of fixed CTC)",
    pfWagesHint:
      "Your PF is worked out on Basic + DA. If your offer letter doesn't show it, {percent}% is a reasonable estimate.",

    pf: "Provident Fund (PF)",
    pfMode: "How is your PF worked out?",
    pfFull: "Full PF",
    pfFullHint: "{rate}% of your Basic + DA",
    pfCapped: "Capped PF",
    pfCappedHint: "{rate}% of Basic + DA, counting at most {ceiling} a month",
    pfNone: "No PF",
    pfNoneHint: "No PF is deducted",

    gratuity: "Gratuity",
    gratuityToggle: "My CTC includes gratuity",
    gratuityHint: "Gratuity is set aside for when you leave the job, so it is not paid each month.",

    professionalTax: "Professional tax (per year)",
    professionalTaxHint:
      "Charged by some states, up to {max} a year. Leave it at 0 if your state does not charge it.",
    professionalTaxPlaceholder: "e.g. 2,400",

    taxRegime: "Income tax",
    taxRegimeValue: "New tax regime, tax year {year}",
  },

  actions: {
    reset: "Reset",
    showBreakdown: "Show breakdown",
    hideBreakdown: "Hide breakdown",
    moreDetails: "More details",
    fewerDetails: "Fewer details",
  },

  result: {
    empty: "Enter your annual CTC to see your in-hand salary.",
    monthlyTakeHome: "Monthly in-hand salary",
    annualTakeHome: "Annual in-hand salary",
    monthlyGross: "Monthly gross salary",
    annualGross: "Annual gross salary",
    ctc: "CTC",
    takeHome: "Take-home",
    regularMonth: "Regular month",
    annualTotal: "Annual total",
    perMonth: "per month",
    perYear: "per year",
    afterDeductions: "After PF, professional tax and income tax.",
    plusVariable: "Plus {amount} variable pay in the year, if it is paid in full.",
    estimate: "Estimate",
  },

  breakdown: {
    heading: "Where your CTC goes",
    monthly: "Monthly",
    annual: "Yearly",
    ctc: "CTC",
    notPaidMonthly: "Part of CTC, not paid monthly",
    variablePay: "Variable pay",
    employerPf: "Employer's PF",
    gratuity: "Gratuity",
    grossSalary: "Gross salary",
    deductions: "Deductions",
    employeePf: "Your PF",
    professionalTax: "Professional tax",
    incomeTax: "Income tax (TDS)",
    takeHome: "Take-home (net salary)",
  },

  tax: {
    heading: "How your income tax is worked out",
    regime: "New tax regime, tax year {year}",
    grossSalary: "Gross salary",
    standardDeduction: "Standard deduction",
    taxableIncome: "Taxable income",
    slab: "{from} to {to}",
    slabTop: "Above {from}",
    taxBeforeRebate: "Tax before rebate",
    rebate: "Rebate",
    marginalRelief: "Marginal relief",
    surcharge: "Surcharge",
    cess: "Health and education cess",
    totalTax: "Total income tax",
    noTax: "No income tax at this salary: the rebate covers it in full.",
  },

  explain: {
    ctcNotTakeHome:
      "CTC is what your job costs the employer in a year. It is not what reaches your bank account.",
    notMonthlyCash:
      "Some parts of CTC are never paid as monthly salary: the employer's PF, gratuity and variable pay.",
    basicEstimated:
      "Basic + DA is estimated at {percent}% of fixed CTC because CTC alone doesn't show it. Your payslip may differ.",
    employerPfInCtc:
      "The employer's PF is counted as part of your CTC, as most offer letters do. It goes to your PF account, not your salary.",
    variableNotMonthly:
      "Variable pay may not be paid every month, so it is left out of the monthly figure and added to the yearly one.",
    professionalTaxState:
      "Professional tax depends on your state. Some states charge it and some don't.",
    professionalTaxNotDeductible:
      "Under the new tax regime, professional tax does not reduce your taxable income.",
    tdsSpread: "Income tax is shown spread evenly over 12 months, as TDS usually is.",
    newRegimeOnly: "Income tax is worked out under the new tax regime, the default for salaried people.",
    estimate: "This is an estimate based on the values you entered. Your payslip is the final word.",
    pfCapped: "Your PF counts Basic + DA only up to {ceiling} a month.",
    wagesBelowFloor:
      "Under the Labour Codes, at least {percent}% of pay usually counts as wages for PF, so your PF may be higher than shown.",
    rebateMarginalRelief:
      "Your taxable income is just above {limit}, so marginal relief keeps your tax from exceeding the income above that limit.",
    surchargeMarginalRelief:
      "Marginal relief reduces your surcharge, so crossing the surcharge limit doesn't cost more than the extra income.",
  },

  errors: {
    EMPTY: "Enter an amount.",
    NOT_A_NUMBER: "Enter a valid number.",
    NOT_POSITIVE: "Your CTC must be more than zero.",
    NEGATIVE: "This can't be negative.",
    TOO_LARGE: "CTC can be at most {max} a year.",
    PERCENT_OUT_OF_RANGE: "Enter a percentage in the allowed range.",
    PROFESSIONAL_TAX_TOO_HIGH: "Professional tax can be at most {max} a year.",
    INVALID_PF_MODE: "Choose how your PF is worked out.",
    IMPOSSIBLE_STRUCTURE: "With these values, nothing is left as fixed salary. Check your variable pay.",
    NON_POSITIVE_TAKE_HOME: "With these values, the deductions are more than the monthly salary.",
  },

  /** Field-specific wording for `PERCENT_OUT_OF_RANGE`, which two fields share. */
  fieldErrors: {
    variablePayPercent: "Variable pay can't be negative, and must be less than your whole CTC.",
    pfWagesPercent: "Basic + DA must be more than zero, and can't be more than your fixed CTC.",
  },

  seo: {
    title: "Salary Calculator — CTC to In-Hand Salary",
    description:
      "Calculate your monthly in-hand salary from your annual CTC. See PF, professional tax, variable pay and income tax under the new regime in a clear take-home breakdown for India.",
    ogAlt: "UtilityBazaar Salary Calculator — CTC to in-hand salary",
  },

  content: {
    heading: "About CTC and in-hand salary",

    whatTitle: "What is CTC?",
    whatBody:
      "CTC (cost to company) is the total amount your employer expects to spend on you in a year. It is the figure on your offer letter, but it is not the money that reaches your bank account each month: part of it may be paid only once a year, and part of it never reaches you as salary at all.",

    lowerTitle: "Why is in-hand salary lower than CTC ÷ 12?",
    lowerBody:
      "A few things can sit between your CTC and your monthly pay. The employer's PF contribution, and a gratuity provision if your CTC includes one, are counted inside CTC but go to your PF account or are set aside for later. Variable pay or a bonus may be paid only once or twice a year. From the salary that is paid each month, your own PF, professional tax (in states that charge it) and income tax are then deducted. Not every salary has all of these, and the calculator includes only the ones that apply to your inputs.",

    howTitle: "How the calculator estimates your take-home",
    howBody:
      "It starts with your annual CTC and takes out the parts that are not paid as monthly salary: variable pay, the employer's PF and, if you include it, gratuity. What remains is your gross salary. Your PF and professional tax are deducted, income tax is worked out under the new tax regime, and the rest is your take-home, shown for a regular month and for the whole year.",

    estimateTitle: "Why the result is an estimate",
    estimateBody:
      "Your exact take-home depends on your salary structure, which a CTC figure alone does not show. The calculator estimates Basic + DA unless you enter it, counts the employer's PF as part of CTC, treats variable pay as a yearly amount, uses the professional tax you enter, and works out tax under the current new tax regime. Set these to match your offer letter for the closest figure; your payslip has the final numbers.",

    assumptionsHeading: "What this result assumes",

    privacyNote:
      "Everything is worked out in your browser — nothing you enter is sent to a server or saved.",
    privacyLinkText: "Read the privacy policy →",

    faqHeading: "Common questions",
    faq: [
      {
        q: "What is the difference between CTC and in-hand salary?",
        a: "CTC is the total your employer spends on you in a year, including parts that are not paid as monthly salary. In-hand salary is what reaches your bank account each month after those parts are set aside and your own PF, professional tax and income tax are deducted.",
      },
      {
        q: "How is monthly in-hand salary calculated from CTC?",
        a: "Take out variable pay, the employer's PF and any gratuity from your CTC to get your gross salary. Deduct your PF, professional tax and income tax, then divide what is left by 12 for a regular month.",
      },
      {
        q: "Does CTC include employer PF and gratuity?",
        a: "Often, yes. Most offer letters count the employer's PF contribution inside CTC, and some include a gratuity provision as well. Neither is paid to you as monthly salary. The calculator counts the employer's PF as part of CTC and lets you choose whether your CTC includes gratuity.",
      },
      {
        q: "Is income tax included in the salary calculator?",
        a: "Yes. Income tax is worked out under the new tax regime, the default for salaried people, including the standard deduction, rebate and cess. It is shown spread evenly over the year, as TDS usually is.",
      },
      {
        q: "Why is my in-hand salary lower than my CTC divided by 12?",
        a: "Because CTC includes money that is not paid to you as monthly salary, such as the employer's PF, gratuity and variable pay, and because your own PF, professional tax and income tax are deducted from the salary that is paid.",
      },
      {
        q: "Is the salary calculator accurate?",
        a: "It follows current PF and income tax rules and shows every step, but it is an estimate: your real take-home depends on your exact salary structure. Enter your Basic + DA, variable pay and professional tax from your offer letter for the closest result.",
      },
    ],
  },
};
