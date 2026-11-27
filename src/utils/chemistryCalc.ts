// Periodic table standard atomic weights (IUPAC)
const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008, He: 4.0026,
  Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.18,
  Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948,
  K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938,
  Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.63,
  As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798,
  Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224, Nb: 92.906, Mo: 95.95, Tc: 98,
  Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71,
  Sb: 121.76, Te: 127.6, I: 126.9, Xe: 131.29,
  Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24, Sm: 150.36,
  Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.5, Ho: 164.93, Er: 167.26, Tm: 168.93,
  Yb: 173.05, Lu: 174.97, Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23,
  Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59, Tl: 204.38, Pb: 207.2, Bi: 208.98,
  Th: 232.04, U: 238.03,
};

function parseSegmentMass(segment: string): number | null {
  const clean = segment.trim();
  if (!clean) return 0;

  let index = 0;

  // Leading stoichiometric multiplier (e.g. "5H2O" -> multiplier 5)
  let leadingMult = 1;
  const leadMatch = clean.match(/^(\d+(?:\.\d+)?)/);
  if (leadMatch) {
    leadingMult = parseFloat(leadMatch[1]);
    index = leadMatch[1].length;
  }

  const stack: Record<string, number>[] = [{}];

  while (index < clean.length) {
    const ch = clean[index];

    if (ch === '(' || ch === '[') {
      stack.push({});
      index++;
    } else if (ch === ')' || ch === ']') {
      if (stack.length < 2) return null;
      index++;
      let multStr = '';
      while (index < clean.length && /[\d.]/.test(clean[index])) {
        multStr += clean[index];
        index++;
      }
      const mult = multStr ? parseFloat(multStr) : 1;
      const top = stack.pop()!;
      const target = stack[stack.length - 1];
      for (const [el, count] of Object.entries(top)) {
        target[el] = (target[el] || 0) + count * mult;
      }
    } else if (/[A-Z]/.test(ch)) {
      let el = ch;
      index++;
      while (index < clean.length && /[a-z]/.test(clean[index])) {
        el += clean[index];
        index++;
      }
      if (!(el in ATOMIC_WEIGHTS)) return null;

      let countStr = '';
      while (index < clean.length && /[\d.]/.test(clean[index])) {
        countStr += clean[index];
        index++;
      }
      const count = countStr ? parseFloat(countStr) : 1;
      const target = stack[stack.length - 1];
      target[el] = (target[el] || 0) + count;
    } else if (/\s/.test(ch)) {
      index++;
    } else {
      return null;
    }
  }

  if (stack.length !== 1) return null;

  let total = 0;
  for (const [el, count] of Object.entries(stack[0])) {
    total += (ATOMIC_WEIGHTS[el] || 0) * count;
  }

  return total > 0 ? Math.round(total * leadingMult * 100) / 100 : null;
}

/**
 * Computes molar mass (g/mol) from a chemical formula string.
 * Supports parentheses, brackets, and hydrates like CuSO4·5H2O or FeSO4.7H2O.
 */
export function calculateMolarMass(formula?: string): number | null {
  if (!formula) return null;
  // Normalize subscript digits and whitespace
  const subscriptMap: Record<string, string> = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  };
  let normalized = formula
    .trim()
    .replace(/[₀-₉]/g, m => subscriptMap[m] || m)
    .replace(/,/g, '.')
    .replace(/\s+/g, '');

  if (!normalized) return null;

  // Split hydrates on ·, •, *, or dot between formula parts (not decimal dot inside numbers)
  const parts = normalized.split(/[·•*]|(?<=[A-Za-z)\]])\.(?=\d|[A-Z])/);
  let total = 0;
  for (const part of parts) {
    const mass = parseSegmentMass(part);
    if (mass === null || mass === 0) return null;
    total += mass;
  }
  return total > 0 ? Math.round(total * 100) / 100 : null;
}

/**
 * Returns IDs of chemicals that appear to have duplicates (same normalized formula, CAS, or English/Arabic name).
 */
export function findDuplicateChemicalIds<
  T extends { id: string; nameEn?: string; nameAr?: string; formula?: string; casNumber?: string }
>(chemicals: T[]): Set<string> {
  const byKey = new Map<string, string[]>();

  const register = (key: string, id: string) => {
    if (!key) return;
    const list = byKey.get(key) || [];
    list.push(id);
    byKey.set(key, list);
  };

  for (const c of chemicals) {
    const cas = (c.casNumber || '').trim();
    if (cas && cas !== '—' && cas.length >= 5) {
      register(`cas:${cas}`, c.id);
    }
    const en = (c.nameEn || '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (en.length >= 3) {
      register(`en:${en}`, c.id);
    }
    const ar = (c.nameAr || '').trim().replace(/\s+/g, ' ');
    if (ar.length >= 3) {
      register(`ar:${ar}`, c.id);
    }
  }

  const duplicates = new Set<string>();
  for (const ids of byKey.values()) {
    if (ids.length > 1) {
      ids.forEach(id => duplicates.add(id));
    }
  }
  return duplicates;
}
