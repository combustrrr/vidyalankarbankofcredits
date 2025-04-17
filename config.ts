/**
 * Central configuration file for Vidyalankar Bank of Credits
 * 
 * This file serves as the single source of truth for program structure definitions,
 * including verticals, baskets, and credit mappings.
 * 
 * When changes to program structure are needed, update this file only,
 * and the changes will propagate throughout the application.
 */

// Interface for semester-wise credit recommendation
export interface SemesterCredits {
  [semester: number]: number;
}

// Interface for basket definition
export interface Basket {
  name: string;
  code: string;
  creditsBySemseter: SemesterCredits;
  totalCredits: number;
}

// Interface for vertical definition
export interface Vertical {
  name: string;
  code: string;
  baskets: Basket[];
  creditsBySemseter: SemesterCredits;
  totalCredits: number;
}

// Program structure configuration
export const programStructure: Vertical[] = [
  {
    name: 'BSC/ ESC',
    code: 'BSC',
    creditsBySemseter: {
      1: 12,
      2: 9,
      3: 3,
      4: 3,
      5: 0,
      6: 0,
      7: 0,
      8: 0
    },
    totalCredits: 27,
    baskets: [
      {
        name: 'Basic Science (BS)',
        code: 'BSC',
        creditsBySemseter: {
          1: 6,
          2: 3,
          3: 3,
          4: 3,
          5: 0,
          6: 0,
          7: 0,
          8: 0
        },
        totalCredits: 15
      },
      {
        name: 'Engineering Science (ES)',
        code: 'ESC',
        creditsBySemseter: {
          1: 6,
          2: 6,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 0
        },
        totalCredits: 12
      }
    ]
  },
  {
    name: 'Program Courses',
    code: 'PCC',
    creditsBySemseter: {
      1: 0,
      2: 0,
      3: 9,
      4: 12,
      5: 15,
      6: 15,
      7: 12,
      8: 0
    },
    totalCredits: 63,
    baskets: [
      {
        name: 'Programme Core Course (PCC)',
        code: 'PCC',
        creditsBySemseter: {
          1: 0,
          2: 0,
          3: 9,
          4: 12,
          5: 12,
          6: 9,
          7: 3,
          8: 0
        },
        totalCredits: 45
      },
      {
        name: 'Programme Elective Course (PEC)',
        code: 'PEC',
        creditsBySemseter: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 3,
          6: 6,
          7: 9,
          8: 0
        },
        totalCredits: 18
      }
    ]
  },
  {
    name: 'Multidisciplinary Courses',
    code: 'MDC',
    creditsBySemseter: {
      1: 0,
      2: 2,
      3: 3,
      4: 3,
      5: 6,
      6: 3,
      7: 5,
      8: 0
    },
    totalCredits: 22,
    baskets: [
      {
        name: 'Multidisciplinary Minor (MDM)',
        code: 'MDM',
        creditsBySemseter: {
          1: 0,
          2: 2,
          3: 3,
          4: 3,
          5: 3,
          6: 3,
          7: 0,
          8: 0
        },
        totalCredits: 14
      },
      {
        name: 'Open Elective (OE)',
        code: 'OE',
        creditsBySemseter: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 3,
          6: 0,
          7: 5,
          8: 0
        },
        totalCredits: 8
      }
    ]
  },
  {
    name: 'Skill Courses',
    code: 'SKILL',
    creditsBySemseter: {
      1: 3,
      2: 3,
      3: 2,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0
    },
    totalCredits: 8,
    baskets: [
      {
        name: 'Vocational and Skill Enhancement Course (VSEC)',
        code: 'VSEC',
        creditsBySemseter: {
          1: 3,
          2: 3,
          3: 2,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 0
        },
        totalCredits: 8
      }
    ]
  },
  {
    name: 'Humanities Social Science and Management (HSSM)',
    code: 'HSSM',
    creditsBySemseter: {
      1: 6,
      2: 3,
      3: 0,
      4: 0,
      5: 3,
      6: 3,
      7: 3,
      8: 6
    },
    totalCredits: 24,
    baskets: [
      {
        name: 'Ability Enhancement Course (AEC)',
        code: 'AEC',
        creditsBySemseter: {
          1: 3,
          2: 1,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 3
        },
        totalCredits: 7
      },
      {
        name: 'Entrepreneurship/ Economics/ Management Course (EEMC)',
        code: 'EEMC',
        creditsBySemseter: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 3,
          6: 3,
          7: 3,
          8: 3
        },
        totalCredits: 12
      },
      {
        name: 'Indian Knowledge System (IKS)',
        code: 'IKS',
        creditsBySemseter: {
          1: 0,
          2: 2,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 0
        },
        totalCredits: 2
      },
      {
        name: 'Value Education Course (VEC)',
        code: 'VEC',
        creditsBySemseter: {
          1: 3,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 0
        },
        totalCredits: 3
      }
    ]
  },
  {
    name: 'Experiential Learning Courses',
    code: 'ELC',
    creditsBySemseter: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 2,
      6: 4,
      7: 2,
      8: 15
    },
    totalCredits: 23,
    baskets: [
      {
        name: 'Research Methodology (RM)',
        code: 'RM',
        creditsBySemseter: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 3
        },
        totalCredits: 3
      },
      {
        name: 'Comm. Engg. Project (CEP)/ Field Project (FP)',
        code: 'CEP',
        creditsBySemseter: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 2,
          7: 0,
          8: 0
        },
        totalCredits: 2
      },
      {
        name: 'Project',
        code: 'PROJ',
        creditsBySemseter: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 6
        },
        totalCredits: 6
      },
      {
        name: 'Internship/ OJT',
        code: 'INTP',
        creditsBySemseter: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 2,
          6: 2,
          7: 2,
          8: 6
        },
        totalCredits: 12
      }
    ]
  },
  {
    name: 'Liberal Learning Courses',
    code: 'LLC',
    creditsBySemseter: {
      1: 0,
      2: 2,
      3: 2,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0
    },
    totalCredits: 4,
    baskets: [
      {
        name: 'Co-Curricular Courses (CC)',
        code: 'CC',
        creditsBySemseter: {
          1: 0,
          2: 2,
          3: 2,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 0
        },
        totalCredits: 4
      }
    ]
  }
];

// Helper functions to access program structure data

/**
 * Get all vertical names
 */
export const getVerticals = (): string[] => {
  return programStructure.map(vertical => vertical.name);
};

/**
 * Get baskets for a specific vertical
 */
export const getBasketsForVertical = (verticalName: string): string[] => {
  const vertical = programStructure.find(v => v.name === verticalName);
  return vertical ? vertical.baskets.map(basket => basket.name) : [];
};

/**
 * Get the code for a vertical
 */
export const getVerticalCode = (verticalName: string): string => {
  const vertical = programStructure.find(v => v.name === verticalName);
  return vertical?.code || verticalName.substring(0, 3).toUpperCase();
};

/**
 * Get the code for a basket
 */
export const getBasketCode = (basketName: string): string => {
  for (const vertical of programStructure) {
    const basket = vertical.baskets.find(b => b.name === basketName);
    if (basket) return basket.code;
  }
  return basketName.substring(0, 3).toUpperCase();
};

/**
 * Get recommended credits for a vertical and semester
 */
export const getRecommendedCredits = (verticalName: string, semester: number): number => {
  const vertical = programStructure.find(v => v.name === verticalName);
  return vertical?.creditsBySemseter[semester] || 0;
};

/**
 * Get recommended credits for a basket and semester
 */
export const getBasketRecommendedCredits = (basketName: string, semester: number): number => {
  for (const vertical of programStructure) {
    const basket = vertical.baskets.find(b => b.name === basketName);
    if (basket) return basket.creditsBySemseter[semester] || 0;
  }
  return 0;
};

/**
 * Check if admin can create a new vertical
 * In this case, we return true as you mentioned admins should be able to create new verticals
 */
export const canAdminCreateVertical = (): boolean => {
  return true;
};