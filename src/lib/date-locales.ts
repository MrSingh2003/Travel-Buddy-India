import {
  enUS,
  hi,
  bn,
  gu,
  kn,
  ta,
  te,
} from "date-fns/locale";

export function getDateFnsLocale(language: string) {
  switch (language) {
    case "hi":
      return hi;
    case "bn":
      return bn;
    case "gu":
      return gu;
    case "kn":
      return kn;
    case "ml":
      return hi;
    case "mr":
      return hi;
    case "pa":
      return hi;
    case "ta":
      return ta;
    case "te":
      return te;
    default:
      return enUS;
  }
}
